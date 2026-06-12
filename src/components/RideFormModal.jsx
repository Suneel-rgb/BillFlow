import { useState } from 'react';
import { X, MapPin } from 'lucide-react';

const PLATFORMS = [
  { id: 'Uber', name: 'Uber Auto', color: 'bg-black text-white border-slate-800 hover:bg-slate-900' },
  { id: 'Ola', name: 'Ola Auto', color: 'bg-lime-500 text-slate-950 border-lime-600 hover:bg-lime-400 font-bold' },
  { id: 'Rapido', name: 'Rapido', color: 'bg-yellow-400 text-slate-950 border-yellow-500 hover:bg-yellow-350 font-bold' },
  { id: 'Namma Yatri', name: 'Namma Yatri', color: 'bg-orange-500 text-white border-orange-600 hover:bg-orange-400 font-semibold' },
  { id: 'Local', name: 'Local Ride', color: 'bg-slate-700 text-white border-slate-600 hover:bg-slate-650' },
  { id: 'Other', name: 'Other App', color: 'bg-indigo-650 text-white border-indigo-600 hover:bg-indigo-550' }
];

const PAYMENT_MODES = ['UPI / Online', 'Cash'];

export default function RideFormModal({ isOpen, onClose, onSubmit, editingRide }) {
  // Initialize state once during mount
  const [formData, setFormData] = useState(() => {
    if (editingRide) {
      return {
        platform: editingRide.platform || 'Local',
        amount: editingRide.amount || '',
        paymentMode: editingRide.paymentMode || 'Cash',
        date: editingRide.date || '',
        distance: editingRide.distance || '',
        notes: editingRide.notes || '',
      };
    }
    return {
      platform: 'Local',
      amount: '',
      paymentMode: 'Cash',
      date: new Date().toISOString().split('T')[0],
      distance: '',
      notes: '',
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlatformChange = (platformId) => {
    setFormData(prev => {
      // Smart payment mode defaults based on platform selection
      let defaultPayment = prev.paymentMode;
      if (platformId === 'Local') {
        defaultPayment = 'Cash';
      } else if (platformId === 'Uber' || platformId === 'Ola' || platformId === 'Rapido') {
        defaultPayment = 'UPI / Online';
      } else if (platformId === 'Namma Yatri') {
        defaultPayment = 'UPI / Online'; // Customer pays driver directly
      }

      return {
        ...prev,
        platform: platformId,
        paymentMode: defaultPayment
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formData.amount);
    const parsedDistance = parseFloat(formData.distance) || null;

    if (!formData.platform) {
      alert('Please select a platform.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid fare amount.');
      return;
    }

    onSubmit({
      ...formData,
      amount: parsedAmount,
      commission: 0,
      netAmount: parsedAmount,
      distance: parsedDistance,
      id: editingRide ? editingRide.id : Date.now().toString(),
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
      <div className="relative glass-panel w-full max-w-lg rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto animate-zoom-in border border-amber-500/10">
        
        {/* Decorative corner indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <div>
            <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
              <span className="text-xl">🛺</span>
              <span>{editingRide ? 'Edit Ride Details' : 'Record New Ride'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Keep track of your ride fares, payment modes, and distances.</p>
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
          {/* Platform Selector Buttons */}
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-2.5">
              Select Booking Platform *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PLATFORMS.map((plat) => {
                const isSelected = formData.platform === plat.id;
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => handlePlatformChange(plat.id)}
                    className={`px-3 py-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected 
                        ? `${plat.color} border-transparent shadow-lg shadow-amber-500/5 scale-[1.02]` 
                        : 'bg-slate-900/40 border-slate-800 text-slate-350 hover:text-white hover:bg-slate-900/90'
                    }`}
                  >
                    <span className="text-base">
                      {plat.id === 'Uber' && '⚫'}
                      {plat.id === 'Ola' && '🟢'}
                      {plat.id === 'Rapido' && '🟡'}
                      {plat.id === 'Namma Yatri' && '🟠'}
                      {plat.id === 'Local' && '🛺'}
                      {plat.id === 'Other' && '📱'}
                    </span>
                    <span>{plat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fare Amount */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider">
              Ride Fare Received (₹) *
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
                placeholder="e.g. 150"
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-7 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm font-bold placeholder-slate-650"
              />
            </div>
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Payment Mode
              </label>
              <select
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full bg-slate-900/65 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm appearance-none"
              >
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Ride Date
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-900/65 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Distance and Route/Notes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <MapPin size={11} className="text-slate-500" />
                <span>Distance (km)</span>
              </label>
              <input
                type="number"
                name="distance"
                step="0.1"
                min="0"
                value={formData.distance}
                onChange={handleChange}
                placeholder="Optional (e.g. 8.5)"
                className="w-full bg-slate-900/65 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm placeholder-slate-650"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Route / Location / Passenger Notes
              </label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Majestic to Indiranagar, double passenger"
                className="w-full bg-slate-900/65 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 text-sm placeholder-slate-650"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-800/80 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/10 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              {editingRide ? 'Save Ride Details' : 'Save Ride Fares'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
