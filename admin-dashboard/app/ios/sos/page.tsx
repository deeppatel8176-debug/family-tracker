'use client';

import { useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { fetchWithAuth } from '@/lib/memberApi';
import BottomNav from '@/components/ios/BottomNav';

export default function SosPage() {
  const [active, setActive] = useState(false);
  const [alertId, setAlertId] = useState<string | null>(null);
  const [message, setMessage] = useState('Immediate assistance requested!');
  const [loading, setLoading] = useState(false);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      const pos: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const res = await fetchWithAuth('/api/sos/trigger', {
        method: 'POST',
        body: JSON.stringify({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          message,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActive(true);
        setAlertId(data.alert?.alertId);
      }
    } catch (err: any) {
      alert(`Emergency SOS failed: ${err.message || 'Check location permissions'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!alertId) return;
    try {
      await fetchWithAuth(`/api/sos/${alertId}/cancel`, { method: 'PATCH' });
      setActive(false);
      setAlertId(null);
    } catch (_) {}
  };

  return (
    <main className="max-w-md mx-auto p-4 space-y-6 pt-safe text-center">
      <header className="py-2">
        <h1 className="text-xl font-bold text-rose-600">Emergency SOS</h1>
        <p className="text-xs text-slate-500">1-Touch Emergency Distress Signal</p>
      </header>

      {/* Big Round Push Button */}
      <div className="py-6 flex justify-center">
        <button
          onClick={active ? handleCancel : handleTrigger}
          disabled={loading}
          className={`w-48 h-48 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-transform active:scale-95 ${
            active
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
              : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
          }`}
        >
          {active ? (
            <>
              <ShieldAlert className="w-14 h-14 mb-2 animate-bounce" />
              <span className="text-base font-bold">CANCEL ALARM</span>
              <span className="text-[11px] opacity-90 mt-1">Tap to cancel</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-14 h-14 mb-2" />
              <span className="text-xl font-black tracking-wider">SOS</span>
              <span className="text-[11px] opacity-90 mt-1">HOLD / TAP</span>
            </>
          )}
        </button>
      </div>

      {!active ? (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-left space-y-2">
          <label className="text-xs font-semibold text-slate-700">Optional Emergency Note</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full text-xs p-2.5 border border-slate-200 rounded-xl"
          />
        </div>
      ) : (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 p-4 rounded-2xl text-xs font-medium leading-relaxed">
          🚨 Active SOS Broadcast! Your family administrator has been alerted with your exact GPS coordinates and audio-visual siren.
        </div>
      )}

      <BottomNav />
    </main>
  );
}
