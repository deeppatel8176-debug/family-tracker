'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Shield, Phone, Mail, Award } from 'lucide-react';
import { getUser, clearTokens } from '@/lib/memberApi';
import BottomNav from '@/components/ios/BottomNav';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) router.replace('/ios/login');
    else setUser(u);
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    router.replace('/ios/login');
  };

  return (
    <main className="max-w-md mx-auto p-4 space-y-5 pt-safe">
      <header className="py-2">
        <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
        <p className="text-xs text-slate-500">Member account & settings</p>
      </header>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 font-bold text-2xl flex items-center justify-center mx-auto mb-3">
          {user?.name?.[0]?.toUpperCase() || 'M'}
        </div>
        <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
        <p className="text-xs text-slate-500">{user?.email}</p>
        <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          {user?.relationship || 'Family Member'}
        </span>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm divide-y divide-slate-100 text-xs">
        <div className="py-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-600">
            <Mail className="w-4 h-4 text-slate-400" />
            Email
          </span>
          <span className="font-semibold text-slate-800">{user?.email}</span>
        </div>

        <div className="py-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-600">
            <Award className="w-4 h-4 text-slate-400" />
            Role
          </span>
          <span className="font-semibold text-slate-800 uppercase">{user?.role}</span>
        </div>

        <div className="py-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-slate-600">
            <Shield className="w-4 h-4 text-slate-400" />
            Account Status
          </span>
          <span className="font-semibold text-emerald-600 uppercase">{user?.accountStatus}</span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        Log Out
      </button>

      <BottomNav />
    </main>
  );
}
