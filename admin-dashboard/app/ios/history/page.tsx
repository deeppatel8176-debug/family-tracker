'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Navigation } from 'lucide-react';
import { getUser, fetchWithAuth } from '@/lib/memberApi';
import BottomNav from '@/components/ios/BottomNav';

export default function HistoryPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [points, setPoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace('/ios/login');
      return;
    }
    loadHistory(selectedDate);
  }, [router, selectedDate]);

  const loadHistory = async (dateStr: string) => {
    setLoading(true);
    try {
      const start = new Date(`${dateStr}T00:00:00.000Z`).toISOString();
      const end = new Date(`${dateStr}T23:59:59.999Z`).toISOString();
      const res = await fetchWithAuth(
        `/api/locations/history?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`
      );
      if (res.ok) {
        const data = await res.json();
        setPoints(data.points || []);
      }
    } catch (_) {
      setPoints([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 space-y-4 pt-safe">
      <header className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Location History</h1>
          <p className="text-xs text-slate-500">Authorized voluntary recorded locations</p>
        </div>
      </header>

      {/* Date Picker Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>Select Date</span>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-xs font-medium border border-slate-200 rounded-lg px-2 py-1"
        />
      </div>

      <div className="text-xs text-slate-500 font-medium px-1">
        {points.length} locations recorded on this day
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : points.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm font-semibold text-slate-700">No recorded history for this date</p>
          <p className="text-xs text-slate-500 mt-1">
            Locations are only saved when sharing is explicitly active.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {points.map((pt, idx) => (
            <div
              key={pt.id || idx}
              className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">
                    {pt.latitude.toFixed(5)}, {pt.longitude.toFixed(5)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Accuracy: ±{pt.accuracy?.toFixed(1)}m
                  </p>
                </div>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">
                {new Date(pt.recordedAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
