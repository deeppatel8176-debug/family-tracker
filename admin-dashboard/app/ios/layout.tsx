import type { Metadata } from 'next';
import InstallPwaModal from '@/components/ios/InstallPwaModal';

export const metadata: Metadata = {
  title: 'Family Tracker - iOS App',
  description: 'Voluntary Family Location Sharing System for iOS',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Family Tracker',
  },
  icons: {
    icon: '/icon-192.svg',
    apple: '/icon-192.svg',
  },
};

export default function IosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 relative">
      {children}
      <InstallPwaModal />
    </div>
  );
}
