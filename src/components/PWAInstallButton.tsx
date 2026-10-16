import React, { useState } from 'react';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed in standalone mode, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer whitespace-nowrap"
        title="Install VerdantX as an App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-850 text-slate-300 border border-slate-750 hover:text-white transition-all cursor-pointer whitespace-nowrap"
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-950 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> icon (box with upward arrow) in the Safari toolbar.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-950 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">2</span>
                  <span>Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-950 rounded-lg">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">3</span>
                  <span>Launch VerdantX like a native standalone application!</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 text-xs font-semibold rounded-lg bg-emerald-400 text-slate-950 hover:bg-emerald-300 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers that don't trigger beforeinstallprompt yet
  return (
    <button
      onClick={() => {
        alert("To install VerdantX on desktop or mobile, open your browser menu (⋮) and select 'Install app' or 'Add to Home screen'.");
      }}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-400 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
      title="Install instructions"
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install</span>
    </button>
  );
};
