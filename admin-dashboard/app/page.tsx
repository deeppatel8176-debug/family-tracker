'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Navigation,
  Download,
  Smartphone,
  Apple,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  Share,
  PlusSquare,
  Lock,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function HeroLandingPage() {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-200">
              <Navigation className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                Family Tracker
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Voluntary Safety Network</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
            <a href="#download" className="hover:text-blue-600 transition-colors">
              Download App
            </a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </a>
            <a href="#install-guide" className="hover:text-blue-600 transition-colors">
              Installation Guide
            </a>
            <a href="#privacy" className="hover:text-blue-600 transition-colors">
              Privacy First
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#download"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get App</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white via-slate-50 to-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>100% Voluntary Location Sharing • Zero Covert Tracking</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Know Your Family Is Safe. <br className="hidden sm:inline" />
              <span className="text-blue-600">Always Connected.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              A private, secure family safety application. Family members voluntarily share their live
              GPS coordinates, safe zone arrival alerts, and emergency SOS distress signals with their
              family administrator.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Member Controlled Toggle
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant SOS Alarm
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Stale Pulse Detection
              </span>
            </div>
          </div>

          {/* Action Cards: Android APK + iOS PWA */}
          <div id="download" className="mt-14 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Android Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    Android APK (v1.0.0)
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">Android Mobile App</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Native Flutter APK with background foreground service, precise GPS stream, and
                    battery-optimized tracking.
                  </p>
                </div>

                <div className="space-y-2 pt-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">File Name:</span>
                    <span className="font-mono font-medium">family-tracker.apk</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Version:</span>
                    <span className="font-medium">1.0.0 (Build 1)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Requirements:</span>
                    <span className="font-medium">Android 8.0 (Oreo) or newer</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <a
                  href="/downloads/family-tracker.apk"
                  download="family-tracker.apk"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Android APK</span>
                </a>
                <p className="text-[11px] text-center text-slate-400">
                  Direct download from our secure website
                </p>
              </div>
            </div>

            {/* iOS PWA Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Apple className="w-8 h-8" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                    Apple iPhone PWA
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-900">iOS Web App (PWA)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Installable Progressive Web App for iPhone and iPad via Safari. Fullscreen standalone
                    experience with zero App Store download.
                  </p>
                </div>

                <div className="space-y-2 pt-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Install Method:</span>
                    <span className="font-medium">Safari &rarr; Add to Home Screen</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Platform:</span>
                    <span className="font-medium">Next.js PWA + Geolocation API</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Requirements:</span>
                    <span className="font-medium">iOS 14.0 or newer (Safari)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-blue-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Launch iOS PWA Application</span>
                </a>
                <p className="text-[11px] text-center text-slate-400">
                  Open on your iPhone and tap Add to Home Screen
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Simple & Transparent
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How Family Tracker Works
            </h3>
            <p className="text-sm text-slate-500">
              Four steps from invitation to voluntary real-time location sharing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h4 className="font-bold text-sm text-slate-900">Admin Invites Member</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The family administrator generates a secure, 7-day invitation code (e.g. FT-XXXXXX) from
                the dashboard.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h4 className="font-bold text-sm text-slate-900">Install Application</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Members download the Android APK or add the iOS PWA to their iPhone home screen directly
                from this website.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h4 className="font-bold text-sm text-slate-900">Activate Account</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The member enters their invitation code and sets their own private password to activate
                their account.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h4 className="font-bold text-sm text-slate-900">Voluntary Location Sharing</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                The member explicitly turns on location sharing. They can pause or stop sharing at any
                moment with one tap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Installation Guide Section */}
      <section id="install-guide" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-3 mb-10">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Setup Guide</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Easy Installation for Every Device
            </h3>
            <p className="text-sm text-slate-500">
              Step-by-step instructions for Android APK and iOS Safari PWA installation.
            </p>
          </div>

          {/* Device Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-slate-200 p-1 rounded-2xl flex gap-1">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'android' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Android APK Guide</span>
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ios' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                <Apple className="w-4 h-4 text-blue-600" />
                <span>iPhone (iOS Safari) Guide</span>
              </button>
            </div>
          </div>

          {/* Guide Content */}
          {activeTab === 'android' ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Android Installation Steps</h4>
                  <p className="text-xs text-slate-500">Fast install without Google Play Store</p>
                </div>
              </div>

              <ol className="space-y-4 text-xs text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Download the APK:</strong>
                    Click the <strong>Download Android APK</strong> button above to download{' '}
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600">family-tracker.apk</code>.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Allow Install Unknown Apps:</strong>
                    When prompted by Android, tap <strong>Settings</strong> and switch on{' '}
                    <strong>"Allow from this source"</strong> for Chrome or your browser.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Install & Launch:</strong>
                    Tap <strong>Install</strong>, then open <strong>Family Tracker</strong> from your app drawer.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Activate & Grant Permissions:</strong>
                    Tap <strong>Activate Account</strong>, enter your invitation code, create a password, and
                    grant Location permissions when prompted.
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Apple className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">iPhone Safari PWA Installation</h4>
                  <p className="text-xs text-slate-500">Install in 3 taps directly from Safari</p>
                </div>
              </div>

              <ol className="space-y-4 text-xs text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Open in Safari:</strong>
                    Open this website in <strong>Safari</strong> on your iPhone or iPad.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Tap Share:</strong>
                    Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-600" />{' '}
                    at the bottom of your Safari screen.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Add to Home Screen:</strong>
                    Scroll down and tap{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                      <PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen
                    </span>
                    , then tap <strong>Add</strong> in the top-right corner.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <strong className="block text-slate-900 mb-0.5">Open & Activate:</strong>
                    Tap the <strong>Family Tracker</strong> icon on your iPhone home screen to run the PWA in
                    full-screen app mode!
                  </div>
                </li>
              </ol>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed">
                <strong>Important iOS Note:</strong> Apple iOS suspends PWA background tasks when the app is
                minimized or locked. Keep the PWA active on screen for continuous live location pulses.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Privacy Guarantee Section */}
      <section id="privacy" className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Our Privacy Commitment</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Family Tracker was engineered with ethics and member consent at its core. An administrator
            cannot secretly turn on your GPS. You have complete autonomy over your location sharing, and
            your location history is automatically purged after the retention policy expires.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Navigation className="w-4 h-4 fill-current" />
            </div>
            <span className="text-white font-bold text-sm">Family Tracker Platform</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#download" className="hover:text-white transition-colors">
              Download App
            </a>
            <a href="#install-guide" className="hover:text-white transition-colors">
              Installation Guide
            </a>
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
          </div>

          <p className="text-slate-500">© 2026 Family Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
