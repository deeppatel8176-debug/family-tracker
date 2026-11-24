'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Filter, Navigation, Clock, User } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { fetchWithAuth, getAdminUser } from '@/lib/api';

function LocationHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get('userId') || '';

  const [members, setMembers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(initialUserId);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const admin = getAdminUser();
    if (!admin) {
      router.replace('/login');
      return;
    }
    loadMembers();
  }, [router]);

  useEffect(() => {
    if (selectedUserId) {
      loadHistory();
    }
  }, [selectedUserId, selectedDate]);

  const loadMembers = async () => {
    try {
      const res = await fetchWithAuth('/api/family/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
        if (!selectedUserId && data.length > 0) {
          setSelectedUserId(data[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      const start = new Date(`${selectedDate}T00:00:00.000Z`).toISOString();
      const end = new Date(`${selectedDate}T23:59:59.999Z`).toISOString();
      const res = await fetchWithAuth(
        `/api/locations/history?userId=${selectedUserId}&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`
      );
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const points = historyData?.points || [];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Location History"
          subtitle="View authorized chronologically recorded breadcrumb points"
        />

        <main className="p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Query Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">Member:</span>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="p-1.5 border border-slate-200 rounded-xl bg-white font-medium"
              >
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.relationship || 'Member'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-semibold text-slate-700">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="p-1.5 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <button
              onClick={loadHistory}
              className="ml-auto px-4 py-1.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              Search
            </button>
          </div>

          {/* History Data Table & Route Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recorded GPS Breadcrumbs ({points.length} points)
                </h3>
                <p className="text-xs text-slate-500">Only authorized voluntary locations are stored</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : points.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No location history found for this member on {selectedDate}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Coordinates (Lat, Lng)</th>
                      <th className="pb-3">Accuracy</th>
                      <th className="pb-3">Speed</th>
                      <th className="pb-3">Battery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {points.map((pt: any, idx: number) => (
                      <tr key={pt.id || idx} className="hover:bg-slate-50/80">
                        <td className="py-3 font-semibold text-slate-800">
                          {new Date(pt.recordedAt).toLocaleTimeString()}
                        </td>
                        <td className="py-3 font-mono text-slate-600">
                          {pt.latitude.toFixed(6)}, {pt.longitude.toFixed(6)}
                        </td>
                        <td className="py-3 text-slate-600">±{pt.accuracy?.toFixed(1)}m</td>
                        <td className="py-3 text-slate-600">
                          {pt.speed !== null && pt.speed !== undefined
                            ? `${pt.speed.toFixed(1)} m/s`
                            : 'Stationary'}
                        </td>
                        <td className="py-3 text-slate-600">
                          {pt.batteryPercentage !== null && pt.batteryPercentage !== undefined
                            ? `${pt.batteryPercentage}%`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading History...</div>}>
      <LocationHistoryContent />
    </Suspense>
  );
}
