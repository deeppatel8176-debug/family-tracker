'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, History, AlertTriangle, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/map', label: 'Map', icon: MapPin },
    { href: '/history', label: 'History', icon: History },
    { href: '/sos', label: 'SOS', icon: AlertTriangle, alert: true },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe pt-2">
      <div className="max-w-md mx-auto flex justify-around items-center px-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                link.alert
                  ? isActive
                    ? 'text-red-600 font-bold'
                    : 'text-red-500 hover:text-red-600'
                  : isActive
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px]">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
