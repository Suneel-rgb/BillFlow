import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Wallet, Plus, ArrowUpRight } from 'lucide-react';

const CATEGORIES = {
  Utilities: { color: 'from-blue-500 to-indigo-600', text: 'text-blue-400', bg: 'bg-blue-500/10' },
  Rent: { color: 'from-purple-500 to-pink-600', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  Subscriptions: { color: 'from-amber-500 to-orange-600', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  Food: { color: 'from-emerald-500 to-teal-600', text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  Leisure: { color: 'from-rose-500 to-red-600', text: 'text-rose-400', bg: 'bg-rose-500/10' },
  Savings: { color: 'from-teal-400 to-emerald-500', text: 'text-teal-400', bg: 'bg-teal-500/10' },
  Other: { color: 'from-slate-400 to-slate-600', text: 'text-slate-400', bg: 'bg-slate-500/10' },
};

export default function Dashboard({ 
  bills, 
  budget, 
  setBudget, 
  onOpenAddModal,
  savingsBalance,
  setSavingsBalance,
  savingsGoal,
  setSavingsGoal
}) {
  const paidBills = bills.filter(b => b.status === 'Paid');
  const unpaidBills = bills.filter(b => b.status === 'Unpaid');

  const totalSpent = paidBills.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const totalPending = unpaidBills.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  const budgetUsagePercent = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;
  const isBudgetExceeded = totalSpent > budget;

  // Group spent money by category
  const categorySpent = bills.reduce((acc, bill) => {
    if (bill.status === 'Paid') {
      acc[bill.category] = (acc[bill.category] || 0) + parseFloat(bill.amount || 0);
    }
    return acc;
  }, {});

  const maxSpentInCategory = Math.max(...Object.values(categorySpent), 1);

  // Frequency breakdowns
  const weeklyPaid = paidBills.filter(b => b.frequency === 'Weekly');
  const weeklyUnpaid = unpaidBills.filter(b => b.frequency === 'Weekly');
  const weeklySpentSum = weeklyPaid.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const weeklyPendingSum = weeklyUnpaid.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  const monthlyPaid = paidBills.filter(b => b.frequency === 'Monthly');
  const monthlyUnpaid = unpaidBills.filter(b => b.frequency === 'Monthly');
  const monthlySpentSum = monthlyPaid.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const monthlyPendingSum = monthlyUnpaid.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  const oneTimePaid = paidBills.filter(b => !b.frequency || b.frequency === 'One-time');
  const oneTimeUnpaid = unpaidBills.filter(b => !b.frequency || b.frequency === 'One-time');
  const oneTimeSpentSum = oneTimePaid.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
  const oneTimePendingSum = oneTimeUnpaid.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

  const savingsProgressPercent = savingsGoal > 0 ? Math.min(Math.round((savingsBalance / savingsGoal) * 100), 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            Financial Dashboard
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Keep track of your monthly budget, active bills, and recent spent items.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-teal-500/15 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={20} />
          <span>Add New Record</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Spent card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={100} className="text-teal-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Total Spent</span>
            <span className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <TrendingUp size={20} />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-white">₹{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="block text-xs text-teal-400/80 mt-1">Confirmed Paid Payments</span>
          </div>
        </div>

        {/* Pending Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertCircle size={100} className="text-rose-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Unpaid Bills</span>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertCircle size={20} />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold tracking-tight text-white">₹{totalPending.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="block text-xs text-rose-400/80 mt-1">{unpaidBills.length} payments outstanding</span>
          </div>
        </div>

        {/* Budget Card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet size={100} className="text-indigo-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Monthly Budget</span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Wallet size={20} />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">₹</span>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                className="text-3xl font-bold tracking-tight text-white bg-transparent border-b border-transparent hover:border-indigo-500 focus:border-indigo-400 focus:outline-none w-36 transition-all"
                title="Click to change budget"
              />
            </div>
            <span className="block text-xs text-indigo-400/80 mt-1">Click value to edit budget</span>
          </div>
        </div>
      </div>

      {/* Savings Goal Tracker */}
      <div className="glass-card p-6 rounded-2xl relative border border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-200">Savings Goal Tracker</h3>
            <p className="text-xs text-slate-400">Set a target savings goal and track your active progress</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Savings Balance</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  value={savingsBalance}
                  onChange={(e) => setSavingsBalance(parseFloat(e.target.value) || 0)}
                  className="w-28 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white font-bold focus:outline-none focus:border-teal-500"
                  title="Click to change savings balance"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Savings Goal</span>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-xs font-bold">₹</span>
                <input
                  type="number"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(parseFloat(e.target.value) || 0)}
                  className="w-28 bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white font-bold focus:outline-none focus:border-teal-500"
                  title="Click to change savings goal"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {savingsGoal > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-teal-400 font-semibold">Progress: {savingsProgressPercent}%</span>
              <span className="text-slate-400">₹{savingsBalance.toLocaleString()} / ₹{savingsGoal.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-850 rounded-full h-3 overflow-hidden border border-slate-800/40">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-indigo-500 transition-all duration-500"
                style={{ width: `${savingsProgressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Set a savings goal to begin tracking progress.</p>
        )}
      </div>

      {/* Frequency Breakdown Summaries */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Payment Frequency Summaries</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weekly card */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-slate-200">Weekly Payments</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 uppercase border border-blue-500/20">Weekly</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Spent:</span>
                <span className="font-semibold text-emerald-400">₹{weeklySpentSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Pending:</span>
                <span className="font-semibold text-rose-400">₹{weeklyPendingSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Monthly card */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-slate-200">Monthly Payments</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 uppercase border border-indigo-500/20">Monthly</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Spent:</span>
                <span className="font-semibold text-emerald-400">₹{monthlySpentSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Pending:</span>
                <span className="font-semibold text-rose-400">₹{monthlyPendingSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* One-Time card */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-slate-200">One-Time Payments</span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 uppercase border border-teal-500/20">One-Time</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Spent:</span>
                <span className="font-semibold text-emerald-400">₹{oneTimeSpentSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Total Pending:</span>
                <span className="font-semibold text-rose-400">₹{oneTimePendingSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Meter & Progress bar */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="font-bold text-lg text-slate-200">Budget Usage</h3>
            <p className="text-xs text-slate-400">Based on total spent vs. monthly limit</p>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${isBudgetExceeded ? 'text-rose-400' : 'text-teal-400'}`}>
              {budgetUsagePercent}%
            </span>
            <span className="text-xs text-slate-400 block">
              ₹{totalSpent.toFixed(0)} / ₹{budget.toFixed(0)}
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isBudgetExceeded ? 'bg-gradient-to-r from-red-500 to-rose-600' : 'bg-gradient-to-r from-teal-400 to-cyan-500'
            }`}
            style={{ width: `${budgetUsagePercent}%` }}
          />
        </div>
        {isBudgetExceeded && (
          <div className="flex items-center gap-2 mt-3 text-xs text-rose-400">
            <AlertCircle size={14} />
            <span>Warning: You have exceeded your set monthly budget!</span>
          </div>
        )}
      </div>

      {/* Category Breakdown list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="font-bold text-lg text-slate-200 mb-6 flex items-center gap-2">
            <span>Spending by Category</span>
            <ArrowUpRight size={18} className="text-slate-400" />
          </h3>
          <div className="space-y-5">
            {Object.keys(CATEGORIES).map(catName => {
              const spent = categorySpent[catName] || 0;
              const percentOfMax = Math.min((spent / maxSpentInCategory) * 100, 100);
              const theme = CATEGORIES[catName];

              return (
                <div key={catName} className="space-y-1">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-300">{catName}</span>
                    <span className="text-slate-200 font-bold">₹{spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${theme.color} transition-all duration-300`}
                      style={{ width: spent > 0 ? `${percentOfMax}%` : '0%' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Tips or Overview Breakdown counts */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-200 mb-4">Payment Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <CheckCircle size={18} />
                  </span>
                  <div>
                    <span className="block text-sm font-medium text-slate-300">Paid Items</span>
                    <span className="text-xs text-slate-500">Payments cleared</span>
                  </div>
                </div>
                <span className="text-base font-bold text-white">{paidBills.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <AlertCircle size={18} />
                  </span>
                  <div>
                    <span className="block text-sm font-medium text-slate-300">Unpaid Bills</span>
                    <span className="text-xs text-slate-500">Need attention</span>
                  </div>
                </div>
                <span className="text-base font-bold text-white">{unpaidBills.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
            <h4 className="text-sm font-semibold text-indigo-300 mb-1">Budgeting Tip</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plan your subscriptions and recurrent utilities at the start of the month. Try keeping at least 15% of your budget for unforeseen expenses.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
