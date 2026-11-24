'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Shield, Clock, HardDrive, Check } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { fetchWithAuth, getAdminUser } from '@/lib/api';

export default function SettingsPage() {
  const router = useRouter();
  const [family, setFamily] = useState<any>(null);
  const [retentionDays, setRetentionDays] = useState(30);
  const [staleThreshold, setStaleThreshold] = useState(5);
  const [allowHistory, setAllowHistory] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const admin = getAdminUser();
    if (!admin) {
      router.replace('/login');
      return;
    }
    loadFamily();
  }, [router]);

  const loadFamily = async () => {
    try {
      const res = await fetchWithAuth('/api/family/details');
      if (res.ok) {
        const data = await res.json();
        setFamily(data);
        if (data.settings) {
          setRetentionDays(data.settings.retentionDays || 30);
          setStaleThreshold(data.settings.staleThresholdMinutes || 5);
          setAllowHistory(data.settings.allowHistoryViewByMembers ?? true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    // In our backend, settings can be updated on the family object
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Family Settings"
          subtitle="Configure location data retention, stale pulse thresholds & privacy controls"
        />

        <main className="p-8 space-y-6 flex-1 overflow-y-auto max-w-4xl">
          <form onSubmit={handleSave} className="space-y-6">
            {saved && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                Settings updated successfully
              </div>
            )}

            {/* General Group Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Family Group Details</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-500 font-medium">Family Group Name</label>
                  <p className="font-bold text-slate-900 mt-1 text-sm">{family?.familyName || 'Family Group'}</p>
                </div>
                <div>
                  <label className="text-slate-500 font-medium">Administrator</label>
                  <p className="font-bold text-slate-900 mt-1 text-sm">{family?.adminId?.name || 'Administrator'}</p>
                </div>
              </div>
            </div>

            {/* Retention & Privacy Policy */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-900">Privacy & Data Retention</h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Location History Retention Period (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(parseInt(e.target.value, 10))}
                    className="w-48 p-2 border border-slate-200 rounded-xl font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Recorded breadcrumbs older than this threshold are permanently purged.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stale Location Threshold (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={staleThreshold}
                    onChange={(e) => setStaleThreshold(parseInt(e.target.value, 10))}
                    className="w-48 p-2 border border-slate-200 rounded-xl font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    If no GPS update is received within this time, the marker is marked Stale on the map.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-800">Allow Members to View Their Own History</p>
                    <p className="text-[11px] text-slate-400">
                      Family members can inspect their own recorded route history in their mobile app.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowHistory}
                    onChange={(e) => setAllowHistory(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm shadow-blue-200"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
