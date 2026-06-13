import { BarChart3, PieChart, Download, DollarSign, Fuel, Wallet, Percent, Award, TrendingUp, TrendingDown } from 'lucide-react';

const PLATFORMS_DETAILS = {
  Uber: { name: 'Uber Auto', barColor: 'from-slate-700 to-slate-600', dotColor: 'bg-slate-500' },
  Ola: { name: 'Ola Auto', barColor: 'from-lime-500 to-emerald-500', dotColor: 'bg-lime-500' },
  Rapido: { name: 'Rapido', barColor: 'from-yellow-400 to-amber-500', dotColor: 'bg-yellow-400' },
  'Namma Yatri': { name: 'Namma Yatri', barColor: 'from-orange-500 to-red-500', dotColor: 'bg-orange-500' },
  Local: { name: 'Local Street', barColor: 'from-slate-500 to-slate-400', dotColor: 'bg-slate-400' },
  Other: { name: 'Other App', barColor: 'from-indigo-500 to-purple-500', dotColor: 'bg-indigo-500' }
};

export default function AnalyticsTab({ rides, expenses }) {
  const totalRidesCount = rides.length;
  const totalGrossEarnings = rides.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const totalNetEarnings = totalGrossEarnings;
  
  const totalCNGSpent = expenses
    .filter(e => e.category === 'CNG/Fuel')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalAllExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  const takeHomePay = totalNetEarnings - totalAllExpenses;

  // Platform aggregates
  const platformStats = rides.reduce((acc, ride) => {
    const plat = ride.platform || 'Local';
    if (!acc[plat]) {
      acc[plat] = { count: 0, gross: 0, net: 0 };
    }
    acc[plat].count += 1;
    acc[plat].gross += parseFloat(ride.amount || 0);
    acc[plat].net += parseFloat(ride.amount || 0);
    return acc;
  }, {});

  const maxPlatformNet = Math.max(...Object.values(platformStats).map(s => s.net), 1);

  // Weekly trends
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekdayStats = rides.reduce((acc, ride) => {
    if (ride.date) {
      const dateObj = new Date(ride.date);
      const dayName = WEEKDAYS[dateObj.getDay()];
      acc[dayName] = (acc[dayName] || 0) + parseFloat(ride.amount || 0);
    }
    return acc;
  }, {});

  const maxWeekdayNet = Math.max(...Object.values(weekdayStats), 1);

  // CSV Exporter
  const handleExportCSV = () => {
    if (rides.length === 0 && expenses.length === 0) {
      alert('No data available to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    
    csvContent += '=== AUTO RICKSHAW RIDE TRANSACTIONS ===\r\n';
    csvContent += 'Date,Platform,Fare,Payment Mode,Distance (km),Notes\r\n';
    rides.forEach(r => {
      csvContent += `${r.date},"${r.platform}",${r.amount},"${r.paymentMode}",${r.distance || ''},"${r.notes || ''}"\r\n`;
    });

    csvContent += '\r\n\r\n';

    csvContent += '=== AUTO VEHICLE EXPENSES ===\r\n';
    csvContent += 'Date,Category,Amount,Notes\r\n';
    expenses.forEach(e => {
      csvContent += `${e.date},"${e.category}",${e.amount},"${e.notes || ''}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RickshawFlow_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Best performing platform
  let bestPlatform = 'None';
  let bestPlatformNet = 0;
  Object.keys(platformStats).forEach(p => {
    if (platformStats[p].net > bestPlatformNet) {
      bestPlatformNet = platformStats[p].net;
      bestPlatform = p;
    }
  });

  const cngRatio = totalNetEarnings > 0 ? ((totalCNGSpent / totalNetEarnings) * 100) : 0;
  const totalExpenseRatio = totalNetEarnings > 0 ? ((totalAllExpenses / totalNetEarnings) * 100) : 0;

  return (
    <div className="space-y-5 animate-fade-in relative z-10 text-left">
      
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
            Performance Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Booking channels, fuel overhead & weekly trends
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-amber-400 hover:text-amber-300 border border-amber-500/15 hover:border-amber-500/30 font-bold transition-all cursor-pointer text-xs"
        >
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Hero Net Profit Card */}
      <div className="p-5 rounded-2xl border border-amber-500/10 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(16,185,129,0.06) 50%, rgba(99,102,241,0.05) 100%)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -translate-y-8 translate-x-8" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
              <Award size={20} className="text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-300">Net Take-Home Profit</h4>
              <p className="text-[10px] text-slate-600">Fares minus all operating costs</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-black ${takeHomePay >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ₹{takeHomePay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              {takeHomePay >= 0 ? <TrendingUp size={18} className="text-emerald-500" /> : <TrendingDown size={18} className="text-rose-400" />}
            </div>
            <span className="text-[10px] text-slate-600 block">{totalRidesCount} rides completed</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-slate-800/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Gross Revenue</span>
            <DollarSign size={14} className="text-indigo-400" />
          </div>
          <span className="text-xl font-black text-slate-100 block">₹{totalGrossEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-slate-600 block mt-1">From {totalRidesCount} drops</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Costs</span>
            <Fuel size={14} className="text-rose-400" />
          </div>
          <span className="text-xl font-black text-rose-400 block">₹{totalAllExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
          <span className="text-[9px] text-slate-600 block mt-1">CNG: ₹{totalCNGSpent.toLocaleString()}</span>
        </div>
      </div>

      {/* Platform Distribution */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800/40">
        <h3 className="font-bold text-sm text-slate-300 mb-4 flex items-center gap-2">
          <PieChart size={15} className="text-slate-500" />
          <span>Earnings by Platform</span>
        </h3>
        <div className="space-y-3.5">
          {Object.keys(PLATFORMS_DETAILS).map(pKey => {
            const stat = platformStats[pKey] || { count: 0, gross: 0, net: 0 };
            const pct = totalNetEarnings > 0 ? ((stat.net / totalNetEarnings) * 100) : 0;
            const percentOfMax = maxPlatformNet > 0 ? (stat.net / maxPlatformNet) * 100 : 0;
            const config = PLATFORMS_DETAILS[pKey];

            return (
              <div key={pKey} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                    {config.name} <span className="text-slate-600">({stat.count})</span>
                  </span>
                  <span className="text-slate-300 font-bold tabular-nums">₹{stat.net.toFixed(0)} <span className="text-slate-600 font-normal">({pct.toFixed(0)}%)</span></span>
                </div>
                <div className="w-full bg-slate-900/60 border border-slate-800/30 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${config.barColor} transition-all duration-700 ease-out`}
                    style={{ width: `${percentOfMax}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 rounded-xl bg-slate-900/30 border border-slate-800/30 text-[10px] text-slate-500">
          🥇 Top channel: <strong className="text-amber-400">{PLATFORMS_DETAILS[bestPlatform]?.name || 'Local'}</strong> — ₹{bestPlatformNet.toFixed(0)} earned
        </div>
      </div>

      {/* Weekly Trends Chart */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800/40">
        <h3 className="font-bold text-sm text-slate-300 mb-4 flex items-center gap-2">
          <BarChart3 size={15} className="text-slate-500" />
          <span>Weekly Breakdown</span>
        </h3>
        <div className="flex items-end justify-between h-40 pt-4 border-b border-slate-800/30 pb-2 px-1">
          {WEEKDAYS.map(day => {
            const val = weekdayStats[day] || 0;
            const percent = maxWeekdayNet > 0 ? (val / maxWeekdayNet) * 100 : 0;
            return (
              <div key={day} className="flex flex-col items-center flex-1 group relative">
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 bg-slate-800 border border-slate-700 text-[9px] font-bold text-slate-200 py-1 px-2.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  ₹{val.toFixed(0)}
                </div>
                {/* Bar */}
                <div
                  className="w-5 sm:w-7 bg-gradient-to-t from-amber-500 to-yellow-400 rounded-t-lg group-hover:from-amber-400 group-hover:to-yellow-300 transition-all duration-300 shadow-sm"
                  style={{ height: `${Math.max(percent, 5)}%` }}
                />
                {/* Label */}
                <span className="text-[8px] text-slate-600 mt-2 font-bold uppercase">
                  {day.substring(0, 2)}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-600 mt-3 text-center">Net earnings by day of week</p>
      </div>

      {/* Cost Analysis */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800/40">
        <h3 className="font-bold text-sm text-slate-300 mb-4 flex items-center gap-2">
          <Wallet size={15} className="text-slate-500" />
          <span>Operating Cost Ratios</span>
        </h3>
        <div className="grid grid-cols-1 gap-5">
          {/* Fuel ratio */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Fuel size={12} className="text-emerald-400" />
                CNG / Fuel Ratio
              </span>
              <span className="font-bold text-emerald-400 tabular-nums">{cngRatio.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-900/60 border border-slate-800/30 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(cngRatio, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600">
              ₹{cngRatio.toFixed(0)} per ₹100 earned goes to fuel. Below 25% = healthy.
            </p>
          </div>

          {/* Total expense ratio */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Percent size={12} className="text-rose-400" />
                Total Expense Ratio
              </span>
              <span className="font-bold text-rose-400 tabular-nums">{totalExpenseRatio.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-900/60 border border-slate-800/30 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(totalExpenseRatio, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-600">
              All costs consume {totalExpenseRatio.toFixed(0)}% of your revenue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
