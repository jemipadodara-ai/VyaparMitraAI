import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { ExtractedTaskData } from '../types';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  PieChart as PieIcon,
  BarChart3,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Wallet,
  Activity,
  Layers,
} from 'lucide-react';

interface FinancialChartProps {
  tasks: ExtractedTaskData[];
}

interface CustomTransaction {
  id: string;
  type: 'gain' | 'expense';
  title: string;
  amount: number;
  category: string;
  date: string;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ tasks }) => {
  const [customTransactions, setCustomTransactions] = useState<CustomTransaction[]>([
    {
      id: 'tx-1',
      type: 'expense',
      title: 'Tempo Transport / Freight (ભાડું)',
      amount: 1500,
      category: 'Transport',
      date: 'Today',
    },
    {
      id: 'tx-2',
      type: 'gain',
      title: 'Ramesh Cloth Store Advance Payment',
      amount: 8000,
      category: 'Sales Advance',
      date: 'Yesterday',
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'gain' | 'expense'>('expense');
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculate stats from saved tasks
  const paidTaskGains = tasks
    .filter((t) => t.paymentStatus === 'Paid' && t.amount)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const pendingTaskCollections = tasks
    .filter((t) => (t.paymentStatus === 'Pending' || t.paymentStatus === 'Partial') && t.amount)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const customGains = customTransactions
    .filter((t) => t.type === 'gain')
    .reduce((sum, t) => sum + t.amount, 0);

  const customExpenses = customTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalGains = paidTaskGains + customGains + 45000;
  const totalExpenses = customExpenses + 12500;
  const netProfit = totalGains - totalExpenses;

  // Monthly Comparison Chart Data
  const monthlyData = [
    { month: 'May', Gains: 32000, Expenses: 9500, Pending: 5000 },
    { month: 'Jun', Gains: 41000, Expenses: 11000, Pending: 8200 },
    { month: 'Jul', Gains: 38000, Expenses: 10200, Pending: 6400 },
    { month: 'Aug (Cur)', Gains: totalGains, Expenses: totalExpenses, Pending: pendingTaskCollections },
  ];

  // Category Distribution Data (Synora Modern Neon Palette)
  const categoryData = [
    { name: 'Completed Orders', value: totalGains * 0.65, color: '#10B981' }, // Mint
    { name: 'Pending Receivables', value: pendingTaskCollections || 12500, color: '#F59E0B' }, // Amber
    { name: 'Shop Expenses', value: totalExpenses, color: '#F43F5E' }, // Rose
    { name: 'Advance Collections', value: totalGains * 0.25, color: '#8B5CF6' }, // Purple
  ];

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || isNaN(Number(newAmount))) return;

    const tx: CustomTransaction = {
      id: 'tx-' + Date.now(),
      type: newType,
      title: newTitle.trim(),
      amount: Math.abs(Number(newAmount)),
      category: newType === 'gain' ? 'Income' : 'Expense',
      date: 'Just now',
    };

    setCustomTransactions([tx, ...customTransactions]);
    setNewTitle('');
    setNewAmount('');
    setShowAddModal(false);
  };

  return (
    <div id="financial-analytics-section" className="bg-[#0F1422]/90 border border-white/[0.08] rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                Vyapar Financial Intelligence & Ledger
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Live Analytics
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time revenue gains, operational expense ledger, and customer cash flow receivables
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-emerald-400 font-bold text-xs rounded-xl flex items-center gap-2 border border-emerald-500/30 shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Record Expense / Income</span>
        </button>
      </div>

      {/* Quick Entry Drawer */}
      {showAddModal && (
        <form
          onSubmit={handleAddTransaction}
          className="bg-[#141B2D] border border-white/[0.08] p-5 rounded-2xl space-y-4 animate-fade-in shadow-xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Record New Shop Income or Expense</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="text-[11px] font-mono font-bold text-slate-400 block mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'gain' | 'expense')}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none"
              >
                <option value="gain">Gain / Income (+ આવક)</option>
                <option value="expense">Expense (- ખર્ચ)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold text-slate-400 block mb-1">Title / Details</label>
              <input
                type="text"
                placeholder="e.g. Electric bill, Goods purchase, Tempo charge"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono font-bold text-slate-400 block mb-1">Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.08] rounded-xl p-2.5 text-xs font-mono font-bold text-emerald-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            Save Transaction to Ledger
          </button>
        </form>
      )}

      {/* Top 4 Synora Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gains */}
        <div className="bg-gradient-to-b from-emerald-500/10 to-[#141B2D]/80 border border-emerald-500/20 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Total Revenue (આવક)
            </span>
            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-300">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">₹{totalGains.toLocaleString('en-IN')}</div>
          <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">↑ +14.2%</span> vs last month
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-gradient-to-b from-rose-500/10 to-[#141B2D]/80 border border-rose-500/20 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg group hover:border-rose-500/40 transition">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
              Shop Expenses (ખર્ચ)
            </span>
            <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-300">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">₹{totalExpenses.toLocaleString('en-IN')}</div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
            Transport, stock & utilities
          </p>
        </div>

        {/* Pending Receivables */}
        <div className="bg-gradient-to-b from-amber-500/10 to-[#141B2D]/80 border border-amber-500/20 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Pending Cash (બાકી)
            </span>
            <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-300">
              <IndianRupee className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-400">
            ₹{pendingTaskCollections.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
            {tasks.filter((t) => t.paymentStatus === 'Pending').length} pending payment follow-ups
          </p>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-b from-cyan-500/10 to-[#141B2D]/80 border border-cyan-500/20 rounded-2xl p-4 text-white relative overflow-hidden shadow-lg group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400">
              Net Profit (ચોખ્ખો નફો)
            </span>
            <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-300">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-cyan-300">₹{netProfit.toLocaleString('en-IN')}</div>
          <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
            Profit Margin: <span className="text-cyan-400 font-bold">{Math.round((netProfit / (totalGains || 1)) * 100)}%</span>
          </p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart: Gains vs Expenses vs Pending */}
        <div className="lg:col-span-2 bg-[#141B2D]/70 border border-white/[0.06] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>Monthly Gains & Expense Comparison (મહિનાવાર ચાર્ટ)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono bg-white/[0.05] px-2.5 py-1 rounded-md border border-white/[0.08]">
              FY 2026-27
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                  contentStyle={{
                    backgroundColor: '#0B0F17',
                    borderRadius: '12px',
                    borderColor: '#334155',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Gains" fill="#10B981" radius={[4, 4, 0, 0]} name="Gains (આવક)" />
                <Bar dataKey="Expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Expenses (ખર્ચ)" />
                <Bar dataKey="Pending" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Pending (બાકી)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Revenue Distribution */}
        <div className="bg-[#141B2D]/70 border border-white/[0.06] rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <span>Revenue Distribution (આવક વહેંચણી)</span>
            </h3>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`₹${Math.round(Number(value)).toLocaleString('en-IN')}`, '']}
                    contentStyle={{ backgroundColor: '#0B0F17', borderRadius: '10px', borderColor: '#334155' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/[0.06]">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                </div>
                <span className="font-mono font-bold text-white">₹{Math.round(cat.value).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Ledger Entries */}
      <div className="bg-[#141B2D]/70 border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Recent Expense & Income Entries (તાજેતરના વહેવાર)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {customTransactions.length} recorded items
          </span>
        </div>

        <div className="divide-y divide-white/[0.05]">
          {customTransactions.map((tx) => (
            <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                    tx.type === 'gain'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {tx.type === 'gain' ? '+ GAIN' : '- EXPENSE'}
                </span>
                <span className="font-semibold text-slate-200">{tx.title}</span>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-[10px] text-slate-500 font-mono">{tx.date}</span>
                <span
                  className={`font-mono font-bold ${
                    tx.type === 'gain' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {tx.type === 'gain' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
