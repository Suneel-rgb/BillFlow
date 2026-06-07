import { useState } from 'react';
import { CreditCard, Plus, ChevronRight } from 'lucide-react';

const QUICK_CATEGORIES = [
  { id: 'Electricity', label: 'Electricity', emoji: '⚡' },
  { id: 'Water', label: 'Water Bill', emoji: '💧' },
  { id: 'Mobile/WiFi', label: 'Mobile & Wi-Fi', emoji: '📱' },
  { id: 'Gas', label: 'Gas cylinder', emoji: '🔥' },
  { id: 'Others', label: 'Other Bill', emoji: '🛍️' }
];

export default function PersonalDashboard({
  bills,
  personalExpenses,
  personalBudget,
  setPersonalBudget,
  onQuickBillSubmit,
  onOpenAddBillModal,
  onOpenAddExpenseModal,
  setActiveTab
}) {
  const [quickAmount, setQuickAmount] = useState('');
  const [quickCategory, setQuickCategory] = useState('Electricity');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickFrequency, setQuickFrequency] = useState('Monthly');
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(personalBudget.toString());

  // Filter bills & expenses for this month
  const currentMonthStr = new Date().toISOString().substring(0, 7); // e.g. "2026-06"
  const thisMonthBills = bills.filter(b => b.dueDate && b.dueDate.startsWith(currentMonthStr));
  const thisMonthExpenses = personalExpenses.filter(e => e.date && e.date.startsWith(currentMonthStr));

  // Stats Calculations
  const paidBillsTotal = thisMonthBills
    .filter(b => b.status === 'Paid')
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const unpaidBillsTotal = thisMonthBills
    .filter(b => b.status === 'Unpaid')
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  
  const totalBillsTotal = thisMonthBills.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const totalExpensesTotal = thisMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const thisMonthMonthlyBillsTotal = thisMonthBills
    .filter(b => (b.frequency || 'Monthly') === 'Monthly')
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const thisMonthWeeklyBillsTotal = thisMonthBills
    .filter(b => b.frequency === 'Weekly')
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  
  // Total spending = paid bills + personal expenses
  const totalSpending = paidBillsTotal + totalExpensesTotal;

  // Budget progress
  const budgetProgress = personalBudget > 0 ? Math.min(Math.round((totalSpending / personalBudget) * 100), 100) : 0;
  const isBudgetExceeded = totalSpending > personalBudget && personalBudget > 0;

  // Radial progress calculations
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (budgetProgress / 100) * circumference;

  const handleQuickBill = (e) => {
    e.preventDefault();
    const amount = parseFloat(quickAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid bill amount.');
      return;
    }
    const title = quickTitle.trim() || `${quickCategory} Bill`;

    onQuickBillSubmit(title, amount, quickCategory, quickFrequency);
    setQuickAmount('');
    setQuickTitle('');
  };

  const handleSaveBudget = (e) => {
    e.preventDefault();
    const newBudget = parseFloat(tempBudget);
    if (isNaN(newBudget) || newBudget < 0) {
      alert('Please enter a valid budget amount.');
      return;
    }
    setPersonalBudget(newBudget);
    setIsEditingBudget(false);
  };

  // Unpaid bills sorted by date (earliest first)
  const pendingBills = bills.filter(b => b.status === 'Unpaid')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  return (
    <div className="space-y-8 animate-fade-in text-emerald-100">
      {/* Top Welcome / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-550 bg-clip-text text-transparent font-heading">
            Personal Bills Dashboard
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Manage utility bills, subscriptions, and track personal expenses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenAddBillModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/10 transition-all hover:-translate-y-0.5 cursor-pointer text-xs sm:text-sm"
          >
            <Plus size={16} />
            <span>Record Bill</span>
          </button>
          <button
            onClick={onOpenAddExpenseModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-emerald-400 hover:bg-slate-850 hover:text-emerald-350 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <CreditCard size={16} />
            <span>Log Spend</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Monthly Spend */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group border border-emerald-500/10">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">This Month's Spending</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 block">₹{totalSpending.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Paid Bills: ₹{paidBillsTotal.toLocaleString()} | Spends: ₹{totalExpensesTotal.toLocaleString()}</span>
        </div>

        {/* Unpaid / Pending Bills */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group border border-slate-800">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Pending Bills Due</span>
          <span className="text-xl sm:text-2xl font-black text-rose-450 mt-2 block">₹{unpaidBillsTotal.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{thisMonthBills.filter(b => b.status === 'Unpaid').length} unpaid bills this month</span>
        </div>

        {/* Total Monthly Bills */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly vs Weekly Bills</span>
          <span className="text-xl sm:text-2xl font-black text-slate-100 mt-2 block">₹{totalBillsTotal.toLocaleString()}</span>
          <span className="text-[9px] text-slate-555 block mt-0.5 font-semibold">Monthly: ₹{thisMonthMonthlyBillsTotal.toLocaleString()} | Weekly: ₹{thisMonthWeeklyBillsTotal.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Core Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (Budget wheel & Quick Log) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Budget progress wheel */}
          <div className="glass-card p-6 rounded-3xl border border-emerald-500/10 shadow-lg shadow-black/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-4 text-center sm:text-left flex-1">
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-heading">Monthly Budget limit</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Compare total personal expenses & paid bills against your goal.
                </p>
              </div>

              <div className="space-y-2">
                {isEditingBudget ? (
                  <form onSubmit={handleSaveBudget} className="flex gap-2">
                    <input
                      type="number"
                      value={tempBudget}
                      onChange={(e) => setTempBudget(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-32 font-bold"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTempBudget(personalBudget.toString());
                        setIsEditingBudget(false);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-slate-100">₹{personalBudget.toLocaleString()}</span>
                    <button
                      onClick={() => setIsEditingBudget(true)}
                      className="text-[10px] text-emerald-450 hover:text-emerald-450 font-bold px-2 py-1 bg-emerald-500/10 rounded-md border border-emerald-500/20 cursor-pointer"
                    >
                      Edit Budget
                    </button>
                  </div>
                )}
                
                {isBudgetExceeded ? (
                  <span className="inline-block text-[10px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                    ⚠️ Budget Exceeded by ₹{(totalSpending - personalBudget).toLocaleString()}!
                  </span>
                ) : (
                  <span className="inline-block text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    👍 ₹{(personalBudget - totalSpending).toLocaleString()} remaining in budget
                  </span>
                )}
              </div>
            </div>

            {/* Circular Progress Wheel */}
            <div className="relative flex justify-center items-center flex-shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                {/* Track circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="#1e293b"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Glowing progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke={isBudgetExceeded ? "#f87171" : "#10b981"}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-700 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              {/* Central Text */}
              <div className="absolute text-center">
                <span className={`text-xl font-black block leading-none ${isBudgetExceeded ? 'text-rose-400' : 'text-slate-100'}`}>
                  {budgetProgress}%
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider block mt-1">Spent</span>
              </div>
            </div>
          </div>

          {/* Quick Bill logging panel */}
          <div className="glass-card p-6 rounded-3xl border border-slate-850 space-y-4 shadow-lg shadow-black/10">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-heading">Quick Record Utility Bill</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Quickly log pending bills directly to your history ledger.</p>
            </div>

            <form onSubmit={handleQuickBill} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none font-semibold"
                  >
                    {QUICK_CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">Bill Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. BESCOM"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 placeholder-slate-650"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">Amount (₹)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs font-bold pointer-events-none">₹</span>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500"
                      value={quickAmount}
                      onChange={(e) => setQuickAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold placeholder-slate-650"
                    />
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider mb-1.5">Cycle</label>
                  <select
                    value={quickFrequency}
                    onChange={(e) => setQuickFrequency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 appearance-none font-semibold"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Log Unpaid Bill</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (Upcoming pending bills list) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-850 flex-1">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-base text-slate-200">Upcoming Pending Bills</h3>
              <button
                onClick={() => setActiveTab('bills')}
                className="text-xs text-emerald-400 hover:text-emerald-350 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {pendingBills.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/45 rounded-xl border border-dashed border-slate-850">
                  🎉 Excellent! No pending unpaid bills found.
                </div>
              ) : (
                pendingBills.slice(0, 5).map((bill) => (
                  <div key={bill.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-900/35 border border-slate-850 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-100 block">
                        {bill.title}
                      </span>
                      <span className="text-[10px] text-slate-450 block">
                        Due: {new Date(bill.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <span className="font-black text-rose-400 text-sm">₹{bill.amount.toFixed(0)}</span>
                      <span className="text-[9px] font-bold text-rose-400/80 uppercase tracking-widest bg-rose-500/5 px-1.5 py-0.5 rounded border border-rose-500/10">Unpaid</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/10">
            <h4 className="text-xs font-bold text-emerald-400 mb-0.5">Personal Finance Tip</h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              To build savings, automate your utility bill payments and try to restrict non-essential expenses to stay well below your monthly budget ceiling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
