import { useState } from 'react';
import { X, Fuel, Wrench, Coffee, AlertOctagon, Landmark, ShoppingBag, Banknote } from 'lucide-react';

const CATEGORIES = [
  { id: 'CNG/Fuel', name: 'CNG / Fuel', icon: Fuel, emoji: '⛽', selectedBg: 'bg-emerald-500', selectedText: 'text-slate-950' },
  { id: 'Maintenance', name: 'Repairs', icon: Wrench, emoji: '🔧', selectedBg: 'bg-indigo-500', selectedText: 'text-white' },
  { id: 'Rent/EMI', name: 'Rent / EMI', icon: Landmark, emoji: '🏦', selectedBg: 'bg-blue-500', selectedText: 'text-white' },
  { id: 'Food/Tea', name: 'Food / Tea', icon: Coffee, emoji: '☕', selectedBg: 'bg-amber-500', selectedText: 'text-slate-950' },
  { id: 'Fines', name: 'Challan', icon: AlertOctagon, emoji: '🚨', selectedBg: 'bg-rose-500', selectedText: 'text-white' },
  { id: 'Others', name: 'Other', icon: ShoppingBag, emoji: '📦', selectedBg: 'bg-slate-600', selectedText: 'text-white' },
];

export default function ExpenseFormModal({ isOpen, onClose, onSubmit, editingExpense }) {
  const [formData, setFormData] = useState(() => {
    if (editingExpense) {
      return {
        amount: editingExpense.amount || '',
        category: editingExpense.category || 'CNG/Fuel',
        date: editingExpense.date || '',
        notes: editingExpense.notes || '',
      };
    }
    return {
      amount: '',
      category: 'CNG/Fuel',
      date: new Date().toISOString().split('T')[0],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 mobile-sheet-backdrop">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative glass-panel w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto mobile-bottom-sheet" style={{ borderColor: 'rgba(244, 63, 94, 0.12)' }}>
        
        {/* Gradient top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-red-400 to-orange-500" />

        {/* Mobile drag handle */}
        <div className="md:hidden w-10 h-1 bg-slate-600/60 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-lg">
                💸
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading leading-tight">
                  {editingExpense ? 'Edit Expense' : 'Log Expense'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Record CNG, repairs, food & more</p>
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
            
            {/* Category Tiles */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2.5">
                Expense Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => {
                  const isSelected = formData.category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`relative px-2 py-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? `${cat.selectedBg} ${cat.selectedText} border-transparent shadow-lg scale-[1.03] ring-1 ring-white/10` 
                          : 'bg-slate-900/30 border-slate-800/60 text-slate-500 hover:text-slate-300 hover:bg-slate-900/60'
                      }`}
                    >
                      <span className="text-xl leading-none">{cat.emoji}</span>
                      <span className="text-[9px] leading-none tracking-wide">{cat.name}</span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-md">
                          <span className="text-[8px] text-rose-600 font-black">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hero Amount Input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                Expense Amount
              </label>
              <div className="relative flex items-center bg-slate-900/50 border border-slate-800/60 rounded-2xl overflow-hidden focus-within:border-rose-500/60 focus-within:shadow-[0_0_0_3px_rgba(244,63,94,0.1)] transition-all">
                <span className="pl-4 pr-1 text-rose-400/70 font-black text-xl select-none">₹</span>
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

            {/* Date */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                Date Spent
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl px-4 py-3 text-white text-sm font-medium"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                Details (Optional)
              </label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. 4.1kg CNG at Shell, brake shoe change"
                className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-700"
              />
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
                className="flex-[2] px-6 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-400 hover:to-red-400 text-white font-extrabold text-sm shadow-lg shadow-rose-500/15 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
              >
                {editingExpense ? '💾 Save Changes' : '💸 Log Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
