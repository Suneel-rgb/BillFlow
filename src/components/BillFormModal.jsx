import { useState } from 'react';
import { X, Calendar, CreditCard, Smartphone, Banknote, Repeat } from 'lucide-react';

const CATEGORIES = [
  { id: 'Rent', name: 'Rent', emoji: '🏠', accent: 'emerald' },
  { id: 'Electricity', name: 'Electric', emoji: '⚡', accent: 'yellow' },
  { id: 'Water', name: 'Water', emoji: '💧', accent: 'blue' },
  { id: 'Mobile/WiFi', name: 'WiFi', emoji: '📱', accent: 'indigo' },
  { id: 'Gas', name: 'Gas', emoji: '🔥', accent: 'orange' },
  { id: 'Subscription', name: 'Subs', emoji: '📺', accent: 'purple' },
  { id: 'Insurance', name: 'Insurance', emoji: '🛡️', accent: 'teal' },
  { id: 'Education', name: 'Education', emoji: '🎓', accent: 'rose' },
  { id: 'Others', name: 'Others', emoji: '🛍️', accent: 'slate' }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 mobile-sheet-backdrop">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative glass-panel w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto mobile-bottom-sheet" style={{ borderColor: 'rgba(16, 185, 129, 0.12)' }}>
        
        {/* Gradient top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Mobile drag handle */}
        <div className="md:hidden w-10 h-1 bg-slate-600/60 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-lg">
                💵
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading leading-tight">
                  {editingBill ? 'Edit Bill' : 'New Bill'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Track utilities, rent & subscriptions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-all border border-slate-800/50 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Bill Title */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                Bill Title / Provider
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. BESCOM Electricity, June Rent"
                className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl px-4 py-3.5 text-white text-sm font-medium placeholder-slate-700"
              />
            </div>

            {/* Hero Amount Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                Bill Amount
              </label>
              <div className="relative flex items-center bg-slate-900/50 border border-slate-800/60 rounded-2xl overflow-hidden focus-within:border-emerald-500/60 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] transition-all">
                <span className="pl-4 pr-1 text-emerald-400/70 font-black text-xl select-none">₹</span>
                <input
                  type="number"
                  name="amount"
                  required
                  step="1"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0"
                  className="flex-1 bg-transparent border-none py-4 pr-4 text-white text-2xl font-black placeholder-slate-700 focus:outline-none"
                  style={{ fontSize: '1.75rem', minHeight: '52px', border: 'none', boxShadow: 'none', background: 'transparent' }}
                />
              </div>
            </div>

            {/* Category Grid */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2.5">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`relative px-2 py-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/15 scale-[1.03] ring-1 ring-white/10' 
                          : 'bg-slate-900/30 border-slate-800/60 text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="text-lg leading-none">{cat.emoji}</span>
                      <span className="text-[9px] leading-none tracking-wide">{cat.name}</span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-300 flex items-center justify-center shadow-md">
                          <span className="text-[8px] text-emerald-950 font-black">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date & Payment Mode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2 flex items-center gap-1">
                  <Calendar size={10} className="text-slate-600" />
                  <span>Due Date</span>
                </label>
                <input
                  type="date"
                  name="dueDate"
                  required
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl px-3 py-3 text-white text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2 flex items-center gap-1">
                  <CreditCard size={10} className="text-slate-600" />
                  <span>Pay Mode</span>
                </label>
                <select
                  name="paymentMode"
                  value={formData.paymentMode}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl px-3 py-3 text-white text-sm appearance-none"
                >
                  {PAYMENT_MODES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Frequency Segmented Control */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2 flex items-center gap-1">
                <Repeat size={10} className="text-slate-600" />
                <span>Payment Cycle</span>
              </label>
              <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/50 text-xs font-bold select-none">
                {['Weekly', 'Monthly'].map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, frequency: freq }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      formData.frequency === freq
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15 font-extrabold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span>{freq === 'Weekly' ? '📅' : '📆'}</span>
                    <span className="text-[11px]">{freq}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800/50 rounded-2xl">
              <div>
                <span className="block text-xs font-bold text-slate-300">Payment Status</span>
                <span className="text-[10px] text-slate-600 mt-0.5 block">Mark as paid or pending</span>
              </div>
              <button
                type="button"
                onClick={toggleStatus}
                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold border transition-all duration-200 cursor-pointer ${
                  formData.status === 'Paid'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/25 shadow-sm shadow-rose-500/10'
                }`}
              >
                {formData.status === 'Paid' ? '✓ Paid' : '⏳ Unpaid'}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-800/60 text-slate-400 hover:text-white text-sm font-semibold transition-colors cursor-pointer hover:bg-slate-900/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/15 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
              >
                {editingBill ? '💾 Save Changes' : '💵 Record Bill'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
