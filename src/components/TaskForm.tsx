import React, { useState, useEffect } from 'react';
import { ExtractedTaskData, TaskStatus } from '../types';
import {
  PlusCircle,
  User,
  ShoppingBag,
  IndianRupee,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  FileText,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface TaskFormProps {
  onSaveTask: (task: ExtractedTaskData) => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSaveTask }) => {
  const [customerName, setCustomerName] = useState('');
  const [actionType, setActionType] = useState<ExtractedTaskData['actionType']>('Order');
  const [itemsQuantity, setItemsQuantity] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<ExtractedTaskData['paymentStatus']>('Pending');
  const [dueDateLabel, setDueDateLabel] = useState('Tomorrow (કાલે)');
  const [priority, setPriority] = useState<ExtractedTaskData['priority']>('Medium');
  const [status, setStatus] = useState<TaskStatus>('New');
  const [summary, setSummary] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [isSuccessMessageVisible, setIsSuccessMessageVisible] = useState(false);

  useEffect(() => {
    if (!customerName.trim()) return;

    const amtText = amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '₹0';
    const itemsText = itemsQuantity.trim() ? itemsQuantity.trim() : 'સામાન';
    const dueText = dueDateLabel.trim() ? dueDateLabel.trim() : 'જલ્દી';

    let autoMsg = '';
    if (actionType === 'Order') {
      autoMsg = `નમસ્તે ${customerName.trim()}જી, આપનો ${itemsText} નો ઓર્ડર નોંધી લીધો છે. રકમ: ${amtText} (${paymentStatus}). ડિલિવરી: ${dueText}. આભાર! - વેપારમિત્ર`;
    } else if (actionType === 'Payment Reminder') {
      autoMsg = `નમસ્તે ${customerName.trim()}જી, આપની કુલ બાકી રકમ ${amtText} ભરવાની બાકી છે. કૃપા કરીને ${dueText} સુધીમાં ચૂકવણી કરવા નમ્ર વિનંતી. આભાર!`;
    } else if (actionType === 'Delivery Instruction') {
      autoMsg = `નમસ્તે ${customerName.trim()}જી, આપનો સામાન (${itemsText}) ${dueText} સુધીમાં પહોંચાડી દેવામાં આવશે. કુલ રકમ: ${amtText}. આભાર!`;
    } else {
      autoMsg = `નમસ્તે ${customerName.trim()}જી, ${summary || itemsText} સંદર્ભે સંપર્ક કરવા વિનંતી. આભાર! - વેપારમિત્ર`;
    }

    setWhatsappMessage(autoMsg);
  }, [customerName, actionType, itemsQuantity, amount, paymentStatus, dueDateLabel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('Please enter Customer Name.');
      return;
    }

    const numAmount = amount ? parseFloat(amount) : 0;
    const formattedAmt = numAmount > 0 ? `₹${numAmount.toLocaleString('en-IN')}` : '₹0';

    const newTask: ExtractedTaskData = {
      id: `task-${Date.now()}`,
      customerName: customerName.trim(),
      actionType,
      itemsQuantity: itemsQuantity.trim() || 'N/A',
      amount: numAmount,
      formattedAmount: formattedAmt,
      paymentStatus,
      dueDate: dueDateLabel,
      dueDateLabel: dueDateLabel,
      priority,
      status,
      summary: summary.trim() || `${actionType} for ${customerName.trim()} (${itemsQuantity || 'General'})`,
      summaryGujarati: summary.trim() || `${customerName.trim()} માટે ${actionType}`,
      suggestedNextAction: `Follow up with ${customerName.trim()} for ${actionType}.`,
      suggestedNextActionGujarati: `${customerName.trim()} સાથે ${actionType} સંદર્ભે સંપર્ક કરો.`,
      whatsappMessage: whatsappMessage.trim(),
      whatsappMessageEnglish: `Hello ${customerName.trim()}, regarding your ${actionType} (${itemsQuantity || ''}), amount ${formattedAmt} is ${paymentStatus}. Thank you!`,
      confidenceScore: 100,
      detectedLanguage: 'Manual Entry',
      createdAt: new Date().toISOString(),
      originalAudioText: 'Direct Form Entry',
    };

    onSaveTask(newTask);

    setIsSuccessMessageVisible(true);
    setTimeout(() => setIsSuccessMessageVisible(false), 3000);

    setCustomerName('');
    setItemsQuantity('');
    setAmount('');
    setSummary('');
  };

  const handleReset = () => {
    setCustomerName('');
    setActionType('Order');
    setItemsQuantity('');
    setAmount('');
    setPaymentStatus('Pending');
    setDueDateLabel('Tomorrow (કાલે)');
    setPriority('Medium');
    setStatus('New');
    setSummary('');
    setWhatsappMessage('');
  };

  return (
    <div className="bg-[#0F1422]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black shadow">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Direct Task Entry Form / મેન્યુઅલ એન્ટ્રી</span>
            </h2>
            <p className="text-xs text-slate-400">
              Insert new business records directly into your isolated SQLite database
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 transition border border-white/[0.08]"
          title="Reset Form Fields"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset</span>
        </button>
      </div>

      {isSuccessMessageVisible && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 font-bold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Task successfully inserted into your SQLite database!</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Customer Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customer Name (ગ્રાહક) *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. મનોજભાઈ / Manoj Patel"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#141B2D]/70 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none"
            />
          </div>

          {/* Action Type */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Category / Action Type</span>
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value as any)}
              className="w-full bg-[#141B2D]/70 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none"
            >
              <option value="Order">Order (ઓર્ડર)</option>
              <option value="Payment Reminder">Payment Reminder (પેમેન્ટ બાકી)</option>
              <option value="Delivery Instruction">Delivery Instruction (ડિલિવરી)</option>
              <option value="Customer Follow-up">Customer Follow-up (ફોલો-અપ)</option>
              <option value="Task">Task (સામાન્ય કાર્ય)</option>
            </select>
          </div>

          {/* Amount (₹) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
              <span>Amount (રકમ ₹)</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#141B2D]/70 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
            />
          </div>

          {/* Items / Quantity */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Items / Quantity (સામાન)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 25 Boxes, 50 Sarees"
              value={itemsQuantity}
              onChange={(e) => setItemsQuantity(e.target.value)}
              className="w-full bg-[#141B2D]/70 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none"
            />
          </div>

          {/* Payment Status */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-300 uppercase">
              Payment Status
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as any)}
              className="w-full bg-[#141B2D]/70 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none"
            >
              <option value="Pending">Pending (બાકી)</option>
              <option value="Partial">Partial (અંશતઃ ચૂકવેલ)</option>
              <option value="Paid">Paid (ચૂકવાઈ ગયેલ)</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>Due Date Label (તારીખ)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Tomorrow (કાલે), Monday"
              value={dueDateLabel}
              onChange={(e) => setDueDateLabel(e.target.value)}
              className="w-full bg-[#141B2D]/70 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none"
            />
          </div>
        </div>

        {/* Summary Description */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-bold text-slate-300 uppercase">
            Summary / Notes (વિગત નોંધ)
          </label>
          <input
            type="text"
            placeholder="e.g. Deliver 25 boxes and collect invoice payment"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full bg-[#141B2D]/70 border border-white/[0.08] focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none"
          />
        </div>

        {/* WhatsApp Message Preview */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono font-bold text-emerald-400 uppercase flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Gujarati WhatsApp Message (ઓટો-જનરેટેડ)</span>
          </label>
          <textarea
            rows={2}
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            className="w-full bg-[#111B21] border border-emerald-500/30 rounded-xl p-3 text-xs font-medium text-emerald-200 focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Insert Task to SQLite Database</span>
          </button>
        </div>
      </form>
    </div>
  );
};
