import { useState } from 'react';
import { Search, Edit2, Trash2, Calendar, CreditCard, RefreshCw, Plus } from 'lucide-react';

const CATEGORIES_DETAILS = {
  Rent: { name: 'House Rent', emoji: '🏠', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  Electricity: { name: 'Electricity', emoji: '⚡', style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  Water: { name: 'Water Bill', emoji: '💧', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  'Mobile/WiFi': { name: 'Mobile & Wi-Fi', emoji: '📱', style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  Gas: { name: 'Cooking Gas', emoji: '🔥', style: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  Subscription: { name: 'Subscriptions', emoji: '📺', style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  Insurance: { name: 'Insurance', emoji: '🛡️', style: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  Education: { name: 'Education', emoji: '🎓', style: 'bg-rose-500/10 text-rose-450 border-rose-500/20' },
  Others: { name: 'Others', emoji: '🛍️', style: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
};

export default function BillsTab({ bills, onAddBillClick, onEdit, onDelete, onToggleStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All');
  const [sortBy, setSortBy] = useState('date-asc'); // default: oldest/nearest first for due bills

  // Filtering Logic
  const filteredBills = bills.filter(bill => {
    const matchesSearch = 
      (bill.title && bill.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bill.category && bill.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'All' || bill.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;

    let matchesDate = true;
    if (dateRange !== 'All' && bill.dueDate) {
      const billDate = new Date(bill.dueDate);
      billDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateRange === 'Today') {
        matchesDate = billDate.getTime() === today.getTime();
      } else if (dateRange === 'ThisMonth') {
        const currentMonthStr = today.toISOString().substring(0, 7);
        matchesDate = bill.dueDate.startsWith(currentMonthStr);
      } else if (dateRange === 'Overdue') {
        matchesDate = billDate < today && bill.status === 'Unpaid';
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

  // KPI Calculations
  const totalAmount = filteredBills.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const paidAmount = filteredBills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const unpaidAmount = filteredBills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setDateRange('All');
    setSortBy('date-asc');
  };

  return (
    <div className="space-y-6 animate-fade-in text-emerald-100">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Bills Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Track, edit, or toggle payments on monthly utilities and rents.
          </p>
        </div>
        <button
          onClick={onAddBillClick}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/10 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={18} />
          <span>Add New Bill</span>
        </button>
      </div>

      {/* KPI Overview Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/10">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-heading">Total Bills Fares</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">₹{totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{filteredBills.length} total bills loaded</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block font-heading">Paid Bills Total</span>
          <span className="text-xl font-bold text-teal-400 mt-1 block">₹{paidAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{filteredBills.filter(b => b.status === 'Paid').length} bills cleared</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block font-heading">Pending / Unpaid Bills</span>
          <span className="text-xl font-bold text-rose-400 mt-1 block">₹{unpaidAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{filteredBills.filter(b => b.status === 'Unpaid').length} bills due</span>
        </div>
      </div>

      {/* Filters & Search Panel */}
      <div className="glass-card p-5 rounded-2xl space-y-4 border border-slate-850">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by bill title, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm transition-all"
            />
          </div>

          {/* Quick Clear Filter Button */}
          {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All' || dateRange !== 'All') && (
            <button
              onClick={resetFilters}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold py-2 px-3 hover:bg-emerald-500/10 rounded-xl transition-colors border border-emerald-500/20 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Multi-Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Category filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-350 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              {Object.keys(CATEGORIES_DETAILS).map(k => (
                <option key={k} value={k}>{CATEGORIES_DETAILS[k].name}</option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-355 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid Only</option>
              <option value="Unpaid">Unpaid Only</option>
            </select>
          </div>

          {/* Date range filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Period / Overdue</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-355 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Dates</option>
              <option value="Today">Due Today</option>
              <option value="ThisMonth">Due This Month</option>
              <option value="Overdue">Overdue Bills</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Sort Bills</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-355 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="date-asc">Due Date: Nearest First</option>
              <option value="date-desc">Due Date: Furthest First</option>
              <option value="amount-desc">Cost: High to Low</option>
              <option value="amount-asc">Cost: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bills Results List */}
      <div className="space-y-3">
        {sortedBills.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-400 font-medium">No bills match your current filters.</p>
            <p className="text-slate-550 text-xs mt-1">Add a household rent record, mobile bill, or other utility bills above!</p>
          </div>
        ) : (
          sortedBills.map((bill) => {
            const detail = CATEGORIES_DETAILS[bill.category] || CATEGORIES_DETAILS.Others;
            return (
              <div
                key={bill.id}
                className="glass-card p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                {/* Info block */}
                <div className="flex items-start gap-4">
                  {/* Category icon */}
                  <span className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-lg flex items-center justify-center">
                    {detail.emoji}
                  </span>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-100">
                        {bill.title}
                      </h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${detail.style}`}>
                        {detail.name}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-450">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-500" />
                        <span>Due: {new Date(bill.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard size={12} className="text-slate-500" />
                        <span>Via: {bill.paymentMode}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount, status and action columns */}
                <div className="flex items-center justify-between md:justify-end gap-5 border-t border-slate-900 pt-3 md:pt-0 md:border-t-0">
                  {/* Amount and Status Pill */}
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-slate-100">
                      ₹{bill.amount.toFixed(0)}
                    </span>
                    <button
                      onClick={() => onToggleStatus(bill.id)}
                      className={`text-[9px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider border cursor-pointer ${
                        bill.status === 'Paid'
                          ? 'bg-emerald-500/20 text-emerald-450 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-455 border-rose-500/30'
                      }`}
                      title="Toggle payment status"
                    >
                      {bill.status}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pl-4 border-l border-slate-900">
                    <button
                      onClick={() => onEdit(bill)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700/50 transition-all cursor-pointer"
                      title="Edit Bill"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(bill.id)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                      title="Delete Bill"
                    >
                      <Trash2 size={14} />
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
