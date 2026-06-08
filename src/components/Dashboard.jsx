import { useState } from 'react';
import { Fuel, Plus, ChevronRight, Award, Smartphone } from 'lucide-react';

const QUICK_PLATFORMS = [
  { id: 'Local', label: 'Local Ride', icon: '🛺', color: 'bg-slate-700/80 text-white hover:bg-slate-650' },
  { id: 'Uber', label: 'Uber Auto', icon: '⚫', color: 'bg-black text-white hover:bg-slate-900 border border-slate-800' },
  { id: 'Ola', label: 'Ola Auto', icon: '🟢', color: 'bg-lime-500/90 text-slate-950 hover:bg-lime-400 font-bold' },
  { id: 'Rapido', label: 'Rapido Captain', icon: '🟡', color: 'bg-yellow-400/90 text-slate-950 hover:bg-yellow-350 font-bold' },
  { id: 'Namma Yatri', label: 'Namma Yatri', icon: '🟠', color: 'bg-orange-500/90 text-white hover:bg-orange-400' }
];

export default function Dashboard({ 
  rides, 
  expenses, 
  dailyTarget, 
  setDailyTarget, 
  onQuickRideSubmit,
  onOpenAddRideModal,
  onOpenAddExpenseModal,
  setActiveTab
}) {
  const [quickAmount, setQuickAmount] = useState('');
  const [quickPlatform, setQuickPlatform] = useState('Local');

  // Filter today's items
  const todayStr = new Date().toISOString().split('T')[0];
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

  // Daily target progress calculations
  const targetProgress = dailyTarget > 0 ? Math.min(Math.round((todayNetEarnings / dailyTarget) * 100), 100) : 0;
  const isTargetAchieved = todayNetEarnings >= dailyTarget && dailyTarget > 0;

  // SVG Circular Progress Wheel calculations
  const radius = 60;
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
    // Pulse animation or notification would be nice
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 via-yellow-450 to-amber-500 bg-clip-text text-transparent">
            Captain Dashboard
          </h1>
          <p className="text-slate-400 mt-1 text-sm md:text-base">
            Track daily ride targets and manage fuel costs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onOpenAddRideModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/10 transition-all hover:-translate-y-0.5 cursor-pointer text-xs sm:text-sm"
          >
            <Plus size={16} />
            <span>Detailed Ride</span>
          </button>
          <button
            onClick={onOpenAddExpenseModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-rose-500/20 text-rose-400 hover:bg-slate-850 hover:text-rose-350 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <Fuel size={16} className="text-rose-450" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gross earnings card */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group border border-amber-500/10">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Today's Earnings</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 block">₹{todayGross.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Total collected: {todayRides.length} rides</span>
        </div>

        {/* Fuel & Expenses Spent */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daily CNG & Expenses</span>
          <span className="text-xl sm:text-2xl font-black text-rose-400 mt-2 block">₹{todayAllExpenses.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Fuel CNG: ₹{todayFuel.toLocaleString()}</span>
        </div>

        {/* Today's Net Profit */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Net Profit</span>
          <span className="text-xl sm:text-2xl font-black text-slate-100 mt-2 block">₹{netProfitToday.toLocaleString()}</span>
          <span className="text-[9px] text-slate-550 block mt-0.5">Earnings minus expenses</span>
        </div>
      </div>

      {/* Target Progress Wheel & Quick logging columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radial Target Progress block */}
        <div className="glass-card p-6 rounded-2xl border border-slate-850 flex flex-col justify-between items-center text-center order-2 lg:order-1">
          <div className="w-full text-left flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-200">Daily Target</h3>
              <p className="text-[10px] text-slate-400">Keep tracking daily milestones</p>
            </div>
            
            {/* Input to dynamically set Daily Target */}
            <div className="flex items-center gap-1 bg-slate-950/65 px-2.5 py-1 rounded-xl border border-slate-800">
              <span className="text-slate-500 text-xs font-semibold">₹</span>
              <input
                type="number"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseFloat(e.target.value) || 0)}
                className="w-14 text-xs font-bold text-slate-100 bg-transparent focus:outline-none text-center"
                title="Change Daily Target"
              />
            </div>
          </div>

          {/* SVG Progress Circle Wheel */}
          <div className="relative my-6 flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90">
              {/* Underlay Circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-slate-900 fill-none"
                strokeWidth="10"
              />
              {/* Overlay active Circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                className={`fill-none transition-all duration-700 ease-out ${
                  isTargetAchieved ? 'stroke-emerald-400' : 'stroke-amber-400'
                }`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-2xl font-black ${isTargetAchieved ? 'text-emerald-400' : 'text-slate-100'}`}>
                {targetProgress}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Completed</span>
            </div>
          </div>

          <div className="space-y-1 w-full">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Today's Profit:</span>
              <span className={`font-bold ${netProfitToday >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{netProfitToday}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Earnings Target:</span>
              <span className="font-semibold text-slate-200">₹{todayNetEarnings} / ₹{dailyTarget}</span>
            </div>
          </div>

          {isTargetAchieved && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20 font-semibold animate-bounce">
              <Award size={14} />
              <span>Target Achieved! Good Job! 🎉</span>
            </div>
          )}
        </div>

        {/* High Speed Quick Logging Panel */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-850 flex flex-col justify-between order-1 lg:order-2">
          <div>
            <h3 className="font-bold text-base text-slate-200 mb-2 flex items-center gap-1.5">
              <Smartphone size={16} className="text-amber-550" />
              <span>Quick Log Ride Fare</span>
            </h3>
            <p className="text-xs text-slate-450 mb-5">Instantly log cash/app payments after a drop-off in a single click.</p>
            
            <form onSubmit={handleQuickLog} className="space-y-4">
              {/* Quick Select Buttons */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {QUICK_PLATFORMS.map((plat) => {
                  const isSelected = quickPlatform === plat.id;
                  return (
                    <button
                      key={plat.id}
                      type="button"
                      onClick={() => setQuickPlatform(plat.id)}
                      className={`py-2 rounded-xl text-[10px] font-semibold border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? `${plat.color} border-transparent shadow-md shadow-amber-500/5`
                          : 'bg-slate-900/40 border-slate-800 text-slate-350 hover:bg-slate-900/90'
                      }`}
                    >
                      <span className="text-sm">{plat.icon}</span>
                      <span>{plat.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Amount Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Presets:</span>
                {[50, 80, 100, 150, 200].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setQuickAmount(amt.toString())}
                    className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg border cursor-pointer interactive-chip ${
                      quickAmount === amt.toString()
                        ? 'bg-amber-500 text-slate-950 border-transparent shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Fare Entry */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none text-sm font-bold">₹</span>
                  <input
                    type="number"
                    required
                    step="1"
                    min="1"
                    placeholder="Enter ride fare amount (e.g. 120)"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-8 pr-4 py-3.5 text-white focus:outline-none focus-glow-amber text-sm font-bold transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer hover:-translate-y-0.5"
                >
                  Quick Log
                </button>
              </div>
            </form>
          </div>

          <div className="border-t border-slate-850 my-4" />

          {/* Quick instructions / disclaimer */}
          <p className="text-[10px] text-slate-455 leading-normal">
            💡 Quick log automatically defaults the payment mode based on your booking channel. Use the "Detailed Ride" button in the top-right to log custom locations, notes, or ride distances.
          </p>
        </div>
      </div>

      {/* Recent Activity lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent rides logged */}
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-base text-slate-200">Recent Rides Logged</h3>
            <button
              onClick={() => setActiveTab('rides')}
              className="text-xs text-amber-400 hover:text-amber-350 font-semibold flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All Rides</span>
              <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-3">
            {todayRides.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/45 rounded-xl border border-dashed border-slate-850">
                No rides logged yet today. Use the Quick Log panel above!
              </div>
            ) : (
              todayRides.slice(0, 4).map((ride) => (
                <div key={ride.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/35 border border-slate-850 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-base">
                      {ride.platform === 'Uber' && '⚫'}
                      {ride.platform === 'Ola' && '🟢'}
                      {ride.platform === 'Rapido' && '🟡'}
                      {ride.platform === 'Namma Yatri' && '🟠'}
                      {ride.platform === 'Local' && '🛺'}
                      {ride.platform === 'Other' && '📱'}
                    </span>
                    <div>
                      <span className="font-bold text-slate-100 block">
                        {ride.notes ? ride.notes : `${ride.platform} Auto Ride`}
                      </span>
                      <span className="text-[10px] text-slate-450">Via {ride.paymentMode}</span>
                    </div>
                  </div>
                  <div className="text-right flex items-center justify-end">
                    <span className="font-black text-slate-100 text-sm">₹{ride.amount.toFixed(0)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expenses and Tip callout */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-base text-slate-200">Daily Expenses</h3>
              <button
                onClick={() => setActiveTab('expenses')}
                className="text-xs text-rose-400 hover:text-rose-350 font-semibold flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Details</span>
                <ChevronRight size={12} />
              </button>
            </div>

            <div className="space-y-3">
              {todayExpenses.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950/45 rounded-xl border border-dashed border-slate-855">
                  No expenses logged today.
                </div>
              ) : (
                todayExpenses.slice(0, 3).map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/35 border border-slate-855 text-xs">
                    <div>
                      <span className="font-bold text-slate-150 block">{exp.notes ? exp.notes : exp.category}</span>
                      <span className="text-[9px] text-slate-550">{exp.category}</span>
                    </div>
                    <span className="font-bold text-rose-450">-₹{exp.amount.toFixed(0)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-indigo-500/10 border border-amber-500/10">
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
