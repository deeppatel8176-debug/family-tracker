'use client';

import { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone, ArrowDown, Check } from 'lucide-react';

export default function InstallPwaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIosDevice, setIsIosDevice] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already running as installed standalone app
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS / iPadOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIos = /iphone|ipad|ipod/.test(ua);
    setIsIosDevice(isIos);

    // Auto-open modal on first visit in Safari if not installed
    const hasSeenGuide = sessionStorage.getItem('ft_ios_guide_seen');
    if (!standalone && !hasSeenGuide) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('ft_ios_guide_seen', 'true');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isStandalone) {
    return null; // Already running as an installed PWA
  }

  return (
    <>
      {/* Floating Corner Install Button */}
      <div className="fixed bottom-24 right-4 z-40 animate-bounce duration-1000">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-500/30 border border-white/20 transition-all active:scale-95"
        >
          <Smartphone className="w-4 h-4" />
          <span>Add to Home Screen</span>
        </button>
      </div>

      {/* Install Instruction Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in slide-in-from-bottom duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                    Install on iPhone
                  </h3>
                  <p className="text-[11px] text-slate-500">Run fullscreen like a native app</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs text-slate-700">
              {/* Step 1 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1 leading-relaxed">
                  Safari માં નીચે ટૂલબારમાં આવેલ{' '}
                  <span className="inline-flex items-center gap-1 font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    <Share className="w-3.5 h-3.5" /> Share
                  </span>{' '}
                  બટન દબાવો.
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1 leading-relaxed">
                  મેનુમાં નીચે સ્ક્રોલ કરીને{' '}
                  <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    <PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen
                  </span>{' '}
                  પર ક્લિક કરો.
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1 leading-relaxed">
                  ઉપર જમણી બાજુ આવેલું <strong>"Add"</strong> દબાવો. હવે તમારા iPhone ની હોમ સ્ક્રીન પર Family Tracker નું આઇકન આવી જશે!
                </div>
              </div>
            </div>

            {/* Visual Pointer for Safari */}
            <div className="flex items-center justify-center gap-2 text-center text-xs text-blue-600 font-semibold bg-blue-50 py-2.5 rounded-xl border border-blue-100 animate-pulse">
              <ArrowDown className="w-4 h-4" />
              <span>Safari માં નીચે જુઓ &rarr; Share બટન</span>
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              સમજાઈ ગયું (Got it!)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
