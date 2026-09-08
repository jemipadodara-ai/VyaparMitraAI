import React, { useState } from 'react';
import { UserAccount } from '../types';
import {
  Building2,
  Lock,
  User,
  Phone,
  Store,
  PlusCircle,
  LogIn,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  X,
  AlertCircle,
  Database,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentUser: UserAccount | null;
  allUsers: UserAccount[];
  onLoginUser: (user: UserAccount) => void;
  onCreateAccount: (newAcc: Omit<UserAccount, 'id' | 'createdAt'>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onLoginUser,
  onCreateAccount,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedUserId, setSelectedUserId] = useState<string>(allUsers[0]?.id || '');
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  // Register Form State
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [businessType, setBusinessType] = useState<UserAccount['businessType']>('Retailer');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    const targetUser = allUsers.find((u) => u.id === selectedUserId);
    if (!targetUser) {
      setPinError('Please select a business account.');
      return;
    }

    if (targetUser.pin && enteredPin !== targetUser.pin) {
      setPinError('Incorrect 4-digit Security PIN.');
      return;
    }

    onLoginUser(targetUser);
    setEnteredPin('');
    if (onClose) onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!businessName.trim()) {
      setRegError('Please enter your Business / Shop Name.');
      return;
    }
    if (!ownerName.trim()) {
      setRegError('Please enter Owner Name.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 8) {
      setRegError('Please enter a valid Phone Number.');
      return;
    }

    onCreateAccount({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      phoneNumber: phoneNumber.trim(),
      pin: pin.trim(),
      businessType,
    });

    // Reset form
    setBusinessName('');
    setOwnerName('');
    setPhoneNumber('');
    setPin('');
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0F1422] border border-white/[0.1] rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative overflow-hidden space-y-5">
        {/* Top Header Decorator */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <span>Account & SQL Database</span>
              </h2>
              <p className="text-xs text-slate-400">
                Switch or create isolated SQLite business profile
              </p>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.1] transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#141B2D] p-1.5 rounded-2xl border border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Select Account ({allUsers.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>+ New Business</span>
          </button>
        </div>

        {/* TAB 1: LOGIN / USER SWITCHER */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                CHOOSE BUSINESS PROFILE
              </label>

              {allUsers.length === 0 ? (
                <div className="p-4 bg-[#141B2D] border border-white/[0.06] rounded-2xl text-center text-xs text-slate-400">
                  No accounts found. Click "+ New Business" above to start!
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {allUsers.map((usr) => {
                    const isSelected = selectedUserId === usr.id;
                    const isCurrentActive = currentUser?.id === usr.id;
                    return (
                      <div
                        key={usr.id}
                        onClick={() => {
                          setSelectedUserId(usr.id);
                          setEnteredPin('');
                          setPinError('');
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/60 shadow-sm'
                            : 'bg-[#141B2D]/70 border-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSelected
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-white/[0.06] text-slate-300'
                            }`}
                          >
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-black text-white flex items-center gap-1.5">
                              <span>{usr.businessName}</span>
                              {isCurrentActive && (
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              {usr.ownerName} • {usr.businessType} • {usr.phoneNumber}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* PIN Entry if needed */}
            {allUsers.find((u) => u.id === selectedUserId)?.pin && (
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enter Security PIN</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="4-digit PIN"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {pinError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedUserId}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-40"
            >
              <LogIn className="w-4 h-4" />
              <span>Switch to Selected Database</span>
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER NEW BUSINESS */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-1">
                Business / Shop Name (દુકાનનું નામ) *
              </label>
              <div className="relative">
                <Store className="w-4 h-4 text-amber-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Tirupati Kirana Stores / Traders"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Owner Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Patel"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="e.g. 9898012345"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value as any)}
                  className="w-full bg-[#141B2D] border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="Retailer">Retailer (રિટેલ)</option>
                  <option value="Wholesaler">Wholesaler (હોલસેલ)</option>
                  <option value="Contractor">Contractor (કોન્ટ્રાક્ટર)</option>
                  <option value="Service/Tuition">Service / Tuition</option>
                  <option value="Manufacturer">Manufacturer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-1">
                  Security PIN (Optional)
                </label>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="e.g. 1234"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {regError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Empty Private Database</span>
            </button>
          </form>
        )}

        <div className="p-3 bg-[#141B2D] border border-white/[0.06] rounded-2xl text-[11px] text-slate-400 font-medium flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            Each business profile has a private isolated SQLite table with 0 initial clutter.
          </span>
        </div>
      </div>
    </div>
  );
};
