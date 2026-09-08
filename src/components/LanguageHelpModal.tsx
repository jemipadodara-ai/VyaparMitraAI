import React from 'react';
import { X, Mic, Sparkles, BookOpen, MessageSquare, ShieldCheck, Zap } from 'lucide-react';

interface LanguageHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageHelpModal: React.FC<LanguageHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0F1422] border border-white/[0.1] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 text-white shadow-2xl relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.1] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-white/[0.08] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">VyaparMitra AI — Gujarati Voice Guide</h3>
            <p className="text-xs text-slate-400">વેપારમિત્ર વાણી સહાયક - ઉપયોગ અને ભાષા ઉદાહરણો</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-4 text-xs leading-relaxed">
          <div className="bg-[#141B2D] p-4 rounded-2xl border border-white/[0.06] space-y-1">
            <h4 className="font-extrabold text-emerald-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> How Synora AI Copilot Works
            </h4>
            <p className="text-slate-300 font-medium">
              You do not need formal grammar or English keywords. Speak or type naturally just as you talk to a customer, distributor, or worker in your shop.
            </p>
          </div>

          <div>
            <h4 className="font-mono font-bold text-slate-400 mb-2 uppercase text-[11px] tracking-wider">
              SUPPORTED INPUT FORMATS & EXAMPLES
            </h4>
            <div className="space-y-2.5">
              <div className="bg-[#141B2D]/70 p-3.5 rounded-2xl border border-white/[0.06]">
                <span className="font-bold text-emerald-400 block mb-1">
                  1. Native Gujarati Script (ગુજરાતી લિપિ)
                </span>
                <p className="italic text-white font-medium">
                  “કાલે મનોજભાઈને 25 box મોકલવાના છે, ₹12,500 payment pending છે.”
                </p>
                <span className="text-[11px] text-slate-400 mt-1.5 block font-mono">
                  Extracts: Manojbhai | Order | 25 Boxes | ₹12,500 Pending | Due Tomorrow
                </span>
              </div>

              <div className="bg-[#141B2D]/70 p-3.5 rounded-2xl border border-white/[0.06]">
                <span className="font-bold text-amber-400 block mb-1">
                  2. Gujlish (Gujarati in English Alphabets)
                </span>
                <p className="italic text-white font-medium">
                  “Rajesh Enterprises ne kal 50 saree mokalvani chhe, 5000 advance aavi gaya.”
                </p>
                <span className="text-[11px] text-slate-400 mt-1.5 block font-mono">
                  Extracts: Rajesh Enterprises | Delivery | 50 Sarees | ₹5,000 Advance
                </span>
              </div>

              <div className="bg-[#141B2D]/70 p-3.5 rounded-2xl border border-white/[0.06]">
                <span className="font-bold text-cyan-400 block mb-1">
                  3. Service / Payment Reminder
                </span>
                <p className="italic text-white font-medium">
                  “Amitbhai na son ni August month ni tuition fee ₹3000 baki chhe, Monday reminder aapjo.”
                </p>
                <span className="text-[11px] text-slate-400 mt-1.5 block font-mono">
                  Extracts: Amitbhai | Payment Reminder | ₹3,000 Fee | Due Monday
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0B141A] p-4 rounded-2xl border border-emerald-500/30">
            <h4 className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp Message Output & Gujarati TTS
            </h4>
            <p className="text-slate-300 font-medium">
              The AI crafts polite Gujarati messages ready for WhatsApp, and supports natural Gujarati speech audio playback with the <strong>Listen Audio (સાંભળો)</strong> button.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/[0.08] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
