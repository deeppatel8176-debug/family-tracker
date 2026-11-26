'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, MapPin, Clock, ShieldAlert } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { fetchWithAuth, getAdminUser } from '@/lib/api';
import { getAdminSocket } from '@/lib/socket';

export default function SosPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const admin = getAdminUser();
    if (!admin) {
      router.replace('/login');
      return;
    }
    loadAlerts();

    const socket = getAdminSocket();
    if (socket) {
      socket.on('sos:alert', (newAlert: any) => {
        loadAlerts();
      });
      socket.on('sos:acknowledged', () => loadAlerts());
      socket.on('sos:cancelled', () => loadAlerts());
    }

    return () => {
      if (socket) {
        socket.off('sos:alert');
        socket.off('sos:acknowledged');
        socket.off('sos:cancelled');
      }
    };
  }, [router]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/sos/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetchWithAuth(`/api/sos/${id}/acknowledge`, { method: 'PATCH' });
      if (res.ok) loadAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'active');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Emergency SOS Alerts"
          subtitle="Immediate distress triggers and family safety response"
          activeSosCount={activeAlerts.length}
        />

        <main className="p-4 sm:p-8 pb-24 lg:pb-8 space-y-6 flex-1 overflow-y-auto">
          {activeAlerts.length > 0 && (
            <div className="bg-rose-50 border border-rose-300 rounded-2xl p-5 shadow-sm space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-rose-900">
                    URGENT: {activeAlerts.length} Active Emergency Alert{activeAlerts.length > 1 ? 's' : ''}
                  </h2>
                  <p className="text-xs text-rose-700">
                    A family member has activated their distress signal. Coordinate assistance immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">All Emergency SOS Events</h3>

            <div className="space-y-3">
              {alerts.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center">
                  No emergency SOS alerts on record.
                </p>
              ) : (
                alerts.map((al) => {
                  const isActive = al.status === 'active';
                  const isAck = al.status === 'acknowledged';

                  return (
                    <div
                      key={al._id}
                      className={`p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'bg-rose-50/70 border-rose-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                                isActive
                                  ? 'bg-rose-600 text-white'
                                  : isAck
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {al.status}
                            </span>
                            <span className="font-bold text-slate-900 text-xs">
                              {al.userId?.name || 'Member'}
                            </span>
                            <span className="text-[11px] text-slate-400">•</span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {new Date(al.triggeredAt).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 font-medium">{al.message}</p>

                          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 font-mono">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-blue-600" />
                              {al.latitude.toFixed(5)}, {al.longitude.toFixed(5)}
                            </span>
                            {al.userId?.phone && <span>Phone: {al.userId.phone}</span>}
                          </div>
                        </div>

                        {isActive && (
                          <button
                            onClick={() => handleAcknowledge(al._id)}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Acknowledge Alert</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
