import React from 'react';
import { UserAccount } from '../types';
import {
  Mic,
  Sparkles,
  Building2,
  HelpCircle,
  IndianRupee,
  Store,
  UserCheck,
  RefreshCw,
  Search,
  Command,
  Bell,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  taskCount: number;
  pendingAmountSum: number;
  currentUser: UserAccount | null;
  onOpenHelp: () => void;
  onOpenAuth: () => void;
  onNewTaskClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  taskCount,
  pendingAmountSum,
  currentUser,
  onOpenHelp,
  onOpenAuth,
  onNewTaskClick,
}) => {
  return (
    <header id="main-app-header" className="bg-[#0B0F17]/90 backdrop-blur-xl border-b border-white/[0.08] text-white sticky top-0 z-30 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Title (Mobile & Desktop) */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0F17] rounded-[9px] flex items-center justify-center">
              <Mic className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                <span>VyaparMitra AI</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  SaaS
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 hidden sm:block font-medium">
                Gujarati Voice Copilot & SQLite Engine
              </p>
            </div>
          </div>
        </div>

        {/* Center Search / Command Bar (Synora Style) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
          <div className="w-full relative flex items-center bg-white/[0.04] border border-white/[0.08] hover:border-white/20 focus-within:border-emerald-500/50 focus-within:bg-white/[0.06] rounded-xl px-3 py-1.5 text-xs text-slate-300 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              readOnly
              onClick={onNewTaskClick}
              placeholder="Search or prompt AI... 'કાલે 25 box મોકલવાના છે'"
              className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-full cursor-pointer"
            />
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <span className="text-[10px] bg-white/[0.08] text-slate-400 px-1.5 py-0.5 rounded font-mono font-bold">
                Ctrl K
              </span>
            </div>
          </div>
        </div>

        {/* Right Status Indicators & Action Bar */}
        <div className="flex items-center space-x-2 text-xs shrink-0">
          {/* Active AI Model Badge */}
          <div className="hidden xl:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-xl text-[11px] font-mono">
            <Zap className="w-3 h-3 text-emerald-400" />
            <span>Gemma 2 Flash</span>
          </div>

          {/* User Profile Switcher Button */}
          <button
            id="btn-user-profile-switch"
            onClick={onOpenAuth}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] text-white px-3 py-1.5 rounded-xl border border-white/[0.08] transition active:scale-95 shadow-sm"
            title="Switch User Profile / Private SQLite DB"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-xs shadow">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center gap-1">
                <span className="max-w-[110px] truncate">{currentUser?.businessName || 'Select Profile'}</span>
                <RefreshCw className="w-2.5 h-2.5 text-slate-400" />
              </div>
              <div className="text-[10px] text-slate-400">
                {currentUser?.ownerName || 'Guest'}
              </div>
            </div>
          </button>

          {/* Quick Gujarati Help Guide Trigger */}
          <button
            id="btn-help-guide"
            onClick={onOpenHelp}
            className="flex items-center space-x-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm"
            title="How to use & Gujarati audio examples"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>
        </div>
      </div>
    </header>
  );
};
