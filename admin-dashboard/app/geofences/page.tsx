'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Plus, Trash2, MapPin, ArrowRight, Crosshair, Map } from 'lucide-react';
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
  const [latitude, setLatitude] = useState('21.23016');
  const [longitude, setLongitude] = useState('72.78533');
  const [radius, setRadius] = useState('200');
  const [locating, setLocating] = useState(false);

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

  const handleUseCurrentLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setLocating(false);
      },
      (err) => {
        alert('Could not acquire your location: ' + err.message);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleOpenCreateModal = () => {
    setShowModal(true);
    // Auto-attempt geolocation if available
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
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

        <main className="p-4 sm:p-8 pb-24 lg:pb-8 space-y-6 flex-1 overflow-y-auto">
          {/* Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Configured Safe Zones ({geofences.length})</h2>
              <p className="text-xs text-slate-500">Perimeters are monitored in real-time on the Live Map</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/map"
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Map className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Live Map</span>
              </Link>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-blue-200"
              >
                <Plus className="w-4 h-4" />
                <span>Create Safe Zone</span>
              </button>
            </div>
          </div>

          {/* Safe Zones Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {geofences.map((g) => (
              <div
                key={g._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                        🛡️
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{g.name}</h3>
                        <p className="text-xs text-slate-500">{g.radius}m perimeter radius</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(g._id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete Safe Zone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl font-mono text-[11px] text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">
                      {g.latitude?.toFixed(5)}, {g.longitude?.toFixed(5)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active Safe Zone
                  </span>
                  <Link
                    href="/map"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                  >
                    <span>View on Map</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}

            {geofences.length === 0 && !loading && (
              <div className="col-span-full bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-2xl">
                  🛡️
                </div>
                <h3 className="text-sm font-bold text-slate-900">No Safe Zones Configured Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Create safe zones like Home, School, or Office. When members enter or leave, you will receive real-time notifications.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Your First Safe Zone</span>
                </button>
              </div>
            )}
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
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <h3 className="text-base font-bold text-slate-900">Create Safe Zone</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Zone Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Home, School, Office"
                  className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Current Location Trigger */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-600">Want to use where you are right now?</span>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Crosshair className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                  <span>{locating ? 'Locating...' : 'Use My GPS'}</span>
                </button>
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
                    placeholder="21.23016"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
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
                    placeholder="72.78533"
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Perimeter Radius (meters)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    min={50}
                    max={5000}
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <span className="text-slate-500 font-medium">meters</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Recommended: 100m - 300m for residential or office perimeter.</p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm shadow-blue-200 transition-colors"
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
