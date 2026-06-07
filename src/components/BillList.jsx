import React, { useState } from 'react';
import { Search, Edit2, Trash2, Calendar, IndianRupee, Filter, ArrowUpDown } from 'lucide-react';

const CATEGORIES = ['Utilities', 'Rent', 'Subscriptions', 'Food', 'Leisure', 'Other', 'Savings'];

const CATEGORY_STYLES = {
  Utilities: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
  Rent: 'bg-purple-500/10 text-purple-400 border border-purple-500/25',
  Subscriptions: 'bg-amber-500/10 text-amber-400 border border-amber-500/25',
  Food: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  Leisure: 'bg-rose-500/10 text-rose-400 border border-rose-500/25',
  Savings: 'bg-teal-500/10 text-teal-400 border border-teal-500/25',
  Other: 'bg-slate-500/10 text-slate-400 border border-slate-550/25',
};

export default function BillList({ bills, onToggleStatus, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-asc');

  // Filtering logic
  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (bill.notes && bill.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || bill.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || bill.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sorting logic
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
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Filtering and Search Bar */}
      <div className="glass-card p-5 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search bills, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm transition-all"
            />
          </div>

          {/* Quick Clear filters */}
          {(searchTerm || statusFilter !== 'All' || categoryFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setCategoryFilter('All');
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold py-2 px-3 hover:bg-indigo-500/10 rounded-lg transition-colors border border-indigo-500/20"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Filters and sorting Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid / Spent</option>
              <option value="Unpaid">Unpaid / Bill</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="space-y-1 sm:col-span-1 md:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="date-asc">Due Date: Earliest First</option>
              <option value="date-desc">Due Date: Latest First</option>
              <option value="amount-asc">Amount: Low to High</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bill List Results */}
      <div className="space-y-3">
        {sortedBills.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-400 font-medium">No transactions match your search filter criteria.</p>
            <p className="text-slate-500 text-xs mt-1">Try resetting the filters or add a new record to get started!</p>
          </div>
        ) : (
          sortedBills.map((bill) => (
            <div
              key={bill.id}
              className={`glass-card p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border transition-all hover:border-slate-700/60 ${
                bill.status === 'Paid' ? 'border-emerald-500/10 bg-emerald-500/[0.01]' : 'border-slate-800'
              }`}
            >
              {/* Info Column */}
              <div className="flex items-start gap-4">
                {/* Status Indicator Dot/Toggle */}
                <button
                  onClick={() => onToggleStatus(bill.id)}
                  title={`Click to mark as ${bill.status === 'Paid' ? 'Unpaid' : 'Paid'}`}
                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    bill.status === 'Paid'
                      ? 'border-emerald-500 bg-emerald-500 text-slate-950 scale-105 shadow-md shadow-emerald-500/20'
                      : 'border-slate-600 hover:border-indigo-500 bg-transparent'
                  }`}
                >
                  {bill.status === 'Paid' && (
                    <svg className="w-3.5 h-3.5 stroke-[3] text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className={`text-base font-bold text-white leading-tight ${bill.status === 'Paid' && 'line-through text-slate-400'}`}>
                      {bill.name}
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${CATEGORY_STYLES[bill.category] || CATEGORY_STYLES.Other}`}>
                      {bill.category}
                    </span>
                  </div>

                  {/* Dates & Payment Details */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-500" />
                      <span>Due: {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee size={13} className="text-slate-500" />
                      <span>Via: {bill.paymentMethod || 'Credit Card'} ({bill.frequency || 'One-time'})</span>
                    </span>
                  </div>

                  {bill.notes && (
                    <p className="text-xs text-slate-500 bg-slate-900/30 p-2 rounded-lg border border-slate-900 inline-block max-w-full">
                      {bill.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Column */}
              <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-900 pt-3 md:pt-0 md:border-t-0">
                {/* Amount */}
                <div className="text-left md:text-right">
                  <span className={`text-lg font-extrabold ${bill.status === 'Paid' ? 'text-slate-400' : 'text-slate-200'}`}>
                    ₹{parseFloat(bill.amount).toFixed(2)}
                  </span>
                  <span className={`block text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                    bill.status === 'Paid' ? 'text-emerald-400' : 'text-rose-400/90'
                  }`}>
                    {bill.status === 'Paid' ? 'Paid / Spent' : 'Unpaid Bill'}
                  </span>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(bill)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700/50 transition-all"
                    title="Edit Record"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(bill.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                    title="Delete Record"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
