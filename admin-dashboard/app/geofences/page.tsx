'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Plus, Trash2, Edit, MapPin } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { fetchWithAuth, getAdminUser } from '@/lib/api';

export default function GeofencesPage() {
  const router = useRouter();
  const [geofences, setGeofences] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('37.7749');
  const [longitude, setLongitude] = useState('-122.4194');
  const [radius, setRadius] = useState('200');

  useEffect(() => {
    const admin = getAdminUser();
    if (!admin) {
      router.replace('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fenceRes, eventRes] = await Promise.all([
        fetchWithAuth('/api/geofences'),
        fetchWithAuth('/api/geofences/events'),
      ]);

      if (fenceRes.ok) setGeofences(await fenceRes.json());
      if (eventRes.ok) setEvents(await eventRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/api/geofences', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          radius: parseInt(radius, 10),
          isActive: true,
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setName('');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this Safe Zone?')) return;
    try {
      const res = await fetchWithAuth(`/api/geofences/${id}`, { method: 'DELETE' });
      if (res.ok) loadData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Safe Zones & Geofencing"
          subtitle="Configure perimeter boundaries for automatic arrival and departure alerts"
        />

        <main className="p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Configured Safe Zones ({geofences.length})</h2>
              <p className="text-xs text-slate-500">Perimeters are checked during active location updates</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              <span>Create Safe Zone</span>
            </button>
          </div>

          {/* Safe Zones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {geofences.map((g) => (
              <div
                key={g._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{g.name}</h3>
                      <p className="text-xs text-slate-500">{g.radius}m perimeter radius</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(g._id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl font-mono text-[11px] text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {g.latitude.toFixed(5)}, {g.longitude.toFixed(5)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Event Logs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Recent Geofence Arrival / Departure Events</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3">Event Time</th>
                    <th className="pb-3">Member</th>
                    <th className="pb-3">Safe Zone</th>
                    <th className="pb-3">Event Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No geofence events logged yet.
                      </td>
                    </tr>
                  ) : (
                    events.map((ev: any) => (
                      <tr key={ev._id} className="hover:bg-slate-50/80">
                        <td className="py-3 font-semibold text-slate-800">
                          {new Date(ev.recordedAt).toLocaleString()}
                        </td>
                        <td className="py-3 font-medium text-slate-900">{ev.userId?.name}</td>
                        <td className="py-3 text-slate-600">{ev.geofenceId?.name}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                              ev.eventType === 'enter'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {ev.eventType}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Safe Zone</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Home, School, Office"
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Radius (meters)</label>
                <input
                  type="number"
                  required
                  min={50}
                  max={5000}
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Safe Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
