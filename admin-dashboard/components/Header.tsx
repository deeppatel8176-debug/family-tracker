'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Radio, Menu } from 'lucide-react';
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
    <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-8 sm:py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-admin-drawer'))}
          className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          aria-label="Open Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">{title}</h1>
          {subtitle && <p className="hidden sm:block text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Active SOS Warning Pill */}
        {activeSosCount > 0 && (
          <Link
            href="/sos"
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] sm:text-xs font-bold animate-pulse"
          >
            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
            <span>
              {activeSosCount} <span className="hidden xs:inline">SOS</span>
            </span>
          </Link>
        )}

        {/* Real-time Socket Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
          title={isConnected ? 'Real-Time WebSocket Connected' : 'Reconnecting to live server...'}
        >
          <Radio className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
          <span className="hidden sm:inline">{isConnected ? 'Live Connected' : 'Reconnecting...'}</span>
          <span className="sm:hidden">{isConnected ? 'Live' : '...'}</span>
        </div>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
            {admin?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{admin?.name || 'Admin'}</p>
            <p className="text-[10px] text-slate-500">Family Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
