import React, { useState } from 'react';
import {
  ExtractedTaskData,
  TaskStatus,
  TaskCategory,
  PaymentStatus,
} from '../types';
import { exportTasksToCsv } from '../utils/csv';
import { getWhatsAppShareUrl } from '../utils/whatsapp';
import {
  Search,
  Filter,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  Trash2,
  Share2,
  User,
  ShoppingBag,
  IndianRupee,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Tag,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';

interface TaskBoardProps {
  tasks: ExtractedTaskData[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTaskToView: (task: ExtractedTaskData) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onUpdateTaskStatus,
  onDeleteTask,
  onSelectTaskToView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.summaryGujarati.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.itemsQuantity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || task.actionType === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All' || task.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'In Progress':
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      case 'Pending Payment':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'New':
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div id="task-registry-section" className="bg-[#0F1422]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>Task & Orders Registry / વહીવટ બોર્ડ</span>
            </h2>
            <span className="text-[10px] bg-slate-800 text-slate-300 font-mono font-bold px-2 py-0.5 rounded-full border border-white/[0.08]">
              {tasks.length} SQL Records
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Track business deliveries, customer payments, and WhatsApp follow-up statuses
          </p>
        </div>

        <button
          onClick={() => exportTasksToCsv(tasks)}
          disabled={tasks.length === 0}
          className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-white/[0.08] transition active:scale-95 disabled:opacity-40 self-start sm:self-auto"
          title="Export CSV for Excel"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, item, note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141B2D]/70 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-[#141B2D]/70 border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
        >
          <option value="All">All Categories (બધા પ્રકાર)</option>
          <option value="Order">Orders</option>
          <option value="Payment Reminder">Payment Reminders</option>
          <option value="Delivery Instruction">Delivery Instructions</option>
          <option value="Customer Follow-up">Customer Follow-ups</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#141B2D]/70 border border-white/[0.08] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
        >
          <option value="All">All Statuses (બધી સ્થિતિ)</option>
          <option value="New">New</option>
          <option value="In Progress">In Progress</option>
          <option value="Pending Payment">Pending Payment</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Task List / Cards */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-[#141B2D]/40 rounded-2xl border border-dashed border-white/[0.08] space-y-2">
          <FolderOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-xs font-bold text-slate-300">No tasks found in database</h3>
          <p className="text-[11px] text-slate-500">
            {tasks.length === 0
              ? 'Speak or use Direct Form to add your first Gujarati business task'
              : 'Try clearing your search filter'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                className="bg-[#141B2D]/80 border border-white/[0.06] hover:border-white/20 rounded-2xl p-4 transition-all shadow-md space-y-3"
              >
                {/* Main Card Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 font-black text-xs flex items-center justify-center shrink-0">
                      {task.customerName.charAt(0) || 'T'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-black text-white">{task.customerName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-300 border border-white/[0.08] font-semibold">
                          {task.actionType}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        {task.summaryGujarati || task.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-auto">
                    {/* Amount */}
                    <div className="text-right font-mono">
                      <div className="text-xs font-black text-emerald-400">
                        {task.formattedAmount || `₹${task.amount}`}
                      </div>
                      <span className="text-[10px] text-slate-400">({task.paymentStatus})</span>
                    </div>

                    {/* Status Dropdown */}
                    <select
                      value={task.status}
                      onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className={`text-xs font-bold rounded-xl px-2.5 py-1.5 border focus:outline-none ${getStatusBadge(
                        task.status
                      )}`}
                    >
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Payment">Pending Payment</option>
                      <option value="Completed">Completed</option>
                    </select>

                    {/* Expand Button */}
                    <button
                      onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                      className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Sub Metadata Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-white/[0.04]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <ShoppingBag className="w-3 h-3 text-amber-400" />
                      {task.itemsQuantity}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      {task.dueDateLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectTaskToView(task)}
                      className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <span>Edit Task Card</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete record for "${task.customerName}" from database?`)) {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details / WhatsApp View */}
                {isExpanded && (
                  <div className="bg-[#0B141A] p-3.5 rounded-xl border border-emerald-500/20 space-y-2 mt-2">
                    <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono font-bold">
                      <span>WhatsApp Message Draft:</span>
                      <button
                        onClick={() => {
                          const url = getWhatsAppShareUrl(task.whatsappMessage);
                          window.open(url, '_blank');
                        }}
                        className="px-2.5 py-1 bg-[#25D366] text-slate-950 rounded-lg flex items-center gap-1 font-bold shadow active:scale-95 transition"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>Send Now</span>
                      </button>
                    </div>
                    <p className="text-xs text-emerald-100 font-medium leading-relaxed bg-[#005C4B]/40 p-2.5 rounded-lg border border-emerald-500/20">
                      {task.whatsappMessage}
                    </p>
                    {task.suggestedNextActionGujarati && (
                      <div className="text-[11px] text-slate-300 font-medium">
                        <strong className="text-emerald-400">Next Step:</strong>{' '}
                        {task.suggestedNextActionGujarati}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
