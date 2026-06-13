import { useState } from 'react';
import { Search, Edit2, Trash2, Calendar, Fuel, Wrench, Coffee, AlertOctagon, Landmark, ShoppingBag, Plus, RefreshCw, Clock } from 'lucide-react';

const CATEGORIES_DETAILS = {
  'CNG/Fuel': { name: 'CNG / Gas / Fuel', icon: Fuel, style: 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20' },
  Maintenance: { name: 'Repairs & Service', icon: Wrench, style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  'Rent/EMI': { name: 'Daily Rent / EMI Loan', icon: Landmark, style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'Food/Tea': { name: 'Snacks & Food / Tea', icon: Coffee, style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  Fines: { name: 'Police Fines / Challan', icon: AlertOctagon, style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  Others: { name: 'Other Costs', icon: ShoppingBag, style: 'bg-slate-500/10 text-slate-455 border-slate-500/20' },
};

function SwipeableItem({ children, onEdit, onDelete }) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleTouchStart = (e) => {
    if (window.innerWidth >= 768) return;
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const currentTouchX = e.touches[0].clientX;
    let diff = currentTouchX - startX;
    
    if (isOpen) {
      diff = diff - 130;
    }

    if (diff > 15) diff = 15;
    if (diff < -150) diff = -150;

    setCurrentX(diff);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentX < -65) {
      setIsOpen(true);
      setCurrentX(-130);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try { window.navigator.vibrate(15); } catch (e) {}
      }
    } else {
      setIsOpen(false);
      setCurrentX(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentX(0);
  };

  return (
    <div className="swipe-container group relative">
      <div className="swipe-actions-bg bg-slate-955 border border-slate-900">
        <div className="flex items-center gap-1.5 pr-1">
          <button
            onClick={() => {
              onEdit();
              handleClose();
            }}
            className="flex items-center justify-center p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white min-h-[44px] w-12 transition-all cursor-pointer border border-slate-800"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              onDelete();
              handleClose();
            }}
            className="flex items-center justify-center p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-455 min-h-[44px] w-12 transition-all cursor-pointer border border-rose-500/25"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${currentX}px)` }}
        className="swipe-foreground"
      >
        {children}
      </div>
    </div>
  );
}

export default function ExpensesTab({ expenses, onAddExpenseClick, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All'); // All, Today, Yesterday, Week, Month
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtering Logic (strictly displaying relative to selected dateRange)
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = 
      (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exp.category && exp.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'All' || exp.category === categoryFilter;

    // Filter matching Date Range
    let matchesDate = true;
    if (exp.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expDate = new Date(exp.date);
      expDate.setHours(0, 0, 0, 0);

      if (dateRange === 'Today') {
        matchesDate = expDate.getTime() === today.getTime();
      } else if (dateRange === 'Yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        matchesDate = expDate.getTime() === yesterday.getTime();
      } else if (dateRange === 'Week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        matchesDate = expDate >= sevenDaysAgo && expDate <= today;
      } else if (dateRange === 'Month') {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        matchesDate = expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      }
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  // Sorting Logic
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        const tA = a.createdAt || (isNaN(Number(a.id)) ? 0 : Number(a.id));
        const tB = b.createdAt || (isNaN(Number(b.id)) ? 0 : Number(b.id));
        if (tA || tB) return tA - tB;
        return new Date(a.date) - new Date(b.date);
      case 'date-desc':
        const timeA = a.createdAt || (isNaN(Number(a.id)) ? 0 : Number(a.id));
        const timeB = b.createdAt || (isNaN(Number(b.id)) ? 0 : Number(b.id));
        if (timeA || timeB) return timeB - timeA;
        return new Date(b.date) - new Date(a.date);
      case 'amount-asc':
        return a.amount - b.amount;
      case 'amount-desc':
        return b.amount - a.amount;
      default:
        return 0;
    }
  });

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalCNGSpent = filteredExpenses
    .filter(e => e.category === 'CNG/Fuel')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

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
    <div className="space-y-6 animate-fade-in relative z-10">
      
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Expenses Log
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Log fuel CNG bills, vehicle repair sessions, EMI loans, and daily maintenance overheads.
          </p>
        </div>
        <button
          onClick={onAddExpenseClick}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-805 text-rose-400 hover:text-rose-350 hover:bg-slate-850 hover:border-slate-700 transition-all text-xs cursor-pointer font-bold"
        >
          <Plus size={16} />
          <span>Log New Expense</span>
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-rose-500/15">
          <span className="text-[9px] font-bold text-rose-455 uppercase tracking-wider block font-heading">Total Expenses Selected</span>
          <span className="text-xl font-black text-rose-400 mt-1 block">₹{totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{filteredExpenses.length} receipts logged</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-850 col-span-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-heading">CNG Fuel Portion</span>
          <span className="text-xl font-bold text-slate-200 mt-1 block">₹{totalCNGSpent.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{filteredExpenses.length > 0 ? ((totalCNGSpent / Math.max(totalSpent, 1)) * 100).toFixed(0) : 0}% of expenses</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-855 col-span-2 md:col-span-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-heading">Average Cost</span>
          <span className="text-xl font-bold text-slate-200 mt-1 block">₹{filteredExpenses.length > 0 ? (totalSpent / filteredExpenses.length).toFixed(0) : 0}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Average amount per logged expense</span>
        </div>
      </div>

      {/* Filters & Search Panel */}
      <div className="glass-card p-5 rounded-2xl space-y-4 border border-slate-850">
        
        {/* Search & Toggle row */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by notes, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none text-xs transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <span>⚙️</span>
              <span>{showFilters ? 'Hide Filters' : 'Filters & Sort'}</span>
              {activeFiltersCount > 0 && (
                <span className="bg-rose-500 text-slate-955 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick Clear Filter Button */}
            {(searchTerm || categoryFilter !== 'All' || dateRange !== 'All' || sortBy !== 'date-desc') && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-400 hover:text-rose-350 font-semibold py-2.5 px-3 hover:bg-rose-500/10 rounded-xl transition-colors border border-rose-500/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Chips for category & dates */}
        <div className="space-y-3 pt-2">
          {/* Date Chips */}
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Filter by Date</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x pb-1">
              {[
                { id: 'All', label: 'All History' },
                { id: 'Today', label: 'Today' },
                { id: 'Yesterday', label: 'Yesterday' },
                { id: 'Week', label: 'Last 7 Days' },
                { id: 'Month', label: 'This Month' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setDateRange(d.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border snap-center cursor-pointer transition-all ${
                    dateRange === d.id
                      ? 'bg-rose-500 text-slate-950 border-transparent shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Filter by Category</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x pb-1">
              {[
                { id: 'All', label: 'All Categories' },
                { id: 'CNG/Fuel', label: '⛽ Fuel CNG' },
                { id: 'Maintenance', label: '🔧 Maintenance' },
                { id: 'Rent/EMI', label: '🏦 Rent / Loan EMI' },
                { id: 'Food/Tea', label: '☕ Food & Tea' },
                { id: 'Fines', label: '🚨 Police Fines' },
                { id: 'Others', label: '🛍️ Others' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border snap-center cursor-pointer transition-all ${
                    categoryFilter === c.id
                      ? 'bg-rose-500 text-slate-950 border-transparent shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible sort selection */}
        <div className={`${showFilters ? 'block' : 'hidden md:block'} pt-2`}>
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Sort Records</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 text-xs focus:outline-none focus:border-rose-500"
            >
              <option value="date-desc">Added On: Newest First</option>
              <option value="date-asc">Added On: Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Feed */}
      <div className="space-y-3">
        {sortedExpenses.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-400 font-medium">No logged expense receipts match your filter criteria.</p>
            <p className="text-slate-550 text-xs mt-1">Try resetting the filters or log a record to populate the log feed!</p>
          </div>
        ) : (
          sortedExpenses.map((exp) => {
            const cat = CATEGORIES_DETAILS[exp.category] || CATEGORIES_DETAILS.Others;
            const IconComponent = cat.icon;
            return (
              <SwipeableItem
                key={exp.id}
                onEdit={() => onEdit(exp)}
                onDelete={() => onDelete(exp.id)}
              >
                <div
                  className="glass-card p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-850 hover:border-slate-800 transition-all text-left"
                >
                  {/* Left Info Area */}
                  <div className="flex items-start gap-4">
                    <span className="p-3 bg-slate-955 border border-slate-855 rounded-xl text-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent size={20} className="text-slate-300" />
                    </span>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-[200px] sm:max-w-xs" title={exp.notes || cat.name}>
                          {exp.notes ? exp.notes : cat.name}
                        </h4>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border flex-shrink-0 ${cat.style}`}>
                          {cat.name}
                        </span>
                      </div>

                      {/* Metadata: Date & Time */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-450 pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-500 flex-shrink-0" />
                          <span>{new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                        {(() => {
                          const timestamp = exp.createdAt || (isNaN(Number(exp.id)) ? null : Number(exp.id));
                          if (!timestamp) return null;
                          try {
                            const timeStr = new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
                            return (
                              <span className="flex items-center gap-1.5">
                                <Clock size={12} className="text-slate-500 flex-shrink-0" />
                                <span>{timeStr}</span>
                              </span>
                            );
                          } catch (e) {
                            return null;
                          }
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Right Amount area */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-900 pt-3 md:pt-0 md:border-t-0">
                    <div className="text-left md:text-right">
                      <span className="text-base sm:text-lg font-black text-rose-400">
                        -₹{exp.amount.toFixed(0)}
                      </span>
                    </div>

                    {/* Desktop actions pane */}
                    <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-900">
                      <button
                        onClick={() => onEdit(exp)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                        title="Edit Expense"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(exp.id)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                        title="Delete Expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </SwipeableItem>
            );
          })
        )}
      </div>
    </div>
  );
}
