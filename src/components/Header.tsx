import React, { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser } from '../lib/firebase';
import { ActiveTab } from '../types/cleantech';
import { PWAInstallButton } from './PWAInstallButton';
import { Cloud, LogIn, LogOut, CheckCircle2, Shield } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onQuickPlay: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onQuickPlay }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await logoutUser();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/85 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single element brand wordmark */}
        <button
          onClick={() => setActiveTab('gridmaster')}
          className="text-xl font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5"
        >
          <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
          <span>VerdantX</span>
          <span className="text-[10px] font-mono font-semibold tracking-normal px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Tiruchirappalli
          </span>
        </button>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveTab('gridmaster')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'gridmaster'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            TANGEDCO Grid
          </button>
          <button
            onClick={() => setActiveTab('tycoon')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'tycoon'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Trichy Ventures
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'calculator'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            BHEL Decarb ROI
          </button>
          <button
            onClick={() => setActiveTab('carbonex')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'carbonex'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Indian Carbon Ex
          </button>
          <button
            onClick={() => setActiveTab('academy')}
            className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'academy'
                ? 'text-emerald-400 border-b-2 border-emerald-400 font-semibold'
                : 'hover:text-white'
            }`}
          >
            NIT Trichy Lab
          </button>
        </nav>

        {/* Zone 3: 1 primary action area with PWA Install & Google Auth */}
        <div className="flex items-center gap-3 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Google Sign-In Status */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pl-2 bg-slate-900 border border-slate-750 hover:border-slate-650 rounded-lg text-xs text-white transition-colors cursor-pointer"
                title="Account & Cloud Sync"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                  </div>
                )}
                <span className="hidden sm:inline font-medium max-w-[100px] truncate">
                  {currentUser.displayName || 'Innovator'}
                </span>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 p-3 shadow-xl space-y-3 z-50 text-xs">
                  <div className="border-b border-slate-800 pb-2">
                    <span className="font-semibold text-white block truncate">{currentUser.displayName}</span>
                    <span className="text-[11px] text-slate-400 block truncate">{currentUser.email}</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Cloud Progress Sync Active
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 border border-slate-750 hover:border-emerald-500/50 text-white transition-colors cursor-pointer whitespace-nowrap shadow-sm"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}

          {/* Quick Play Primary CTA */}
          <button
            onClick={onQuickPlay}
            className="hidden sm:inline-block px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Launch Dispatch
          </button>
        </div>
      </div>
    </header>
  );
};
