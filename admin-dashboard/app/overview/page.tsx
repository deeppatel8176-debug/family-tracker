'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Navigation,
  EyeOff,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Activity,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import { fetchWithAuth, getAdminUser } from '@/lib/api';
import { getAdminSocket } from '@/lib/socket';

export default function OverviewPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const admin = getAdminUser();
    if (!admin) {
      router.replace('/login');
      return;
    }

    loadDashboardData();

    // Socket.IO real-time listener for instant card refresh
    const socket = getAdminSocket();
    if (socket) {
      socket.on('location:updated', () => loadDashboardData());
      socket.on('sos:alert', () => loadDashboardData());
      socket.on('geofence:entered', () => loadDashboardData());
      socket.on('geofence:exited', () => loadDashboardData());
      socket.on('member:sharing-status', () => loadDashboardData());
    }

    return () => {
      if (socket) {
        socket.off('location:updated');
        socket.off('sos:alert');
        socket.off('geofence:entered');
        socket.off('geofence:exited');
        socket.off('member:sharing-status');
      }
    };
  }, [router]);

  const loadDashboardData = async () => {
    try {
      const [overviewRes, memberStatusRes] = await Promise.all([
        fetchWithAuth('/api/dashboard/overview'),
        fetchWithAuth('/api/dashboard/member-status'),
      ]);

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setStats(data);
      }
      if (memberStatusRes.ok) {
        const memberData = await memberStatusRes.json();
        setMembers(memberData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Family Dashboard Overview"
          subtitle="Real-time status, active sharing metrics and safety alerts"
          activeSosCount={stats?.activeSosAlerts || 0}
        />

        <main className="p-4 sm:p-8 pb-24 lg:pb-8 space-y-8 flex-1 overflow-y-auto">
          {/* 6 Core Stat Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Total Members"
              value={stats?.totalFamilyMembers ?? 0}
              subtitle="Registered accounts"
              icon={Users}
              variant="blue"
            />
            <StatCard
              title="Currently Sharing"
              value={stats?.membersCurrentlySharing ?? 0}
              subtitle="Active live pulses"
              icon={Navigation}
              variant="emerald"
            />
            <StatCard
              title="Not Sharing"
              value={stats?.membersNotSharing ?? 0}
              subtitle="Stopped or paused"
              icon={EyeOff}
              variant="slate"
            />
            <StatCard
              title="Stale Locations"
              value={stats?.membersWithStaleLocations ?? 0}
              subtitle="> 5 min since pulse"
              icon={Clock}
              variant="amber"
            />
            <StatCard
              title="Active SOS Alerts"
              value={stats?.activeSosAlerts ?? 0}
              subtitle="Immediate distress"
              icon={AlertTriangle}
              variant={stats?.activeSosAlerts > 0 ? 'rose' : 'slate'}
            />
            <StatCard
              title="Safe Zones"
              value={stats?.totalSafeZones ?? 0}
              subtitle="Geofence perimeters"
              icon={ShieldCheck}
              variant="emerald"
            />
          </section>

          {/* Quick Actions & Live Map Teaser */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Family Status Snapshot */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Family Members Status</h2>
                  <p className="text-xs text-slate-500">Live voluntary location status of each device</p>
                </div>
                <Link
                  href="/map"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Open Full Live Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-medium">
                      <th className="pb-3">Member</th>
                      <th className="pb-3">Relationship</th>
                      <th className="pb-3">Sharing Status</th>
                      <th className="pb-3">Battery</th>
                      <th className="pb-3">Accuracy</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-400">
                          No family members yet. Go to Family Members to generate invitations.
                        </td>
                      </tr>
                    ) : (
                      members.map((m) => {
                        const isSharing = m.sharingStatus === 'active';
                        const isStale = m.isStale;

                        return (
                          <tr key={m.userId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 font-semibold text-slate-900 flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  isSharing
                                    ? isStale
                                      ? 'bg-amber-400'
                                      : 'bg-emerald-500 animate-pulse'
                                    : 'bg-slate-300'
                                }`}
                              />
                              {m.name}
                            </td>
                            <td className="py-3 text-slate-500">{m.relationship || 'Member'}</td>
                            <td className="py-3">
                              {isSharing ? (
                                isStale ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px]">
                                    Stale
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                                    Live
                                  </span>
                                )
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                                  Stopped
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-slate-600">
                              {m.batteryPercentage !== null ? `${m.batteryPercentage}%` : '—'}
                            </td>
                            <td className="py-3 text-slate-600">
                              {m.accuracy ? `±${m.accuracy.toFixed(1)}m` : '—'}
                            </td>
                            <td className="py-3 text-right">
                              <Link
                                href={`/history?userId=${m.userId}`}
                                className="text-blue-600 font-medium hover:underline text-[11px]"
                              >
                                History
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Notifications / Activity Feed */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
                  <p className="text-xs text-slate-500">Live safety events & geofencing</p>
                </div>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                {stats?.recentActivity?.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-8">
                    No safety events logged yet.
                  </p>
                ) : (
                  stats?.recentActivity?.map((act: any) => (
                    <div
                      key={act._id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{act.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(act.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{act.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
