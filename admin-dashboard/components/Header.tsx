'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Radio, UserCircle } from 'lucide-react';
import { getAdminUser } from '@/lib/api';
import { getAdminSocket } from '@/lib/socket';

interface HeaderProps {
  title: string;
  subtitle?: string;
  activeSosCount?: number;
}

export default function Header({ title, subtitle, activeSosCount = 0 }: HeaderProps) {
  const [admin, setAdmin] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setAdmin(getAdminUser());

    const socket = getAdminSocket();
    if (socket) {
      if (socket.connected) setIsConnected(true);
      socket.on('connect', () => setIsConnected(true));
      socket.on('disconnect', () => setIsConnected(false));
    }
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Active SOS Warning Pill */}
        {activeSosCount > 0 && (
          <Link
            href="/sos"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse"
          >
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{activeSosCount} ACTIVE SOS ALERT{activeSosCount > 1 ? 'S' : ''}!</span>
          </Link>
        )}

        {/* Real-time Socket Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
          <span>{isConnected ? 'Real-Time Connected' : 'Reconnecting...'}</span>
        </div>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
            {admin?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">{admin?.name || 'Administrator'}</p>
            <p className="text-[10px] text-slate-500">Family Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
