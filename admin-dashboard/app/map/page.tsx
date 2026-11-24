'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, RefreshCw, Filter, Layers } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import GoogleMapWrapper from '@/components/GoogleMapWrapper';
import MemberDetailDrawer, { SelectedMember } from '@/components/MemberDetailDrawer';
import { fetchWithAuth, getAdminUser } from '@/lib/api';
import { getAdminSocket } from '@/lib/socket';

export default function MapPage() {
  const router = useRouter();
  const [members, setMembers] = useState<SelectedMember[]>([]);
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

    loadLocations();

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

      socket.on('member:sharing-status', () => loadLocations());
      socket.on('member:online', () => loadLocations());
      socket.on('member:offline', () => loadLocations());
    }

    return () => {
      if (socket) {
        socket.off('location:updated');
        socket.off('member:sharing-status');
        socket.off('member:online');
        socket.off('member:offline');
      }
    };
  }, [router]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/locations/current');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
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
          subtitle="Real-time voluntary GPS positions with accuracy radii & stale detection"
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
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadLocations}
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
              onSelectMember={(m) => setSelectedMember(m)}
              selectedMemberId={selectedMember?.userId || selectedMember?.id}
            />
          </div>
        </main>
      </div>

      {/* Member Details Drawer */}
      <MemberDetailDrawer member={selectedMember} onClose={() => setSelectedMember(null)} />
    </div>
  );
}
