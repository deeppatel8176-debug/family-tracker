'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RefreshCw, ShieldCheck, MapPin } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import GoogleMapWrapper, { SafeZone } from '@/components/GoogleMapWrapper';
import MemberDetailDrawer, { SelectedMember } from '@/components/MemberDetailDrawer';
import { fetchWithAuth, getAdminUser } from '@/lib/api';
import { getAdminSocket } from '@/lib/socket';

export default function MapPage() {
  const router = useRouter();
  const [members, setMembers] = useState<SelectedMember[]>([]);
  const [geofences, setGeofences] = useState<SafeZone[]>([]);
  const [showSafeZones, setShowSafeZones] = useState(true);
  const [selectedGeofence, setSelectedGeofence] = useState<SafeZone | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'sharing' | 'stale'>('all');
  const [selectedMember, setSelectedMember] = useState<SelectedMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const admin = getAdminUser();
    if (!admin) {
      router.replace('/login');
      return;
    }

    loadData();

    const socket = getAdminSocket();
    if (socket) {
      socket.on('location:updated', (payload: any) => {
        setMembers((prev) => {
          const index = prev.findIndex((m) => (m.userId || m.id) === payload.userId);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = { ...updated[index], ...payload, recordedAt: payload.recordedAt };
            return updated;
          } else {
            return [...prev, payload];
          }
        });
      });

      socket.on('member:sharing-status', () => loadData());
      socket.on('member:online', () => loadData());
      socket.on('member:offline', () => loadData());
      socket.on('geofence:created', () => loadData());
      socket.on('geofence:deleted', () => loadData());
    }

    return () => {
      if (socket) {
        socket.off('location:updated');
        socket.off('member:sharing-status');
        socket.off('member:online');
        socket.off('member:offline');
        socket.off('geofence:created');
        socket.off('geofence:deleted');
      }
    };
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [membersRes, fencesRes] = await Promise.all([
        fetchWithAuth('/api/locations/current'),
        fetchWithAuth('/api/geofences'),
      ]);

      if (membersRes.ok) {
        const data = await membersRes.json();
        setMembers(data);
      }
      if (fencesRes.ok) {
        const fenceData = await fencesRes.json();
        setGeofences(fenceData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === 'sharing') return m.sharingStatus === 'active' && !m.isStale;
      if (filterMode === 'stale') return m.isStale;
      return true;
    });
  }, [members, searchQuery, filterMode]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Live Family Map"
          subtitle="Real-time voluntary GPS positions with safe zones & stale detection"
        />

        <main className="p-8 space-y-4 flex-1 flex flex-col">
          {/* Map Filter Controls Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-[240px]">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search member by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    filterMode === 'all' ? 'bg-white font-bold text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  All ({members.length})
                </button>
                <button
                  onClick={() => setFilterMode('sharing')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    filterMode === 'sharing' ? 'bg-white font-bold text-emerald-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Live Sharing
                </button>
                <button
                  onClick={() => setFilterMode('stale')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    filterMode === 'stale' ? 'bg-white font-bold text-amber-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Stale
                </button>
              </div>

              {/* Safe Zone Toggle Button */}
              <button
                onClick={() => setShowSafeZones((prev) => !prev)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  showSafeZones
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
                title="Toggle Safe Zones on Map"
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${showSafeZones ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>Safe Zones ({geofences.length})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Interactive Map Canvas */}
          <div className="flex-1 relative min-h-[600px]">
            <GoogleMapWrapper
              members={filteredMembers}
              geofences={showSafeZones ? geofences : []}
              onSelectMember={(m) => {
                setSelectedMember(m);
                setSelectedGeofence(null);
              }}
              selectedMemberId={selectedMember?.userId || selectedMember?.id}
              onSelectGeofence={(z) => {
                setSelectedGeofence(z);
                setSelectedMember(null);
              }}
              selectedGeofenceId={selectedGeofence?._id}
            />
          </div>
        </main>
      </div>

      {/* Member Details Drawer */}
      <MemberDetailDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}
