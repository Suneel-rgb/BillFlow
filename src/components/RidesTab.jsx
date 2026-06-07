import { useState } from 'react';
import { Search, Edit2, Trash2, Calendar, MapPin, IndianRupee, RefreshCw, Plus } from 'lucide-react';

const PLATFORMS_DETAILS = {
  Uber: { name: 'Uber Auto', style: 'bg-black text-white border-slate-800' },
  Ola: { name: 'Ola Auto', style: 'bg-lime-500/20 text-lime-400 border-lime-500/30' },
  Rapido: { name: 'Rapido', style: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'Namma Yatri': { name: 'Namma Yatri', style: 'bg-orange-500/20 text-orange-450 border-orange-500/30' },
  Local: { name: 'Local Ride', style: 'bg-slate-550/20 text-slate-350 border-slate-500/35' },
  Other: { name: 'Other App', style: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' }
};

export default function RidesTab({ rides, onAddRideClick, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All'); // All, Today, Yesterday, Last7Days, Month
  const [sortBy, setSortBy] = useState('date-desc');

  // Filtering Logic
  const filteredRides = rides.filter(ride => {
    // Search matching route/notes
    const matchesSearch = 
      (ride.notes && ride.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ride.platform && ride.platform.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter matching Platform
    const matchesPlatform = platformFilter === 'All' || ride.platform === platformFilter;
    
    // Filter matching Payment
    const matchesPayment = paymentFilter === 'All' || ride.paymentMode === paymentFilter;

    // Filter matching Date Range
    let matchesDate = true;
    if (dateRange !== 'All' && ride.date) {
      const rideDate = new Date(ride.date);
      rideDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateRange === 'Today') {
        matchesDate = rideDate.getTime() === today.getTime();
      } else if (dateRange === 'Yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        matchesDate = rideDate.getTime() === yesterday.getTime();
      } else if (dateRange === 'Last7Days') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        matchesDate = rideDate >= sevenDaysAgo && rideDate <= today;
      } else if (dateRange === 'Month') {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        matchesDate = rideDate >= firstDayOfMonth && rideDate <= today;
      }
    }

    return matchesSearch && matchesPlatform && matchesPayment && matchesDate;
  });

  // Sorting Logic
  const sortedRides = [...filteredRides].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'fare-asc':
        return a.amount - b.amount;
      case 'fare-desc':
        return b.amount - a.amount;
      case 'net-asc':
        return a.netAmount - b.netAmount;
      case 'net-desc':
        return b.netAmount - a.netAmount;
      default:
        return 0;
    }
  });

  // Metrics for filtered rides
  const totalFares = filteredRides.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const totalDistance = filteredRides.reduce((sum, r) => sum + parseFloat(r.distance || 0), 0);

  const resetFilters = () => {
    setSearchTerm('');
    setPlatformFilter('All');
    setPaymentFilter('All');
    setDateRange('All');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Rides History
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Search, filter, and review all your logged passenger fares.
          </p>
        </div>
        <button
          onClick={onAddRideClick}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/10 transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={18} />
          <span>Log Ride Fare</span>
        </button>
      </div>

      {/* Quick Filter Summary Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-amber-500/10">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Total Earnings</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">₹{totalFares.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-emerald-500/80 block mt-0.5">{filteredRides.length} rides logged</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Logged Distance</span>
          <span className="text-xl font-bold text-slate-200 mt-1 block">{totalDistance.toFixed(1)} km</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Avg: {filteredRides.length > 0 ? (totalDistance / filteredRides.length).toFixed(1) : 0} km / ride</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Fare</span>
          <span className="text-xl font-bold text-slate-200 mt-1 block">₹{filteredRides.length > 0 ? (totalFares / filteredRides.length).toFixed(0) : 0}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Average earnings per ride</span>
        </div>
      </div>

      {/* Filters & Search Panel */}
      <div className="glass-card p-5 rounded-2xl space-y-4 border border-slate-850">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by routes, platform, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm transition-all"
            />
          </div>

          {/* Quick Clear Filter Button */}
          {(searchTerm || platformFilter !== 'All' || paymentFilter !== 'All' || dateRange !== 'All') && (
            <button
              onClick={resetFilters}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold py-2 px-3 hover:bg-amber-500/10 rounded-xl transition-colors border border-amber-500/20 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Multi-Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Platform filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Platform</label>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-350 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Booking Options</option>
              <option value="Uber">Uber Auto</option>
              <option value="Ola">Ola Auto</option>
              <option value="Rapido">Rapido Captain</option>
              <option value="Namma Yatri">Namma Yatri</option>
              <option value="Local">Local Ride</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Payment filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Payment Mode</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-355 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Payment Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI / Online">UPI / Online</option>
              <option value="Platform Wallet">Platform Wallet</option>
            </select>
          </div>

          {/* Date range filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Time Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-355 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All History</option>
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last7Days">Last 7 Days</option>
              <option value="Month">This Month</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Sort Rides</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2 text-slate-355 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="date-desc">Date: Latest First</option>
              <option value="date-asc">Date: Oldest First</option>
              <option value="fare-desc">Fare: High to Low</option>
              <option value="fare-asc">Fare: Low to High</option>
              <option value="net-desc">Net Earnings: High to Low</option>
              <option value="net-asc">Net Earnings: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rides List Table */}
      <div className="space-y-3">
        {sortedRides.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-slate-800">
            <p className="text-slate-400 font-medium">No ride payments match your search filter criteria.</p>
            <p className="text-slate-550 text-xs mt-1">Try resetting the filters or log a ride to populate the logs!</p>
          </div>
        ) : (
          sortedRides.map((ride) => {
            const plat = PLATFORMS_DETAILS[ride.platform] || PLATFORMS_DETAILS.Other;
            return (
              <div
                key={ride.id}
                className="glass-card p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                {/* Info Area */}
                <div className="flex items-start gap-4">
                  {/* Visual Platform Indicator Icon */}
                  <span className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 text-lg flex items-center justify-center">
                    {ride.platform === 'Uber' && '⚫'}
                    {ride.platform === 'Ola' && '🟢'}
                    {ride.platform === 'Rapido' && '🟡'}
                    {ride.platform === 'Namma Yatri' && '🟠'}
                    {ride.platform === 'Local' && '🛺'}
                    {ride.platform === 'Other' && '📱'}
                  </span>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold text-slate-100">
                        {ride.notes ? ride.notes : `${plat.name} Fare`}
                      </h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${plat.style}`}>
                        {plat.name}
                      </span>
                    </div>

                    {/* Metadata: Date, payment, distance */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-450">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-500" />
                        <span>{new Date(ride.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <IndianRupee size={12} className="text-slate-500" />
                        <span>Via: {ride.paymentMode}</span>
                      </span>
                      {ride.distance && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-500" />
                          <span>{ride.distance} km</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Action Columns */}
                <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-900 pt-3 md:pt-0 md:border-t-0">
                  {/* Fare metrics */}
                  <div className="text-left md:text-right">
                    <span className="text-lg font-black text-slate-100">
                      ₹{ride.amount.toFixed(0)}
                    </span>
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex items-center gap-1.5 pl-4 border-l border-slate-900">
                    <button
                      onClick={() => onEdit(ride)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700/50 transition-all cursor-pointer"
                      title="Edit Ride"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(ride.id)}
                      className="p-2.5 rounded-xl text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                      title="Delete Ride"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
