'use client';

import { useState } from 'react';
import { Info, Share, PlusSquare, X } from 'lucide-react';

export default function IOSBanner() {
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [dismissNotice, setDismissNotice] = useState(false);

  return (
    <div className="space-y-3">
      {/* iOS Background Limitation Notice */}
      {!dismissNotice && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <strong className="font-semibold block text-amber-900 mb-0.5">iOS Safari / PWA Notice:</strong>
            iOS suspends background execution when Safari or the PWA is minimized or locked. Live GPS updates run while the app is active in foreground. Stale locations are marked transparently.
          </div>
          <button
            onClick={() => setDismissNotice(true)}
            className="text-amber-500 hover:text-amber-800 p-0.5"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Safari Add to Home Screen Helper */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Share className="w-4 h-4 text-blue-600" />
          <span>Install as iOS App: Tap <strong>Share</strong> &rarr; <strong>Add to Home Screen</strong></span>
        </div>
        <button
          onClick={() => setShowInstallGuide(!showInstallGuide)}
          className="text-blue-600 font-semibold underline text-xs ml-2 shrink-0"
        >
          {showInstallGuide ? 'Hide' : 'Guide'}
        </button>
      </div>

      {showInstallGuide && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-2 shadow-sm">
          <p className="font-semibold text-slate-900 text-sm">How to install on iPhone / iPad:</p>
          <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-600">
            <li>Open this website in <strong>Safari</strong>.</li>
            <li>Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-600" /> in the bottom bar.</li>
            <li>Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" /> <strong>Add to Home Screen</strong>.</li>
            <li>Tap <strong>Add</strong> in the top-right corner.</li>
            <li>Open <strong>Family Tracker</strong> from your Home Screen for a fullscreen PWA experience!</li>
          </ol>
        </div>
      )}
    </div>
  );
}
