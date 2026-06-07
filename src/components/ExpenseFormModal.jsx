import { useState } from 'react';
import { X, Fuel, Wrench, Coffee, AlertOctagon, Landmark, ShoppingBag } from 'lucide-react';

const CATEGORIES = [
  { id: 'CNG/Fuel', name: 'CNG / Gas / Fuel', icon: Fuel, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-550/20' },
  { id: 'Maintenance', name: 'Vehicle Repairs / Service', icon: Wrench, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-550/20' },
  { id: 'Rent/EMI', name: 'Daily Rent / Loan EMI', icon: Landmark, color: 'bg-blue-500/10 text-blue-400 border-blue-550/20' },
  { id: 'Food/Tea', name: 'Snacks / Food / Tea', icon: Coffee, color: 'bg-amber-500/10 text-amber-400 border-amber-550/20' },
  { id: 'Fines', name: 'Police Fine / Challan', icon: AlertOctagon, color: 'bg-rose-500/10 text-rose-400 border-rose-550/20' },
  { id: 'Others', name: 'Other Expenses', icon: ShoppingBag, color: 'bg-slate-500/10 text-slate-400 border-slate-550/20' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative glass-panel w-full max-w-lg rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto animate-zoom-in border border-rose-500/10">
        
        {/* Decorative top border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <span className="text-rose-450">💸</span>
              <span>{editingExpense ? 'Edit Rickshaw Expense' : 'Log Auto Expense'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Record costs like gas/fuel, repairs, rent, and food to track net daily profits.</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-850 transition-all border border-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category Select Grid */}
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-2.5">
              Select Expense Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat.id;
                const IconComp = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-3 py-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected 
                        ? `${cat.color} bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-md shadow-rose-500/5` 
                        : 'bg-slate-900/40 border-slate-800 text-slate-355 hover:text-white hover:bg-slate-900/90'
                    }`}
                  >
                    <IconComp size={16} className={isSelected ? 'text-rose-400' : 'text-slate-400'} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Expense Amount */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider">
                Expense Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none text-sm font-bold">₹</span>
                <input
                  type="number"
                  name="amount"
                  required
                  step="1"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="e.g. 350"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-sm font-bold placeholder-slate-650"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider">
                Date Spent *
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-455 uppercase tracking-wider">
              Expense details (Optional)
            </label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. 4.1kg CNG at shell bunk, brake shoe change, tea/samosa"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-rose-500 text-sm placeholder-slate-650"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800/80 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-805 hover:border-slate-700 text-slate-355 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-500/10 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              {editingExpense ? 'Save Expense Changes' : 'Log Expense Fares'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
