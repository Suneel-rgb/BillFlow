import { useState } from 'react';
import { X, Calendar } from 'lucide-react';

const CATEGORIES = [
  { id: 'Groceries', name: 'Groceries / Milk', emoji: '🍎' },
  { id: 'Rent/EMI', name: 'Personal Rent / Loan', emoji: '💳' },
  { id: 'Medical', name: 'Medical & Health', emoji: '💊' },
  { id: 'Education', name: 'School & Education', emoji: '📚' },
  { id: 'Shopping', name: 'Clothing & Shopping', emoji: '🛍️' },
  { id: 'Entertainment', name: 'Food / Movies / Tea', emoji: '🎬' },
  { id: 'Travel', name: 'Personal Travel / Fuel', emoji: '🚗' },
  { id: 'Others', name: 'Other Expenses', emoji: '💸' }
];

const PAYMENT_MODES = ['UPI / Online', 'Cash', 'Credit / Debit Card'];

export default function PersonalExpenseFormModal({ isOpen, onClose, onSubmit, editingExpense }) {
  const [formData, setFormData] = useState(() => {
    if (editingExpense) {
      return {
        amount: editingExpense.amount || '',
        category: editingExpense.category || 'Groceries',
        date: editingExpense.date || '',
        paymentMode: editingExpense.paymentMode || 'UPI / Online',
        notes: editingExpense.notes || '',
      };
    }
    return {
      amount: '',
      category: 'Groceries',
      date: new Date().toISOString().split('T')[0],
      paymentMode: 'UPI / Online',
      notes: '',
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formData.amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    onSubmit({
      ...formData,
      amount: parsedAmount,
      id: editingExpense ? editingExpense.id : Date.now().toString(),
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
              <span className="text-emerald-450">🛍️</span>
              <span>{editingExpense ? 'Edit Personal Expense' : 'Log Personal Expense'}</span>
            </h3>
            <p className="text-xs text-slate-405 mt-0.5">Record grocery purchases, shopping runs, dining, or other daily personal spends.</p>
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
          
          {/* Amount */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider">
              Expense Cost (₹) *
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
                placeholder="e.g. 350"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm font-bold placeholder-slate-650"
              />
            </div>
          </div>

          {/* Category selector grid */}
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-2">
              Select Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-2 py-3 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500 text-slate-950 border-transparent shadow-lg shadow-emerald-500/5 scale-[1.02] font-bold' 
                        : 'bg-slate-900/40 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-900/90'
                    }`}
                  >
                    <span className="text-base">{cat.emoji}</span>
                    <span className="text-[9px] truncate w-full text-center leading-none mt-0.5">{cat.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar size={12} className="text-slate-500" />
                <span>Date</span>
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-900/65 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Payment Mode
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

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Expense Details / Description
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Weekly vegetables buy, dinner with family"
              className="w-full bg-slate-900/65 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm placeholder-slate-650"
            />
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
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
