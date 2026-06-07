import { useState } from 'react';
import { X, Calendar, CreditCard } from 'lucide-react';

const CATEGORIES = [
  { id: 'Rent', name: 'House Rent', emoji: '🏠', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  { id: 'Electricity', name: 'Electricity', emoji: '⚡', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  { id: 'Water', name: 'Water Bill', emoji: '💧', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'Mobile/WiFi', name: 'Mobile & Wi-Fi', emoji: '📱', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  { id: 'Gas', name: 'Cooking Gas', emoji: '🔥', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  { id: 'Subscription', name: 'Subscriptions', emoji: '📺', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'Insurance', name: 'Insurance', emoji: '🛡️', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  { id: 'Education', name: 'Education', emoji: '🎓', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  { id: 'Others', name: 'Others', emoji: '🛍️', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' }
];

const PAYMENT_MODES = ['UPI / Online', 'Cash', 'Credit / Debit Card'];

export default function BillFormModal({ isOpen, onClose, onSubmit, editingBill }) {
  const [formData, setFormData] = useState(() => {
    if (editingBill) {
      return {
        title: editingBill.title || '',
        amount: editingBill.amount || '',
        category: editingBill.category || 'Electricity',
        dueDate: editingBill.dueDate || '',
        paymentMode: editingBill.paymentMode || 'UPI / Online',
        status: editingBill.status || 'Unpaid',
        frequency: editingBill.frequency || 'Monthly',
      };
    }
    return {
      title: '',
      amount: '',
      category: 'Electricity',
      dueDate: new Date().toISOString().split('T')[0],
      paymentMode: 'UPI / Online',
      status: 'Unpaid',
      frequency: 'Monthly',
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const toggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'Paid' ? 'Unpaid' : 'Paid'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formData.amount);

    if (!formData.title.trim()) {
      alert('Please enter a bill title.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    onSubmit({
      ...formData,
      amount: parsedAmount,
      id: editingBill ? editingBill.id : Date.now().toString(),
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
      <div className="relative glass-panel w-full max-w-lg rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto animate-zoom-in border border-emerald-500/10">
        
        {/* Decorative corner indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <span className="text-xl">💵</span>
              <span>{editingBill ? 'Edit Bill Record' : 'Log New Personal Bill'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Track your utility bills, house rent, and recurring subscriptions.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-850 transition-all border border-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Bill Title */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider">
              Bill Title / Provider *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. BESCOM Electricity, June Rent"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-medium placeholder-slate-600"
            />
          </div>

          {/* Bill Amount */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider">
              Bill Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450 pointer-events-none text-sm font-bold">₹</span>
              <input
                type="number"
                name="amount"
                required
                step="1"
                min="0"
                value={formData.amount}
                onChange={handleChange}
                placeholder="e.g. 1250"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold placeholder-slate-650"
              />
            </div>
          </div>

          {/* Category Selector Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-2">
              Select Bill Category *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-2 py-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500 text-slate-950 border-transparent shadow-lg shadow-emerald-500/5 scale-[1.02] font-bold' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-900/90'
                    }`}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span className="text-[10px] truncate w-full text-center">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Due Date & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={12} className="text-slate-500" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                name="dueDate"
                required
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full bg-slate-900/65 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <CreditCard size={12} className="text-slate-500" />
                <span>Payment Mode</span>
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full bg-slate-900/65 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm appearance-none"
              >
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Cycle / Frequency selector */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider">
              Payment Cycle / Frequency *
            </label>
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs font-bold leading-none select-none w-full">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, frequency: 'Weekly' }))}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                  formData.frequency === 'Weekly' 
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📅</span>
                <span>Weekly Payment</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, frequency: 'Monthly' }))}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all cursor-pointer ${
                  formData.frequency === 'Monthly' 
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>📆</span>
                <span>Monthly Payment</span>
              </button>
            </div>
          </div>

          {/* Bill Status Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            <div>
              <span className="block text-xs font-bold text-slate-200">Bill Payment Status</span>
              <span className="text-[10px] text-slate-450 mt-0.5 block">Mark this bill as paid or pending payment.</span>
            </div>
            <button
              type="button"
              onClick={toggleStatus}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                formData.status === 'Paid'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-450 border-rose-500/30'
              }`}
            >
              {formData.status === 'Paid' ? 'Paid ✓' : 'Unpaid / Pending'}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800/80 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/10 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              {editingBill ? 'Save Changes' : 'Record Bill'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
