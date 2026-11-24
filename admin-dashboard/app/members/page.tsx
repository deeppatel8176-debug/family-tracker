'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Mail,
  Phone,
  Shield,
  MoreVertical,
  CheckCircle,
  XCircle,
  Copy,
  Trash2,
  Edit,
  UserCheck,
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { fetchWithAuth, getAdminUser } from '@/lib/api';

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('Child');
  const [generatedInvite, setGeneratedInvite] = useState<any>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    const admin = getAdminUser();
    if (!admin) {
      router.replace('/login');
      return;
    }
    loadMembers();
  }, [router]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/family/members');
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

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteError(null);

    try {
      const res = await fetchWithAuth('/api/family/invite', {
        method: 'POST',
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          phone: invitePhone ? invitePhone.trim() : undefined,
          relationship: inviteRelationship,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invitation failed');
      }

      setGeneratedInvite(data);
      loadMembers();
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleToggleSuspend = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    try {
      const res = await fetchWithAuth(`/api/family/members/${memberId}`, {
        method: 'PATCH',
        body: JSON.stringify({ accountStatus: newStatus }),
      });
      if (res.ok) loadMembers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this family member? Their data will be detached.')) {
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/family/members/${memberId}`, {
        method: 'DELETE',
      });
      if (res.ok) loadMembers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Family Members"
          subtitle="Manage authorized member accounts, invitations and device statuses"
        />

        <main className="p-8 space-y-6 flex-1 overflow-y-auto">
          {/* Top Action Bar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Family Roster ({members.length})</h2>
              <p className="text-xs text-slate-500">Voluntary location sharing requires an active account</p>
            </div>
            <button
              onClick={() => {
                setGeneratedInvite(null);
                setInviteError(null);
                setShowInviteModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm shadow-blue-200 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Family Member</span>
            </button>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-6">Role & Status</th>
                  <th className="py-3.5 px-6">Relationship</th>
                  <th className="py-3.5 px-6">Device Info</th>
                  <th className="py-3.5 px-6">Location Sharing</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No family members yet. Click "Invite Family Member" to generate your first invitation!
                    </td>
                  </tr>
                ) : (
                  members.map((m) => {
                    const isPending = m.accountStatus === 'pending';
                    const isSuspended = m.accountStatus === 'suspended';
                    const loc = m.currentLocation;

                    return (
                      <tr key={m._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                              {m.name?.[0]?.toUpperCase() || 'M'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{m.name}</p>
                              <p className="text-[11px] text-slate-400">{m.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-[10px] text-slate-700 uppercase">
                              {m.role}
                            </span>
                            <div>
                              {isPending ? (
                                <span className="inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold text-[10px]">
                                  Pending Activation
                                </span>
                              ) : isSuspended ? (
                                <span className="inline-block px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold text-[10px]">
                                  Suspended
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                                  Active
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {m.relationship || 'Member'}
                        </td>

                        <td className="py-4 px-6 text-slate-500">
                          {m.device ? (
                            <div>
                              <p className="font-semibold text-slate-700">{m.device.deviceName}</p>
                              <p className="text-[10px] text-slate-400 uppercase">{m.device.deviceType}</p>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No device logged</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {loc && loc.sharingStatus === 'active' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-[11px]">
                              Off
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right space-x-2">
                          {m.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleToggleSuspend(m._id, m.accountStatus)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                                  isSuspended
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {isSuspended ? 'Unsuspend' : 'Suspend'}
                              </button>
                              <button
                                onClick={() => handleDeleteMember(m._id)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Invite Family Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {generatedInvite ? (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Invitation Created!</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Share this invitation code or activation link with your family member:
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-base font-bold text-blue-600 tracking-wider">
                  {generatedInvite.invitationCode}
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedInvite.invitationCode);
                    alert('Invitation code copied to clipboard!');
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Invitation Code</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateInvite} className="space-y-3 text-xs">
                {inviteError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                    {inviteError}
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. John Connor"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="john@family.com"
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <select
                    value={inviteRelationship}
                    onChange={(e) => setInviteRelationship(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Child">Child</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Relative">Other Relative</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={inviteLoading}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                  >
                    {inviteLoading ? 'Generating Invite...' : 'Generate Secure Invitation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
