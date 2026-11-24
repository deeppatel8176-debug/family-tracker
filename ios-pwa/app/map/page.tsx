'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser } from '@/lib/api';
import { useGeolocation } from '@/lib/useGeolocation';
import MapView from '@/components/MapView';
import BottomNav from '@/components/BottomNav';
import StatusBadge from '@/components/StatusBadge';

export default function MapPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const geo = useGeolocation();

  useEffect(() => {
    const u = getUser();
    if (!u) router.replace('/login');
    else setUser(u);
  }, [router]);

  return (
    <main className="max-w-md mx-auto p-4 space-y-4 pt-safe">
      <header className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Live Map</h1>
          <p className="text-xs text-slate-500">Your current shared location</p>
        </div>
        <StatusBadge status={geo.status} />
      </header>

      <div className="h-[480px]">
        <MapView
          latitude={geo.latitude}
          longitude={geo.longitude}
          accuracy={geo.accuracy}
          name={user?.name}
        />
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm text-xs text-slate-600 space-y-1">
        <p className="font-semibold text-slate-800">Map Details:</p>
        <p>• Latitude: {geo.latitude ? geo.latitude.toFixed(6) : 'Acquiring...'}</p>
        <p>• Longitude: {geo.longitude ? geo.longitude.toFixed(6) : 'Acquiring...'}</p>
        <p>• Accuracy: {geo.accuracy ? `±${geo.accuracy.toFixed(1)} meters` : 'Pending'}</p>
      </div>

      <BottomNav />
    </main>
  );
}
