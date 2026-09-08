import React from 'react';
import { UserAccount } from '../types';
import {
  LayoutDashboard,
  Mic,
  FileEdit,
  ShoppingBag,
  TrendingUp,
  Database,
  HelpCircle,
  Users,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  entryMode: 'voice' | 'form';
  setEntryMode: (mode: 'voice' | 'form') => void;
  taskCount: number;
  pendingAmountSum: number;
  currentUser: UserAccount | null;
  onOpenAuth: () => void;
  onOpenHelp: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  entryMode,
  setEntryMode,
  taskCount,
  pendingAmountSum,
  currentUser,
  onOpenAuth,
  onOpenHelp,
}) => {
  return (
    <aside className="w-64 bg-[#0B0F17]/95 border-r border-white/[0.08] flex flex-col justify-between shrink-0 min-h-screen p-4 hidden lg:flex select-none">
      {/* Top Brand / Logo */}
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-2 pt-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">VyaparMitra</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                AI PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Synora SaaS Engine</p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
            Main Platform
          </div>

          <button
            onClick={() => {
              setActiveSection('overview');
              const el = document.getElementById('section-financial-chart');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'overview'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Overview Analytics</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </button>

          <button
            onClick={() => {
              setActiveSection('voice');
              setEntryMode('voice');
              const el = document.getElementById('section-input-area');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              entryMode === 'voice' && activeSection === 'voice'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Mic className="w-4 h-4 text-emerald-400" />
              <span>Voice AI Copilot</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
              Gemma
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSection('form');
              setEntryMode('form');
              const el = document.getElementById('section-input-area');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              entryMode === 'form'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileEdit className="w-4 h-4 text-amber-400" />
              <span>Direct Form Entry</span>
            </div>
          </button>

          <button
            onClick={() => {
              setActiveSection('registry');
              const el = document.getElementById('section-task-board');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'registry'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span>Task & Orders Board</span>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono font-bold">
              {taskCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSection('financial');
              const el = document.getElementById('section-financial-chart');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeSection === 'financial'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>Financial Analytics</span>
            </div>
          </button>
        </div>

        {/* Quick Database Insights Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              SQLite Database
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500 text-[11px]">Total Records</span>
              <span className="font-mono font-bold text-white">{taskCount}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-500 text-[11px]">Pending Ledger</span>
              <span className="font-mono font-bold text-amber-400">₹{pendingAmountSum.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Profile & Guide Controls */}
      <div className="space-y-3 pt-4 border-t border-white/[0.08]">
        {/* Gujarati Help Modal Button */}
        <button
          onClick={onOpenHelp}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition"
        >
          <div className="flex items-center gap-2 text-amber-300">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Gujarati Guide & FAQs</span>
          </div>
          <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
            Help
          </span>
        </button>

        {/* User Profile Card */}
        <div
          onClick={onOpenAuth}
          className="p-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] transition cursor-pointer flex items-center justify-between group"
        >
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-black text-xs flex items-center justify-center shadow">
              {currentUser?.businessName ? currentUser.businessName.charAt(0) : 'V'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition">
                {currentUser?.businessName || 'Select Profile'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentUser?.ownerName || 'Guest User'} • {currentUser?.businessType || 'Retailer'}
              </div>
            </div>
          </div>
          <Users className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition shrink-0 ml-1" />
        </div>
      </div>
    </aside>
  );
};
