'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ShieldAlert, MapPin, EyeOff, Info } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { fetchWithAuth, getAdminUser } from '@/lib/api';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const admin = getAdminUser();
    if (!admin) {
      router.replace('/login');
      return;
    }
    loadNotifications();
  }, [router]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/dashboard/recent-activity');
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'sos':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'geofence_enter':
      case 'geofence_exit':
        return <MapPin className="w-5 h-5 text-blue-600" />;
      case 'sharing_stopped':
        return <EyeOff className="w-5 h-5 text-slate-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Notifications & Safety Feed"
          subtitle="Audit log of safe zone arrivals, emergency triggers and sharing updates"
        />

        <main className="p-4 sm:p-8 pb-24 lg:pb-8 space-y-6 flex-1 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Activity Log</h2>

            <div className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center">
                  No notifications recorded yet.
                </p>
              ) : (
                notifications.map((n) => (
                  <div key={n._id} className="py-4 flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-xs">{n.title}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
