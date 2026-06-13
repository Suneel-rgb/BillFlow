import { useState } from 'react';
import { Fuel, Plus, ChevronRight, Award, Smartphone, TrendingUp, Gauge, Coins, Compass, Info } from 'lucide-react';

const QUICK_PLATFORMS = [
  { id: 'Local', label: 'Local Street', icon: '🛺', color: 'border-slate-700 bg-slate-900/60 text-slate-100 hover:bg-slate-800' },
  { id: 'Uber', label: 'Uber Auto', icon: '⚫', color: 'border-black bg-black/60 text-white hover:bg-black' },
  { id: 'Ola', label: 'Ola Auto', icon: '🟢', color: 'border-emerald-600 bg-emerald-950/20 text-emerald-450 hover:bg-emerald-950/50' },
  { id: 'Rapido', label: 'Rapido Auto', icon: '🟡', color: 'border-amber-500 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' },
  { id: 'Namma Yatri', label: 'Namma Yatri', icon: '🟠', color: 'border-orange-500 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' }
];

export default function Dashboard({ 
  rides, 
  expenses, 
  dailyTarget, 
  setDailyTarget, 
  onQuickRideSubmit,
  onOpenAddRideModal,
  onOpenAddExpenseModal,
  setActiveTab,
  dailyMilestones = [],
  onSaveDailyMilestone
}) {
  const [quickAmount, setQuickAmount] = useState('');
  const [quickPlatform, setQuickPlatform] = useState('Local');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's milestone odometer record
  const todayMilestone = dailyMilestones.find(m => m.date === todayStr) || { startOdo: '', endOdo: '' };
  
  // Local state for odometer inputs
  const [startOdo, setStartOdo] = useState(todayMilestone.startOdo ? todayMilestone.startOdo.toString() : '');
  const [endOdo, setEndOdo] = useState(todayMilestone.endOdo ? todayMilestone.endOdo.toString() : '');

  // Keep state in sync when database changes
  const [lastSyncedDate, setLastSyncedDate] = useState('');
  if (lastSyncedDate !== todayStr + '-' + todayMilestone.startOdo + '-' + todayMilestone.endOdo) {
    setStartOdo(todayMilestone.startOdo ? todayMilestone.startOdo.toString() : '');
    setEndOdo(todayMilestone.endOdo ? todayMilestone.endOdo.toString() : '');
    setLastSyncedDate(todayStr + '-' + todayMilestone.startOdo + '-' + todayMilestone.endOdo);
  }

  const handleOdoSave = (e) => {
    e.preventDefault();
    if (startOdo !== '' && endOdo !== '') {
      const start = parseFloat(startOdo);
      const end = parseFloat(endOdo);
      if (end < start) {
        alert("Ending odometer reading cannot be less than starting reading!");
        return;
      }
    }
    onSaveDailyMilestone(todayStr, startOdo, endOdo);
  };

  // Filter today's items
  const todayRides = rides.filter(r => r.date === todayStr);
  const todayExpenses = expenses.filter(e => e.date === todayStr);

  // Summaries
  const todayGross = todayRides.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const todayNetEarnings = todayGross;
  
  const todayFuel = todayExpenses
    .filter(e => e.category === 'CNG/Fuel')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const todayAllExpenses = todayExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const netProfitToday = todayNetEarnings - todayAllExpenses;

  const startNum = parseFloat(startOdo);
  const endNum = parseFloat(endOdo);
  const dailyDistance = (isNaN(startNum) || isNaN(endNum)) ? 0 : Math.max(endNum - startNum, 0);

  const earningsPerKm = dailyDistance > 0 ? (todayGross / dailyDistance) : 0;
  const fuelCostPerKm = dailyDistance > 0 ? (todayFuel / dailyDistance) : 0;
  const profitPerKm = dailyDistance > 0 ? (netProfitToday / dailyDistance) : 0;

  // Daily target progress calculations
  const targetProgress = dailyTarget > 0 ? Math.min(Math.round((todayNetEarnings / dailyTarget) * 100), 100) : 0;
  const isTargetAchieved = todayNetEarnings >= dailyTarget && dailyTarget > 0;

  // SVG Circular Progress Wheel calculations
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (targetProgress / 100) * circumference;

  const handleQuickLog = (e) => {
    e.preventDefault();
    const amount = parseFloat(quickAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid fare amount.');
      return;
    }

    onQuickRideSubmit(quickPlatform, amount);
    setQuickAmount('');
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Captain Dashboard
          </h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            Track daily ride logs, odometer runs, and manage CNG costs.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          <button
            onClick={onOpenAddRideModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-955 font-black shadow-lg shadow-amber-500/10 transition-all cursor-pointer text-xs"
          >
            <Plus size={16} />
            <span>Detailed Ride</span>
          </button>
          <button
            onClick={onOpenAddExpenseModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-355 hover:bg-slate-855 hover:border-slate-700 transition-all text-xs cursor-pointer"
          >
            <Fuel size={16} />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Driving Mode Promo Callout */}
      <div className="glass-card p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-lg animate-pulse">
            🎙️
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold text-amber-405 uppercase tracking-wider">Safety First: Voice Driving Mode</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Use voice commands and horizontal swipe gestures to log fares while driving.</p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('driving')}
          className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-450 text-slate-955 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>Start Driving Mode</span>
          <span>→</span>
        </button>
      </div>

      {/* Main KPI Summary Card */}
      <div className="glass-card p-6 rounded-3xl border border-amber-500/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Coins size={120} className="text-amber-400" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-heading">Today's Net Take-Home</span>
            <span className={`text-3xl sm:text-4xl font-black mt-1 block tracking-tight ${netProfitToday >= 0 ? 'text-emerald-400' : 'text-rose-455'}`}>
              ₹{netProfitToday.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 mt-1 block">Gross earnings minus operating CNG and overheads</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-8 border-t border-slate-900 sm:border-t-0 sm:pl-8 sm:border-l sm:border-slate-800/80 pt-4 sm:pt-0">
            <div>
              <span className="text-[9px] font-bold text-slate-455 uppercase tracking-wider block">Gross Revenue</span>
              <span className="text-lg font-black text-slate-100 mt-0.5 block">₹{todayGross.toLocaleString()}</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">{todayRides.length} drops logged</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-455 uppercase tracking-wider block">Overhead Cost</span>
              <span className="text-lg font-black text-rose-400 mt-0.5 block">₹{todayAllExpenses.toLocaleString()}</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">CNG: ₹{todayFuel.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Odometer & Mileage Efficiency */}
      <div className="glass-card p-6 rounded-3xl border border-slate-850 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
              <Gauge size={18} className="text-amber-500" />
              <span>Odometer Mileage Calculator</span>
            </h3>
            <p className="text-xs text-slate-400">
              Input start and end readings to calculate today's distance and exact rate per kilometer.
            </p>
          </div>
          
          <form onSubmit={handleOdoSave} className="grid grid-cols-2 sm:flex sm:items-end gap-3 w-full lg:w-auto">
            <div className="space-y-1.5 col-span-1">
              <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest">Start Km</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 12050"
                value={startOdo}
                onChange={(e) => setStartOdo(e.target.value)}
                className="w-full sm:w-32 bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none placeholder-slate-700 py-2.5 px-3.5"
              />
            </div>
            
            <div className="space-y-1.5 col-span-1">
              <label className="block text-[9px] font-bold text-slate-450 uppercase tracking-widest">End Km</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 12180"
                value={endOdo}
                onChange={(e) => setEndOdo(e.target.value)}
                className="w-full sm:w-32 bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none placeholder-slate-700 py-2.5 px-3.5"
              />
            </div>
            
            <button
              type="submit"
              className="col-span-2 sm:col-span-auto w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer interactive-chip"
            >
              Save KM
            </button>
          </form>
        </div>

        {/* Live Metrics Row when Odometer is filled */}
        {dailyDistance > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5 border-t border-slate-900 animate-fade-in">
            {/* Distance driven */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Distance Driven</span>
              <span className="text-xl font-extrabold text-amber-400 mt-2 block">{dailyDistance.toFixed(1)} km</span>
              <span className="text-[9px] text-slate-500 mt-1">Kilometers completed</span>
            </div>

            {/* Earnings per KM */}
            <div className="bg-slate-955/40 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Earnings / KM</span>
              <span className="text-xl font-extrabold text-slate-200 mt-2 block">₹{earningsPerKm.toFixed(1)}<span className="text-[10px] text-slate-500 font-normal">/km</span></span>
              <span className="text-[9px] text-slate-500 mt-1">Gross fare per km</span>
            </div>

            {/* Fuel CNG cost per KM */}
            <div className="bg-slate-955/40 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-rose-455 uppercase tracking-wider">CNG Cost / KM</span>
              <span className="text-xl font-extrabold text-rose-400 mt-2 block">₹{fuelCostPerKm.toFixed(1)}<span className="text-[10px] text-slate-500 font-normal">/km</span></span>
              <span className="text-[9px] text-slate-550 mt-1">CNG overhead per km</span>
            </div>

            {/* Net Profit per KM */}
            <div className="bg-slate-955/40 p-4 rounded-xl border border-slate-850 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Profit / KM</span>
              <span className="text-xl font-extrabold text-emerald-450 mt-2 block">₹{profitPerKm.toFixed(1)}<span className="text-[10px] text-slate-500 font-normal">/km</span></span>
              <span className="text-[9px] text-emerald-555 mt-1 font-semibold">Net operating margin</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/30 border border-slate-900 rounded-xl text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Info size={14} className="text-slate-600" />
            <span>Fill odometer start and end values to calculate distance and ₹/KM running efficiency rates.</span>
          </div>
        )}
      </div>

      {/* Target Progress & Quick logging grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radial Target Progress block */}
        <div className="glass-card p-6 rounded-3xl border border-slate-850 flex flex-col justify-between items-center text-center">
          <div className="w-full text-left flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-250">Daily Goal Target</h3>
              <p className="text-[10px] text-slate-500">Track daily drop income goals</p>
            </div>
            
            {/* Input to dynamically set Daily Target */}
            <div className="flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-slate-900">
              <span className="text-slate-500 text-xs font-semibold">₹</span>
              <input
                type="number"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseFloat(e.target.value) || 0)}
                className="w-14 text-xs font-bold text-slate-200 bg-transparent focus:outline-none text-center border-none"
                title="Change Daily Target"
              />
            </div>
          </div>

          {/* SVG Progress Circle Wheel */}
          <div className="relative my-6 flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="stroke-slate-900 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={`fill-none transition-all duration-700 ease-out ${
                  isTargetAchieved ? 'stroke-emerald-450' : 'stroke-amber-500'
                }`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-2xl font-black ${isTargetAchieved ? 'text-emerald-400' : 'text-slate-100'}`}>
                {targetProgress}%
              </span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Completed</span>
            </div>
          </div>

          <div className="space-y-2 w-full text-xs">
            <div className="flex justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-450">Today's Balance:</span>
              <span className={`font-bold ${netProfitToday >= 0 ? 'text-emerald-400' : 'text-rose-455'}`}>
                ₹{netProfitToday}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-450">Target Earned:</span>
              <span className="font-semibold text-slate-200">₹{todayNetEarnings} / ₹{dailyTarget}</span>
            </div>
          </div>

          {isTargetAchieved && (
            <div className="mt-4 w-full flex items-center justify-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 font-bold tracking-wide animate-pulse">
              <Award size={12} />
              <span>Target Achieved! Good Job! 🎉</span>
            </div>
          )}
        </div>

        {/* High Speed Quick Logging Panel */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-850 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-200 mb-1 flex items-center gap-2">
              <Smartphone size={18} className="text-amber-500" />
              <span>Quick Fare Terminal</span>
            </h3>
            <p className="text-xs text-slate-450 mb-5">Instantly log cash/app payments after a passenger drop in one tap.</p>
            
            <form onSubmit={handleQuickLog} className="space-y-4">
              {/* Quick Select Buttons Grid */}
              <div className="flex overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 gap-2 scrollbar-none snap-x">
                {QUICK_PLATFORMS.map((plat) => {
                  const isSelected = quickPlatform === plat.id;
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => setQuickPlatform(plat.id)}
                      className={`flex-shrink-0 min-w-[90px] sm:min-w-0 snap-center py-3 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? `${plat.color} border-transparent shadow-lg scale-[1.03] ring-1 ring-white/10`
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <span className="text-lg">{plat.icon}</span>
                      <span>{plat.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Amount Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mr-1">Presets:</span>
                {[50, 80, 100, 150, 200].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setQuickAmount(amt.toString())}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border cursor-pointer interactive-chip ${
                      quickAmount === amt.toString()
                        ? 'bg-amber-500 text-slate-950 border-transparent shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Fare Entry */}
              <div className="flex gap-2.5 pt-1">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none text-sm font-bold">₹</span>
                  <input
                    type="number"
                    required
                    step="1"
                    min="1"
                    placeholder="Enter ride fare amount (e.g. 120)"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3.5 text-white focus:outline-none focus-glow-amber text-sm font-bold transition-all placeholder-slate-700"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  Quick Log
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-slate-850/60 my-4" />

          {/* Quick instructions / disclaimer */}
          <p className="text-[10px] text-slate-500 leading-normal flex items-start gap-1">
            <span>💡</span>
            <span>Quick log defaults payment methods by platform selection. Use "Detailed Ride" at the top to record custom comments, routes, or trip distances.</span>
          </p>
        </div>
      </div>

      {/* Recent Activity lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent rides logged */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-base text-slate-200">Recent Rides Logged</h3>
            <button
              onClick={() => setActiveTab('rides')}
              className="text-xs text-amber-400 hover:text-amber-350 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>View History</span>
              <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {todayRides.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/20 rounded-2xl border border-dashed border-slate-850">
                No rides logged yet today. Use the Quick Log panel above!
              </div>
            ) : (
              todayRides.slice(0, 4).map((ride) => (
                <div key={ride.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-900/35 border border-slate-850 text-xs gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-base flex-shrink-0">
                      {ride.platform === 'Uber' && '⚫'}
                      {ride.platform === 'Ola' && '🟢'}
                      {ride.platform === 'Rapido' && '🟡'}
                      {ride.platform === 'Namma Yatri' && '🟠'}
                      {ride.platform === 'Local' && '🛺'}
                      {ride.platform === 'Other' && '📱'}
                    </span>
                    <div className="min-w-0 text-left">
                      <span className="font-bold text-slate-100 block truncate" title={ride.notes || `${ride.platform} Auto Ride`}>
                        {ride.notes ? ride.notes : `${ride.platform} Auto Ride`}
                      </span>
                      <span className="text-[10px] text-slate-450 block truncate">Via {ride.paymentMode}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center justify-end flex-shrink-0">
                    <span className="font-black text-slate-100 text-sm">₹{ride.amount.toFixed(0)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses and Tip callout */}
        <div className="glass-card p-6 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-base text-slate-200">Daily Expenses</h3>
              <button
                onClick={() => setActiveTab('expenses')}
                className="text-xs text-rose-450 hover:text-rose-400 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Details</span>
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-3">
              {todayExpenses.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/20 rounded-2xl border border-dashed border-slate-850">
                  No expenses logged today.
                </div>
              ) : (
                todayExpenses.slice(0, 3).map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-900/35 border border-slate-850 text-xs text-left">
                    <div>
                      <span className="font-bold text-slate-200 block">{exp.notes ? exp.notes : exp.category}</span>
                      <span className="text-[9px] text-slate-500">{exp.category}</span>
                    </div>
                    <span className="font-bold text-rose-400">-₹{exp.amount.toFixed(0)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-slate-900/50 border border-amber-500/10 text-left">
            <h4 className="text-xs font-bold text-amber-400 mb-0.5">Auto Captain Tip</h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Running direct/street rides saves app commission cuts (e.g. up to 20%). Try balancing Local Rides with app pickups in high demand areas to maximize margins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
