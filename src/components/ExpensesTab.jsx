import { useState } from 'react';
import { Search, Edit2, Trash2, Calendar, Fuel, Wrench, Coffee, AlertOctagon, Landmark, ShoppingBag, Plus, RefreshCw } from 'lucide-react';

const CATEGORIES_DETAILS = {
  'CNG/Fuel': { name: 'CNG / Gas / Fuel', icon: Fuel, style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  Maintenance: { name: 'Repairs & Service', icon: Wrench, style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  'Rent/EMI': { name: 'Daily Rent / EMI Loan', icon: Landmark, style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'Food/Tea': { name: 'Snacks & Food / Tea', icon: Coffee, style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  Fines: { name: 'Police Fines / Challan', icon: AlertOctagon, style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  Others: { name: 'Other Costs', icon: ShoppingBag, style: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

export default function ExpensesTab({ expenses, onAddExpenseClick, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All'); // All, Today, Yesterday, Last7Days, Month
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtering Logic
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = 
      (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exp.category && exp.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;

    let matchesDate = true;
    if (dateRange !== 'All' && exp.date) {
      const expDate = new Date(exp.date);
      expDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateRange === 'Today') {
        matchesDate = expDate.getTime() === today.getTime();
      } else if (dateRange === 'Yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        matchesDate = expDate.getTime() === yesterday.getTime();
      } else if (dateRange === 'Last7Days') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        matchesDate = expDate >= sevenDaysAgo && expDate <= today;
      } else if (dateRange === 'Month') {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        matchesDate = expDate >= firstDayOfMonth && expDate <= today;
      }
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  // Sorting Logic
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'amount-asc':
        return a.amount - b.amount;
      case 'amount-desc':
        return b.amount - a.amount;
      default:
        return 0;
    }
  });

  // Summarize Expenses by Category
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount || 0);
    return acc;
  }, {});

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const activeFiltersCount = 
    (categoryFilter !== 'All' ? 1 : 0) + 
    (dateRange !== 'All' ? 1 : 0) + 
    (sortBy !== 'date-desc' ? 1 : 0);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setDateRange('All');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Rickshaw Expenses
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Log fuel costs, daily EMIs, maintenance repairs, and food checks.
          </p>
        </div>
        <button
          onClick={onAddExpenseClick}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-650 hover:from-rose-400 hover:to-red-500 text-white font-bold shadow-lg shadow-rose-500/10 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={18} />
          <span>Log Expense Fares</span>
        </button>
      </div>

      {/* Expense Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {Object.keys(CATEGORIES_DETAILS).map(catKey => {
          const detail = CATEGORIES_DETAILS[catKey];
          const IconComp = detail.icon;
          const total = categoryTotals[catKey] || 0;
          return (
            <div key={catKey} className="glass-card p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between gap-2">
              <div className="flex justify-between items-start">
                <span className={`p-1.5 rounded-lg border ${detail.style}`}>
                  <IconComp size={13} />
                </span>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold truncate">{detail.name.split(' ')[0]}</span>
                <span className="text-base font-extrabold text-slate-100 mt-0.5 block">₹{total.toFixed(0)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and search panel */}
      <div className="glass-card p-5 rounded-2xl space-y-4 border border-slate-850">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by details, categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 text-sm transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            {/* Mobile Filters Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-305 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <span>⚙️</span>
              <span>{showFilters ? 'Hide Filters' : 'Filters & Sort'}</span>
              {activeFiltersCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick Clear Filter Button */}
            {(searchTerm || categoryFilter !== 'All' || dateRange !== 'All' || sortBy !== 'date-desc') && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-455 hover:text-rose-400 font-semibold py-2.5 px-3 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-Filter Row */}
        <div className={`${showFilters ? 'grid' : 'hidden md:grid'} grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-900/60 md:border-t-0 md:pt-0`}>
          {/* Category filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-455 uppercase tracking-wider block">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-350 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="All">All Categories</option>
              {Object.keys(CATEGORIES_DETAILS).map(k => (
                <option key={k} value={k}>{CATEGORIES_DETAILS[k].name}</option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-455 uppercase tracking-wider block">Time Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-355 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="All">All History</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last7Days">Last 7 Days</option>
              <option value="Month">This Month</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-455 uppercase tracking-wider block">Sort Expenses</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-355 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="date-desc">Date: Latest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="amount-desc">Cost: High to Low</option>
              <option value="amount-asc">Cost: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Results List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Expense Itemised Bills</span>
          <span className="text-xs font-bold text-rose-400 bg-rose-500/5 px-2.5 py-1 rounded-lg border border-rose-500/10">Filter Total: ₹{totalSpent.toFixed(0)}</span>
        </div>

        {sortedExpenses.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-400 font-medium">No expenses logged for this filter criteria.</p>
            <p className="text-slate-550 text-xs mt-1">Try logging a CNG fuel purchase or repairs to keep balance records active.</p>
          </div>
        ) : (
          sortedExpenses.map((exp) => {
            const detail = CATEGORIES_DETAILS[exp.category] || CATEGORIES_DETAILS.Others;
            const IconComp = detail.icon;
            return (
              <div
                key={exp.id}
                className="glass-card p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800/80 hover:border-slate-700/80 transition-all"
              >
                {/* Information */}
                <div className="flex items-start gap-4">
                  <span className={`p-3 rounded-xl border flex items-center justify-center ${detail.style}`}>
                    <IconComp size={18} />
                  </span>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-100">
                        {exp.notes ? exp.notes : detail.name}
                      </h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${detail.style}`}>
                        {detail.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-450">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Costs & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-900 pt-3 md:pt-0 md:border-t-0">
                  <div className="text-left md:text-right">
                    <span className="text-lg font-black text-rose-400">
                      -₹{exp.amount.toFixed(0)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pl-4 border-l border-slate-900">
                    <button
                      onClick={() => onEdit(exp)}
                      className="p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700/50 transition-all cursor-pointer"
                      title="Edit Expense"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(exp.id)}
                      className="p-3 rounded-xl text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                      title="Delete Expense"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
