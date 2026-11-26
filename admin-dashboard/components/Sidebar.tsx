'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MapPin,
  Users,
  History,
  ShieldCheck,
  AlertTriangle,
  Bell,
  Settings,
  LogOut,
  Navigation,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { clearTokens, getAdminUser } from '@/lib/api';

const navItems = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/map', label: 'Live Map', icon: MapPin },
  { href: '/members', label: 'Family Members', icon: Users },
  { href: '/history', label: 'Location History', icon: History },
  { href: '/geofences', label: 'Safe Zones', icon: ShieldCheck },
  { href: '/sos', label: 'SOS Alerts', icon: AlertTriangle, badge: true },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    setAdmin(getAdminUser());

    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    window.addEventListener('toggle-admin-drawer', handleToggle);
    return () => window.removeEventListener('toggle-admin-drawer', handleToggle);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearTokens();
    router.replace('/login');
  };

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-200">
            <Navigation className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">Family Tracker</h1>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Administrator Portal</p>
          </div>
        </div>

        {/* Nav List */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================= MOBILE BOTTOM NAVIGATION BAR ================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-1.5 flex items-center justify-around shadow-lg safe-area-inset-bottom">
        <Link
          href="/map"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            pathname.startsWith('/map') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${pathname.startsWith('/map') ? 'bg-blue-50' : ''}`}>
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-none">Map</span>
        </Link>

        <Link
          href="/overview"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            pathname.startsWith('/overview') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${pathname.startsWith('/overview') ? 'bg-blue-50' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-none">Overview</span>
        </Link>

        <Link
          href="/members"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            pathname.startsWith('/members') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${pathname.startsWith('/members') ? 'bg-blue-50' : ''}`}>
            <Users className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-none">Members</span>
        </Link>

        <Link
          href="/geofences"
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            pathname.startsWith('/geofences') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-lg ${pathname.startsWith('/geofences') ? 'bg-blue-50' : ''}`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-none">Safe Zones</span>
        </Link>

        <button
          onClick={() => setIsMobileOpen(true)}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-all ${
            isMobileOpen ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] leading-none">Menu</span>
        </button>
      </nav>

      {/* ================= MOBILE SLIDE-OVER DRAWER ================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-white h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Navigation className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Family Tracker</h2>
                  <p className="text-[10px] text-slate-400">Admin Control Menu</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin User Info Card */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                {admin?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{admin?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-500 truncate">{admin?.email}</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Sign Out Button */}
            <div className="p-3 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50/70 hover:bg-rose-100/70 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Admin</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
