'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Navigation,
  Battery,
  Wifi,
  WifiOff,
  Clock,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Settings,
} from 'lucide-react';
import { getUser, fetchWithAuth } from '@/lib/api';
import { useGeolocation } from '@/lib/useGeolocation';
import StatusBadge from '@/components/StatusBadge';
import IOSBanner from '@/components/IOSBanner';
import BottomNav from '@/components/BottomNav';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sosActive, setSosActive] = useState(false);
  const [sosId, setSosId] = useState<string | null>(null);

  const geo = useGeolocation();

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace('/login');
    } else {
      setUser(u);
      setLoading(false);
    }
  }, [router]);

  const handleToggleSharing = async () => {
    if (geo.status === 'sharing_active') {
      await geo.stopSharing();
    } else {
      await geo.startSharing();
    }
  };

  const handleTriggerSos = async () => {
    try {
      let lat = geo.latitude;
      let lng = geo.longitude;

      if (!lat || !lng) {
        // Force immediate position capture
        const pos: any = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      const res = await fetchWithAuth('/api/sos/trigger', {
        method: 'POST',
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          message: 'Emergency SOS sent from iOS PWA',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSosActive(true);
        setSosId(data.alert?.alertId);
      }
    } catch (err: any) {
      alert(`Could not trigger SOS: ${err.message || 'GPS coordinate error'}`);
    }
  };

  const handleCancelSos = async () => {
    if (!sosId) return;
    try {
      await fetchWithAuth(`/api/sos/${sosId}/cancel`, { method: 'PATCH' });
      setSosActive(false);
      setSosId(null);
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isSharing = geo.status === 'sharing_active';

  return (
    <main className="max-w-md mx-auto p-4 space-y-4 pt-safe">
      {/* Top Header */}
      <header className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Hi, {user?.name || 'Family Member'}
          </h1>
          <p className="text-xs text-slate-500">
            {user?.relationship ? `${user.relationship} • ` : ''}Family Group
          </p>
        </div>
        <StatusBadge status={geo.status} />
      </header>

      {/* iOS Guidelines & Safari Install Helper */}
      <IOSBanner />

      {/* Main Sharing Control Card */}
      <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Location Sharing</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isSharing ? 'Active voluntary GPS sharing' : 'Sharing is currently off'}
            </p>
          </div>
          <button
            onClick={handleToggleSharing}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              isSharing ? 'bg-blue-600' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isSharing ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {geo.errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3">
            {geo.errorMessage}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            End-to-End Voluntary
          </span>
          <span>Only visible to your family</span>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-2 gap-3">
        {/* GPS Accuracy */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>GPS Accuracy</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            {geo.accuracy ? `±${geo.accuracy.toFixed(1)} m` : 'No Fix'}
          </p>
        </div>

        {/* Device Battery */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Battery className="w-3.5 h-3.5 text-emerald-600" />
            <span>Device Battery</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            {geo.batteryPercentage !== null ? `${geo.batteryPercentage}%` : 'Shared'}
          </p>
        </div>

        {/* Connectivity */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            {geo.isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span>Network</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            {geo.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>

        {/* Last Update */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Last Update</span>
          </div>
          <p className="text-xs font-semibold text-slate-900 truncate">
            {geo.lastUpdated ? geo.lastUpdated.toLocaleTimeString() : 'Never'}
          </p>
        </div>
      </section>

      {/* Emergency SOS Section */}
      <section className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-900">Emergency SOS</h3>
            <p className="text-xs text-rose-700">Send instant priority alert with GPS to family</p>
          </div>
        </div>

        {sosActive ? (
          <div className="space-y-2">
            <div className="bg-rose-100 rounded-xl p-3 text-xs text-rose-900 font-medium">
              🚨 SOS Alert is ACTIVE! Your family has been notified.
            </div>
            <button
              onClick={handleCancelSos}
              className="w-full py-2.5 rounded-xl bg-white border border-rose-300 text-rose-700 font-semibold text-xs hover:bg-rose-50 transition-colors"
            >
              Cancel False Alarm
            </button>
          </div>
        ) : (
          <button
            onClick={handleTriggerSos}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition-colors"
          >
            SEND EMERGENCY SOS
          </button>
        )}
      </section>

      {/* Bottom Navigation Bar */}
      <BottomNav />
    </main>
  );
}
