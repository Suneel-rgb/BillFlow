import { useState } from 'react';
import { Plus, Search, Calendar, Clock, Edit2, Trash2, IndianRupee, MapPin, RefreshCw } from 'lucide-react';

const PLATFORMS_DETAILS = {
  Uber: { name: 'Uber Auto', style: 'bg-black/40 text-slate-100 border-slate-800' },
  Ola: { name: 'Ola Auto', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  Rapido: { name: 'Rapido', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  'Namma Yatri': { name: 'Namma Yatri', style: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
  Local: { name: 'Local Street', style: 'bg-slate-800/60 text-slate-300 border-slate-700' },
  Other: { name: 'Other App', style: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' }
};

function SwipeableItem({ children, onEdit, onDelete }) {
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleTouchStart = (e) => {
    if (window.innerWidth >= 768) return;
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const currentTouchX = e.touches[0].clientX;
    let diff = currentTouchX - startX;
    
    if (isOpen) {
      diff = diff - 130;
    }

    if (diff > 15) diff = 15;
    if (diff < -150) diff = -150;

    setCurrentX(diff);
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    if (currentX < -65) {
      setIsOpen(true);
      setCurrentX(-130);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try { window.navigator.vibrate(15); } catch (e) {}
      }
    } else {
      setIsOpen(false);
      setCurrentX(0);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCurrentX(0);
  };

  return (
    <div className="swipe-container group relative">
      <div className="swipe-actions-bg bg-slate-950 border border-slate-900">
        <div className="flex items-center gap-1.5 pr-1">
          <button
            onClick={() => {
              onEdit();
              handleClose();
            }}
            className="flex items-center justify-center p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white min-h-[44px] w-12 transition-all cursor-pointer border border-slate-800"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              onDelete();
              handleClose();
            }}
            className="flex items-center justify-center p-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 min-h-[44px] w-12 transition-all cursor-pointer border border-rose-500/25"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(${currentX}px)` }}
        className="swipe-foreground"
      >
        {children}
      </div>
    </div>
  );
}

export default function RidesTab({ rides, onAddRideClick, onEdit, onDelete }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateRange, setDateRange] = useState('All'); // All, Today, Yesterday, Week, Month
  const [sortBy, setSortBy] = useState('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtering Logic (strictly displaying relative to selected dateRange)
  const filteredRides = rides.filter(ride => {
    const matchesSearch = 
      (ride.notes && ride.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ride.platform && ride.platform.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPlatform = platformFilter === 'All' || ride.platform === platformFilter;
    const matchesPayment = paymentFilter === 'All' || ride.paymentMode === paymentFilter;

    // Filter matching Date Range
    let matchesDate = true;
    if (ride.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const rideDate = new Date(ride.date);
      rideDate.setHours(0, 0, 0, 0);

      if (dateRange === 'Today') {
        matchesDate = rideDate.getTime() === today.getTime();
      } else if (dateRange === 'Yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        matchesDate = rideDate.getTime() === yesterday.getTime();
      } else if (dateRange === 'Week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        matchesDate = rideDate >= sevenDaysAgo && rideDate <= today;
      } else if (dateRange === 'Month') {
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        matchesDate = rideDate.getMonth() === currentMonth && rideDate.getFullYear() === currentYear;
      }
    }

    return matchesSearch && matchesPlatform && matchesPayment && matchesDate;
  });

  // Sorting Logic
  const sortedRides = [...filteredRides].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        const tA = a.createdAt || (isNaN(Number(a.id)) ? 0 : Number(a.id));
        const tB = b.createdAt || (isNaN(Number(b.id)) ? 0 : Number(b.id));
        if (tA || tB) return tA - tB;
        return new Date(a.date) - new Date(b.date);
      case 'date-desc':
        const timeA = a.createdAt || (isNaN(Number(a.id)) ? 0 : Number(a.id));
        const timeB = b.createdAt || (isNaN(Number(b.id)) ? 0 : Number(b.id));
        if (timeA || timeB) return timeB - timeA;
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

  const totalFares = filteredRides.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const totalDistance = filteredRides.reduce((sum, r) => sum + parseFloat(r.distance || 0), 0);

  const activeFiltersCount = 
    (platformFilter !== 'All' ? 1 : 0) + 
    (paymentFilter !== 'All' ? 1 : 0) + 
    (dateRange !== 'All' ? 1 : 0) + 
    (sortBy !== 'date-desc' ? 1 : 0);

  const resetFilters = () => {
    setSearchTerm('');
    setPlatformFilter('All');
    setPaymentFilter('All');
    setDateRange('All');
    setSortBy('date-desc');
  };

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      
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
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/10 transition-all cursor-pointer text-xs"
        >
          <Plus size={16} />
          <span>Log Ride Fare</span>
        </button>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-amber-500/10 col-span-2 md:col-span-1">
          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block font-heading">Total Selected Earnings</span>
          <span className="text-xl font-black text-emerald-400 mt-1 block">₹{totalFares.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">{filteredRides.length} rides logged</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-850 col-span-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-heading">Selected Run Distance</span>
          <span className="text-xl font-bold text-slate-200 mt-1 block">{totalDistance.toFixed(1)} km</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Avg: {filteredRides.length > 0 ? (totalDistance / filteredRides.length).toFixed(1) : 0} km</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-850 col-span-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-heading">Average Ride Fare</span>
          <span className="text-xl font-bold text-slate-200 mt-1 block">₹{filteredRides.length > 0 ? (totalFares / filteredRides.length).toFixed(0) : 0}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Avg per passenger drop</span>
        </div>
      </div>

      {/* Filters & Search Panel */}
      <div className="glass-card p-5 rounded-2xl space-y-4 border border-slate-850">
        
        {/* Search & Toggle row */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by routes, platform, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-slate-100 placeholder-slate-600 focus:outline-none text-xs transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <span>⚙️</span>
              <span>{showFilters ? 'Hide Filters' : 'Filters & Sort'}</span>
              {activeFiltersCount > 0 && (
                <span className="bg-amber-500 text-slate-955 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Quick Clear Filter Button */}
            {(searchTerm || platformFilter !== 'All' || paymentFilter !== 'All' || dateRange !== 'All' || sortBy !== 'date-desc') && (
              <button
                onClick={resetFilters}
                className="text-xs text-amber-400 hover:text-amber-350 font-semibold py-2.5 px-3 hover:bg-amber-500/10 rounded-xl transition-colors border border-amber-500/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} />
                <span className="hidden sm:inline">Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Chips selectors for Platform & Date Range */}
        <div className="space-y-3 pt-2">
          {/* Date Range horizontal chips */}
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Filter by Date</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x pb-1">
              {[
                { id: 'All', label: 'All History' },
                { id: 'Today', label: 'Today' },
                { id: 'Yesterday', label: 'Yesterday' },
                { id: 'Week', label: 'Last 7 Days' },
                { id: 'Month', label: 'This Month' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => setDateRange(d.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border snap-center cursor-pointer transition-all ${
                    dateRange === d.id
                      ? 'bg-amber-500 text-slate-950 border-transparent shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform horizontal chips */}
          <div className="space-y-1 text-left">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Filter by Platform</span>
            <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x pb-1">
              {[
                { id: 'All', label: 'All Platforms' },
                { id: 'Uber', label: 'Uber Auto' },
                { id: 'Ola', label: 'Ola Auto' },
                { id: 'Rapido', label: 'Rapido' },
                { id: 'Namma Yatri', label: 'Namma Yatri' },
                { id: 'Local', label: 'Local Street' },
                { id: 'Other', label: 'Others' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatformFilter(p.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold border snap-center cursor-pointer transition-all ${
                    platformFilter === p.id
                      ? 'bg-amber-500 text-slate-950 border-transparent shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Collapsible details for Payment & Sort */}
        <div className={`${showFilters ? 'grid' : 'hidden md:grid'} grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-900 md:border-t-0 md:pt-0`}>
          {/* Payment filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Payment Mode</label>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Payment Modes</option>
              <option value="Cash">Cash</option>
              <option value="UPI / Online">UPI / Online</option>
            </select>
          </div>

          {/* Sort selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">Sort Rides</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="date-desc">Added On: Newest First</option>
              <option value="date-asc">Added On: Oldest First</option>
              <option value="fare-desc">Fare: High to Low</option>
              <option value="fare-asc">Fare: Low to High</option>
              <option value="net-desc">Net Earnings: High to Low</option>
              <option value="net-asc">Net Earnings: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Rides List Feed */}
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
              <SwipeableItem
                key={ride.id}
                onEdit={() => onEdit(ride)}
                onDelete={() => onDelete(ride.id)}
              >
                <div
                  className="glass-card p-4 md:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-850 hover:border-slate-800 transition-all text-left"
                >
                  {/* Info Area */}
                  <div className="flex items-start gap-4">
                    <span className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-lg flex items-center justify-center flex-shrink-0">
                      {ride.platform === 'Uber' && '⚫'}
                      {ride.platform === 'Ola' && '🟢'}
                      {ride.platform === 'Rapido' && '🟡'}
                      {ride.platform === 'Namma Yatri' && '🟠'}
                      {ride.platform === 'Local' && '🛺'}
                      {ride.platform === 'Other' && '📱'}
                    </span>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm sm:text-base font-bold text-slate-100 truncate max-w-[200px] sm:max-w-xs" title={ride.notes || `${plat.name} Fare`}>
                          {ride.notes ? ride.notes : `${plat.name} Fare`}
                        </h4>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase border flex-shrink-0 ${plat.style}`}>
                          {plat.name}
                        </span>
                      </div>

                      {/* Metadata: Date, Time, payment, distance */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-450 pt-0.5">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-slate-500 flex-shrink-0" />
                          <span>{new Date(ride.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                        {(() => {
                          const timestamp = ride.createdAt || (isNaN(Number(ride.id)) ? null : Number(ride.id));
                          if (!timestamp) return null;
                          try {
                            const timeStr = new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
                            return (
                              <span className="flex items-center gap-1.5">
                                <Clock size={12} className="text-slate-500 flex-shrink-0" />
                                <span>{timeStr}</span>
                              </span>
                            );
                          } catch (e) {
                            return null;
                          }
                        })()}
                        <span className="flex items-center gap-1.5">
                          <IndianRupee size={12} className="text-slate-500 flex-shrink-0" />
                          <span>{ride.paymentMode}</span>
                        </span>
                        {ride.distance && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-slate-500 flex-shrink-0" />
                            <span>{ride.distance} km</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount and Action Columns */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t border-slate-900 pt-3 md:pt-0 md:border-t-0">
                    <div className="text-left md:text-right">
                      <span className="text-base sm:text-lg font-black text-slate-100">
                        ₹{ride.amount.toFixed(0)}
                      </span>
                    </div>

                    {/* Edit/Delete Actions for Desktop */}
                    <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-900">
                      <button
                        onClick={() => onEdit(ride)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all cursor-pointer"
                        title="Edit Ride"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(ride.id)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                        title="Delete Ride"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </SwipeableItem>
            );
          })
        )}
      </div>
    </div>
  );
}
