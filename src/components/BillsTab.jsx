import { useState } from 'react';
import { Search, Edit2, Trash2, Calendar, CreditCard, RefreshCw, Plus, Clock } from 'lucide-react';

const CATEGORIES_DETAILS = {
  Rent: { name: 'House Rent', emoji: '🏠', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  Electricity: { name: 'Electricity', emoji: '⚡', style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  Water: { name: 'Water Bill', emoji: '💧', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'Mobile/WiFi': { name: 'Mobile & Wi-Fi', emoji: '📱', style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  Gas: { name: 'Cooking Gas', emoji: '🔥', style: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  Subscription: { name: 'Subscriptions', emoji: '📺', style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  Insurance: { name: 'Insurance', emoji: '🛡️', style: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  Education: { name: 'Education', emoji: '🎓', style: 'bg-rose-500/10 text-rose-450 border-rose-500/20' },
  Others: { name: 'Others', emoji: '🛍️', style: 'bg-slate-500/10 text-slate-455 border-slate-500/20' }
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
      <div className="swipe-actions-bg bg-slate-950 border border-slate-900">
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

export default function BillsTab({ bills, onAddBillClick, onEdit, onDelete, onToggleStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All'); // All, Today, Yesterday, Week, Month
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtering Logic
  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      (bill.title && bill.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.category && bill.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.notes && bill.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'All' || bill.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;

    // Filter matching Date Range (relative to dueDate)
    let matchesDate = true;
    if (bill.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const billDate = new Date(bill.dueDate);
      billDate.setHours(0, 0, 0, 0);

      if (dateRange === 'Today') {
        matchesDate = billDate.getTime() === today.getTime();
      } else if (dateRange === 'Yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        matchesDate = billDate.getTime() === yesterday.getTime();
      } else if (dateRange === 'Week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        matchesDate = billDate >= sevenDaysAgo && billDate <= today;
      } else if (dateRange === 'Month') {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        matchesDate = billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesDate;
  });

  // Sorting Logic
  const sortedBills = [...filteredBills].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'date-desc':
        return new Date(b.dueDate) - new Date(a.dueDate);
      case 'amount-asc':
        return a.amount - b.amount;
      case 'amount-desc':
        return b.amount - a.amount;
      default:
        return 0;
    }
  });

  const unpaidTotal = filteredBills
    .filter(b => b.status === 'Unpaid')
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  
  const paidTotal = filteredBills
    .filter(b => b.status === 'Paid')
    .reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

  const activeFiltersCount = 
    (categoryFilter !== 'All' ? 1 : 0) + 
    (statusFilter !== 'All' ? 1 : 0) + 
    (dateRange !== 'All' ? 1 : 0) + 
    (sortBy !== 'date-desc' ? 1 : 0);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setDateRange('All');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10 text-emerald-100">
      
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Utility Bills
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Log, track, and pay your recurring bills and household commitments.
          </p>
        </div>
        <button
          onClick={onAddBillClick}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-450 hover:to-teal-550 text-slate-950 font-black shadow-lg shadow-emerald-500/10 transition-all cursor-pointer text-xs"
        >
          <Plus size={16} />
          <span>Record New Bill</span>
        </button>
      </div>

      {/* Quick Summary widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-rose-500/15">
          <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest block font-heading">Pending Payments</span>
          <span className="text-xl font-black text-rose-400 mt-1 block">₹{unpaidTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{filteredBills.filter(b => b.status === 'Unpaid').length} bills pending</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/15">
          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block font-heading">Settled Bills</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">₹{paidTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{filteredBills.filter(b => b.status === 'Paid').length} bills settled</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-850 col-span-2 md:col-span-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-heading font-heading">Filtered Total Balance</span>
          <span className="text-xl font-bold text-slate-200 mt-1 block">₹{(unpaidTotal + paidTotal).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{filteredBills.length} total utility bill records</span>
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
              placeholder="Search by bill name, provider, cycle..."
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
                <span className="bg-emerald-500 text-slate-955 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick Clear Filter Button */}
            {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All' || dateRange !== 'All' || sortBy !== 'date-desc') && (
              <button
                onClick={resetFilters}
                className="text-xs text-emerald-450 hover:text-emerald-400 font-semibold py-2.5 px-3 hover:bg-emerald-500/10 rounded-xl transition-colors border border-emerald-500/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Chips selectors for Category & Status & Dates */}
        <div className="space-y-3 pt-2">
          {/* Date Chips */}
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Filter by Due Date</span>
            <div className="w-full max-w-full flex gap-2 overflow-x-auto scrollbar-none snap-x pb-1">
              {[
                { id: 'All', label: 'All Dates' },
                { id: 'Today', label: 'Due Today' },
                { id: 'Yesterday', label: 'Due Yesterday' },
                { id: 'Week', label: 'Due: Last 7 Days' },
                { id: 'Month', label: 'Due: This Month' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setDateRange(d.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border snap-center cursor-pointer transition-all ${
                    dateRange === d.id
                      ? 'bg-emerald-500 text-slate-955 border-transparent shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Chips */}
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Filter by Status</span>
            <div className="w-full max-w-full flex gap-2 overflow-x-auto scrollbar-none snap-x pb-1">
              {[
                { id: 'All', label: 'All Statuses' },
                { id: 'Paid', label: 'Settled / Paid' },
                { id: 'Unpaid', label: 'Pending / Unpaid' }
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border snap-center cursor-pointer transition-all ${
                    statusFilter === s.id
                      ? 'bg-emerald-500 text-slate-955 border-transparent shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Chips */}
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Filter by Category</span>
            <div className="w-full max-w-full flex gap-2 overflow-x-auto scrollbar-none snap-x pb-1">
              {[
                { id: 'All', label: 'All Categories' },
                { id: 'Rent', label: '🏠 Rent' },
                { id: 'Electricity', label: '⚡ Electricity' },
                { id: 'Water', label: '💧 Water' },
                { id: 'Mobile/WiFi', label: '📱 Mobile/WiFi' },
                { id: 'Gas', label: '🔥 Cooking Gas' },
                { id: 'Subscription', label: '📺 Subscriptions' },
                { id: 'Others', label: '🛍️ Others' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategoryFilter(c.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border snap-center cursor-pointer transition-all ${
                    categoryFilter === c.id
                      ? 'bg-emerald-500 text-slate-955 border-transparent shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible sort row */}
        <div className={`${showFilters ? 'block' : 'hidden md:block'} pt-2`}>
          <div className="space-y-1 text-left">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Sort Records</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="date-desc">Due Date: Furthest First</option>
              <option value="date-asc">Due Date: Earliest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills List Feed */}
      <div className="space-y-3">
        {sortedBills.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-400 font-medium">No utility bill records match your search filter criteria.</p>
            <p className="text-slate-550 text-xs mt-1">Try resetting the filters or record a bill to populate the ledger!</p>
          </div>
        ) : (
          sortedBills.map((bill) => {
            const cat = CATEGORIES_DETAILS[bill.category] || CATEGORIES_DETAILS.Others;
            const isPaid = bill.status === 'Paid';
            return (
              <SwipeableItem
                key={bill.id}
                onEdit={() => onEdit(bill)}
                onDelete={() => onDelete(bill.id)}
              >
                <div
                  className="glass-card p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-850 hover:border-slate-800 transition-all text-left"
                >
                  {/* Left Info Area */}
                  <div className="flex items-start gap-4">
                    <span className="p-3 bg-slate-955 border border-slate-850 rounded-xl text-lg flex items-center justify-center flex-shrink-0">
                      {cat.emoji}
                    </span>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-[200px] sm:max-w-xs" title={bill.title}>
                          {bill.title}
                        </h4>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border flex-shrink-0 ${cat.style}`}>
                          {cat.name}
                        </span>
                      </div>

                      {/* Metadata: Cycle frequency, cycle type, dates */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-450 pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-500 flex-shrink-0" />
                          <span>Due: {new Date(bill.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-500 flex-shrink-0" />
                          <span>Cycle: {bill.frequency || 'Monthly'}</span>
                        </span>
                        {bill.notes && (
                          <span className="text-slate-500 italic truncate max-w-[150px] sm:max-w-xs" title={bill.notes}>
                            "{bill.notes}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action column */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-900 pt-3 md:pt-0 md:border-t-0">
                    <div className="text-left md:text-right flex flex-col items-start md:items-end gap-1 flex-shrink-0">
                      <span className="text-base sm:text-lg font-black text-slate-100">
                        ₹{bill.amount.toFixed(0)}
                      </span>
                      <button
                        onClick={() => onToggleStatus(bill.id)}
                        className={`text-[8px] font-black px-2 py-0.5 rounded border transition-all cursor-pointer ${
                          isPaid 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                        }`}
                        title={isPaid ? "Mark as Pending" : "Mark as Settled"}
                      >
                        {isPaid ? 'Settled' : 'Unpaid'}
                      </button>
                    </div>

                    {/* Desktop actions pane */}
                    <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-900">
                      <button
                        onClick={() => onEdit(bill)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                        title="Edit Bill"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(bill.id)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                        title="Delete Bill"
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
