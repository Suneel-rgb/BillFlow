import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CATEGORIES = ['Utilities', 'Rent', 'Subscriptions', 'Food', 'Leisure', 'Other'];
const METHODS = ['Credit Card', 'Bank Transfer', 'Cash', 'Mobile Payment', 'Other'];

export default function BillForm({ isOpen, onClose, onSubmit, editingBill }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Utilities',
    dueDate: '',
    status: 'Unpaid',
    paymentMethod: 'Credit Card',
    frequency: 'One-time',
    notes: '',
  });

  useEffect(() => {
    if (editingBill) {
      setFormData({
        name: editingBill.name || '',
        amount: editingBill.amount || '',
        category: editingBill.category || 'Utilities',
        dueDate: editingBill.dueDate || '',
        status: editingBill.status || 'Unpaid',
        paymentMethod: editingBill.paymentMethod || 'Credit Card',
        frequency: editingBill.frequency || 'One-time',
        notes: editingBill.notes || '',
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        category: 'Utilities',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Unpaid',
        paymentMethod: 'Credit Card',
        frequency: 'One-time',
        notes: '',
      });
    }
  }, [editingBill, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.amount || isNaN(formData.amount)) {
      alert('Please enter a valid name and amount.');
      return;
    }
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      id: editingBill ? editingBill.id : Date.now(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative glass-panel w-full max-w-lg rounded-2xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto animate-zoom-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-xl font-bold text-white font-heading">
            {editingBill ? 'Edit Bill / Payment' : 'Add New Bill / Payment'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-850 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title / Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Title / Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Electric Bill, Netflix Subscription"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
            />
          </div>

          {/* Amount & Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Date / Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm appearance-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </label>
              <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, status: 'Unpaid' }))}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    formData.status === 'Unpaid'
                      ? 'bg-rose-500/25 text-rose-400 border border-rose-500/40'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  Unpaid / Bill
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, status: 'Paid' }))}
                  className={`flex-1 text-xs py-1.5 rounded-lg font-semibold transition-all ${
                    formData.status === 'Paid'
                      ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  Paid / Spent
                </button>
              </div>
            </div>
          </div>

          {/* Payment Method & Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              >
                {METHODS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
              >
                <option value="One-time">One-time</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Reference number, specific instructions..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
            >
              {editingBill ? 'Save Changes' : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
