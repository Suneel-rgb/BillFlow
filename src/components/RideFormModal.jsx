import { useState } from 'react';
import { X, MapPin, Banknote, Smartphone, ChevronDown } from 'lucide-react';

const PLATFORMS = [
  { id: 'Uber', name: 'Uber', emoji: '⚫', selectedBg: 'bg-slate-900', selectedBorder: 'border-slate-600', selectedText: 'text-white' },
  { id: 'Ola', name: 'Ola', emoji: '🟢', selectedBg: 'bg-lime-500', selectedBorder: 'border-lime-400', selectedText: 'text-slate-950' },
  { id: 'Rapido', name: 'Rapido', emoji: '🟡', selectedBg: 'bg-yellow-400', selectedBorder: 'border-yellow-300', selectedText: 'text-slate-950' },
  { id: 'Namma Yatri', name: 'Namma', emoji: '🟠', selectedBg: 'bg-orange-500', selectedBorder: 'border-orange-400', selectedText: 'text-white' },
  { id: 'Local', name: 'Local', emoji: '🛺', selectedBg: 'bg-slate-700', selectedBorder: 'border-slate-500', selectedText: 'text-white' },
  { id: 'Other', name: 'Other', emoji: '📱', selectedBg: 'bg-indigo-600', selectedBorder: 'border-indigo-400', selectedText: 'text-white' }
];

const PAYMENT_MODES = ['UPI / Online', 'Cash'];

export default function RideFormModal({ isOpen, onClose, onSubmit, editingRide }) {
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
      let defaultPayment = prev.paymentMode;
      if (platformId === 'Local') {
        defaultPayment = 'Cash';
      } else if (['Uber', 'Ola', 'Rapido', 'Namma Yatri'].includes(platformId)) {
        defaultPayment = 'UPI / Online';
      }
      return { ...prev, platform: platformId, paymentMode: defaultPayment };
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

  const selectedPlatform = PLATFORMS.find(p => p.id === formData.platform);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 mobile-sheet-backdrop">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative glass-panel w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] overflow-y-auto mobile-bottom-sheet" style={{ borderColor: 'rgba(245, 158, 11, 0.12)' }}>
        
        {/* Gradient top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />

        {/* Mobile drag handle */}
        <div className="md:hidden w-10 h-1 bg-slate-600/60 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-lg">
                🛺
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading leading-tight">
                  {editingRide ? 'Edit Ride' : 'New Ride'}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Log your passenger fare details</p>
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
            
            {/* Platform Selector — Horizontal scrolling tiles */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2.5">
                Booking Platform
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORMS.map((plat) => {
                  const isSelected = formData.platform === plat.id;
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => handlePlatformChange(plat.id)}
                      className={`relative px-2 py-3.5 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? `${plat.selectedBg} ${plat.selectedBorder} ${plat.selectedText} shadow-lg scale-[1.03] ring-1 ring-white/10` 
                          : 'bg-slate-900/30 border-slate-800/60 text-slate-500 hover:text-slate-300 hover:bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xl leading-none">{plat.emoji}</span>
                      <span className="text-[10px] leading-none tracking-wide">{plat.name}</span>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                          <span className="text-[8px] text-slate-950 font-black">✓</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hero Fare Input */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                Fare Received
              </label>
              <div className="relative flex items-center bg-slate-900/50 border border-slate-800/60 rounded-2xl overflow-hidden focus-within:border-amber-500/60 focus-within:shadow-[0_0_0_3px_rgba(245,158,11,0.1)] transition-all">
                <span className="pl-4 pr-1 text-amber-400/70 font-black text-xl select-none">₹</span>
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
                {formData.amount && (
                  <span className="pr-4 text-[10px] text-slate-600 font-semibold whitespace-nowrap">INR</span>
                )}
              </div>
            </div>

            {/* Payment Mode — Segmented Control */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                Payment Mode
              </label>
              <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/50 text-xs font-bold select-none">
                {PAYMENT_MODES.map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, paymentMode: mode }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      formData.paymentMode === mode
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/15 font-extrabold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {mode === 'UPI / Online' ? <Smartphone size={13} /> : <Banknote size={13} />}
                    <span className="text-[11px]">{mode === 'UPI / Online' ? 'UPI / Online' : 'Cash'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Distance Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                  Ride Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl px-3 py-3 text-white text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2 flex items-center gap-1">
                  <MapPin size={10} className="text-slate-600" />
                  <span>KM Distance</span>
                </label>
                <input
                  type="number"
                  name="distance"
                  step="0.1"
                  min="0"
                  value={formData.distance}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl px-3 py-3 text-white text-sm placeholder-slate-700"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.12em] mb-2">
                Route / Notes
              </label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Majestic → Indiranagar"
                className="w-full bg-slate-900/50 border border-slate-800/60 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-700"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-800/60 text-slate-400 hover:text-white text-sm font-semibold transition-colors cursor-pointer hover:bg-slate-900/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-[2] px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/15 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] cursor-pointer"
              >
                {editingRide ? '💾 Save Changes' : '🛺 Log Ride'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
