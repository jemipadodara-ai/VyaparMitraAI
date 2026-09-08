import React, { useState, useEffect } from 'react';
import {
  ExtractedTaskData,
  TaskCategory,
  PaymentStatus,
  TaskStatus,
  TaskPriority,
} from '../types';
import { getWhatsAppShareUrl, copyToClipboard } from '../utils/whatsapp';
import { speakGujaratiMessage, stopSpeech } from '../utils/speech';
import {
  MessageSquare,
  Copy,
  Check,
  Share2,
  Volume2,
  BookmarkPlus,
  User,
  Calendar,
  IndianRupee,
  ShoppingBag,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Square,
  Zap,
} from 'lucide-react';

interface StructuredTaskCardProps {
  task: ExtractedTaskData;
  onSaveTask: (task: ExtractedTaskData) => void;
  isSaved?: boolean;
}

export const StructuredTaskCard: React.FC<StructuredTaskCardProps> = ({
  task,
  onSaveTask,
  isSaved = false,
}) => {
  const [editedTask, setEditedTask] = useState<ExtractedTaskData>(task);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    setEditedTask(task);
    setCopied(false);
    setSavedSuccess(false);
    stopSpeech();
    setIsAudioPlaying(false);
  }, [task]);

  const handleFieldChange = (field: keyof ExtractedTaskData, value: any) => {
    setEditedTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCopyMessage = async () => {
    const ok = await copyToClipboard(editedTask.whatsappMessage);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppSend = () => {
    const url = getWhatsAppShareUrl(editedTask.whatsappMessage, customerPhone);
    window.open(url, '_blank');
  };

  const handleSave = () => {
    onSaveTask(editedTask);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePlayAudio = () => {
    if (isAudioPlaying) {
      stopSpeech();
      setIsAudioPlaying(false);
      return;
    }

    const textToSpeak = editedTask.whatsappMessage || editedTask.summaryGujarati || editedTask.summary;
    if (!textToSpeak) return;

    speakGujaratiMessage(
      textToSpeak,
      () => setIsAudioPlaying(true),
      () => setIsAudioPlaying(false)
    );
  };

  const getCategoryBadgeClass = (category: TaskCategory) => {
    switch (category) {
      case 'Order':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Payment Reminder':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'Delivery Instruction':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'Customer Follow-up':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div
      id={`task-card-${editedTask.id}`}
      className="bg-[#0F1422]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl relative space-y-6 overflow-hidden"
    >
      {/* Top Header & AI Confidence Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center space-x-2.5">
          <span
            className={`text-xs px-3 py-1 rounded-full font-bold border ${getCategoryBadgeClass(
              editedTask.actionType
            )} flex items-center gap-1.5 shadow-sm`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {editedTask.actionType}
          </span>
          <span className="text-xs text-slate-300 bg-white/[0.05] font-mono px-2.5 py-1 rounded-full border border-white/[0.08]">
            Detected: <strong className="text-white">{editedTask.detectedLanguage}</strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Accuracy: <strong className="text-emerald-300">{editedTask.confidenceScore}%</strong>
          </span>
        </div>
      </div>

      {/* Extracted Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Customer Name */}
        <div className="bg-[#141B2D]/70 border border-white/[0.06] rounded-2xl p-3.5 space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            CUSTOMER / CONTACT
          </label>
          <input
            type="text"
            value={editedTask.customerName}
            onChange={(e) => handleFieldChange('customerName', e.target.value)}
            className="w-full bg-black/30 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
          />
        </div>

        {/* Item & Quantity */}
        <div className="bg-[#141B2D]/70 border border-white/[0.06] rounded-2xl p-3.5 space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            ITEMS / QUANTITY
          </label>
          <input
            type="text"
            value={editedTask.itemsQuantity}
            onChange={(e) => handleFieldChange('itemsQuantity', e.target.value)}
            className="w-full bg-black/30 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
          />
        </div>

        {/* Amount & Currency */}
        <div className="bg-[#141B2D]/70 border border-white/[0.06] rounded-2xl p-3.5 space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
            AMOUNT (₹) & STATUS
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={editedTask.formattedAmount}
              onChange={(e) => handleFieldChange('formattedAmount', e.target.value)}
              className="w-full bg-black/30 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
            />
            <select
              value={editedTask.paymentStatus}
              onChange={(e) => handleFieldChange('paymentStatus', e.target.value as PaymentStatus)}
              className="bg-[#1E293B] text-slate-200 font-bold border border-white/[0.08] rounded-xl px-2.5 py-2 text-xs focus:outline-none"
            >
              <option value="Pending">Pending</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Not Applicable">N/A</option>
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div className="bg-[#141B2D]/70 border border-white/[0.06] rounded-2xl p-3.5 space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            DUE DATE / TIME
          </label>
          <input
            type="text"
            value={editedTask.dueDateLabel}
            onChange={(e) => handleFieldChange('dueDateLabel', e.target.value)}
            className="w-full bg-black/30 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
          />
        </div>

        {/* Category & Priority */}
        <div className="bg-[#141B2D]/70 border border-white/[0.06] rounded-2xl p-3.5 space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            CATEGORY & PRIORITY
          </label>
          <div className="flex space-x-2">
            <select
              value={editedTask.actionType}
              onChange={(e) => handleFieldChange('actionType', e.target.value as TaskCategory)}
              className="w-1/2 bg-[#1E293B] border border-white/[0.08] rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none"
            >
              <option value="Order">Order</option>
              <option value="Payment Reminder">Payment Reminder</option>
              <option value="Delivery Instruction">Delivery Instruction</option>
              <option value="Customer Follow-up">Customer Follow-up</option>
              <option value="Task">Task</option>
            </select>

            <select
              value={editedTask.priority}
              onChange={(e) => handleFieldChange('priority', e.target.value as TaskPriority)}
              className="w-1/2 bg-[#1E293B] border border-white/[0.08] rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Progress Status */}
        <div className="bg-[#141B2D]/70 border border-white/[0.06] rounded-2xl p-3.5 space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            PROGRESS STATUS
          </label>
          <select
            value={editedTask.status}
            onChange={(e) => handleFieldChange('status', e.target.value as TaskStatus)}
            className="w-full bg-[#1E293B] border border-white/[0.08] rounded-xl px-2.5 py-2 text-xs font-bold text-white focus:outline-none"
          >
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Payment">Pending Payment</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Operational Next Step Section */}
      <div className="bg-[#141B2D]/90 border border-white/[0.08] rounded-2xl p-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-white uppercase tracking-wider">
          <ArrowRight className="w-4 h-4 text-emerald-400" />
          <span>OPERATIONAL NEXT ACTION (પ્રાથમિક પગલું)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.05] text-slate-200 font-semibold shadow-inner">
            <span className="text-[10px] text-emerald-400 font-mono font-bold block mb-1">GUJARATI STEP</span>
            {editedTask.suggestedNextActionGujarati}
          </div>
          <div className="bg-black/30 p-3.5 rounded-xl border border-white/[0.05] text-slate-300 font-medium shadow-inner">
            <span className="text-[10px] text-cyan-400 font-mono font-bold block mb-1">ENGLISH STEP</span>
            {editedTask.suggestedNextAction}
          </div>
        </div>
      </div>

      {/* Synora WhatsApp Message Box */}
      <div className="bg-[#0B141A] border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Chat Header */}
        <div className="bg-[#1F2C34] px-4 py-3 flex items-center justify-between border-b border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black flex items-center justify-center text-xs shadow">
              {editedTask.customerName.charAt(0) || 'G'}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{editedTask.customerName}</span>
                <span className="text-[10px] text-emerald-400 font-normal">(WhatsApp Ready)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">VyaparMitra AI Confirmation Preview</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Phone (e.g. 9898012345)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="bg-[#111B21] border border-white/[0.1] rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 w-44 focus:outline-none font-mono"
          />
        </div>

        {/* Chat Area */}
        <div className="p-4 bg-[#0B141A] text-slate-100">
          <div className="max-w-[92%] sm:max-w-[85%] bg-[#005C4B] p-4 rounded-2xl rounded-tl-none shadow-md relative border border-emerald-600/30">
            <textarea
              value={editedTask.whatsappMessage}
              onChange={(e) => handleFieldChange('whatsappMessage', e.target.value)}
              rows={4}
              className="w-full bg-transparent text-xs sm:text-sm font-medium text-white leading-relaxed focus:outline-none resize-y border-none p-0 placeholder-emerald-200"
            />
            <div className="flex items-center justify-between mt-2 pt-1 border-t border-emerald-400/20 text-[10px] text-emerald-200 font-mono">
              <span>Editable Message</span>
              <span className="text-cyan-300">✓✓ Delivered</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-3.5 bg-[#1F2C34] border-t border-white/[0.05] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-whatsapp-send"
              onClick={handleWhatsAppSend}
              className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5c] text-slate-950 rounded-xl flex items-center justify-center gap-2 text-xs font-black shadow-lg shadow-[#25D366]/20 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4 text-slate-950" />
              <span>Send WhatsApp</span>
            </button>

            <button
              id="btn-copy-whatsapp"
              onClick={handleCopyMessage}
              className="px-3.5 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            {/* Audio Voice Player */}
            <button
              id="btn-listen-gujarati"
              onClick={handlePlayAudio}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
                isAudioPlaying
                  ? 'bg-amber-400 text-slate-950 animate-pulse font-black'
                  : 'bg-white/[0.06] hover:bg-white/[0.1] text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isAudioPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                  <span>Stop Speech</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>Listen Audio (સાંભળો)</span>
                </>
              )}
            </button>
          </div>

          <button
            id="btn-save-task"
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-emerald-500/20"
          >
            <BookmarkPlus className="w-4 h-4 text-slate-950" />
            <span>{savedSuccess ? 'Saved to Board ✓' : 'Save Task Card'}</span>
          </button>
        </div>
      </div>

      {/* Spoken Audio Quote */}
      {editedTask.originalAudioText && (
        <div className="text-xs text-slate-400 bg-white/[0.03] p-3.5 rounded-2xl border border-white/[0.06] flex items-start gap-2">
          <span className="text-emerald-400 font-mono font-bold shrink-0">Original Input:</span>
          <span className="italic text-slate-300">“{editedTask.originalAudioText}”</span>
        </div>
      )}
    </div>
  );
};
