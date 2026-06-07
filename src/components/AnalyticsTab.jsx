import { BarChart3, PieChart, Download, DollarSign, Fuel, Wallet, Percent, Award } from 'lucide-react';

const PLATFORMS_DETAILS = {
  Uber: { name: 'Uber Auto', color: 'bg-black text-white border-slate-700' },
  Ola: { name: 'Ola Auto', color: 'bg-lime-500/80 text-slate-950 border-lime-600' },
  Rapido: { name: 'Rapido', color: 'bg-yellow-400 text-slate-950 border-yellow-500' },
  'Namma Yatri': { name: 'Namma Yatri', color: 'bg-orange-500 text-white border-orange-600' },
  Local: { name: 'Local Ride', color: 'bg-slate-600 text-white border-slate-500' },
  Other: { name: 'Other App', color: 'bg-indigo-600 text-white border-indigo-500' }
};

export default function AnalyticsTab({ rides, expenses }) {
  // 1. Core aggregates
  const totalRidesCount = rides.length;
  const totalGrossEarnings = rides.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const totalNetEarnings = totalGrossEarnings;
  
  const totalCNGSpent = expenses
    .filter(e => e.category === 'CNG/Fuel')
    .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const totalAllExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  const takeHomePay = totalNetEarnings - totalAllExpenses;

  // 2. Platform aggregates
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

  // 3. Weekly trends (Group by day of week based on ride date)
  // Let's create an array of weekdays
  const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekdayStats = rides.reduce((acc, ride) => {
    if (ride.date) {
      const dateObj = new Date(ride.date);
      const dayName = WEEKDAYS[dateObj.getDay()];
      acc[dayName] = (acc[dayName] || 0) + parseFloat(ride.netAmount || 0);
    }
    return acc;
  }, {});

  const maxWeekdayNet = Math.max(...Object.values(weekdayStats), 1);

  // 4. CSV Exporter
  const handleExportCSV = () => {
    if (rides.length === 0 && expenses.length === 0) {
      alert('No data available to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Header for Rides
    csvContent += '=== AUTO RICKSHAW RIDE TRANSACTIONS ===\r\n';
    csvContent += 'Date,Platform,Fare,Payment Mode,Distance (km),Notes\r\n';
    rides.forEach(r => {
      csvContent += `${r.date},"${r.platform}",${r.amount},"${r.paymentMode}",${r.distance || ''},"${r.notes || ''}"\r\n`;
    });

    csvContent += '\r\n\r\n';

    // Header for Expenses
    csvContent += '=== AUTO VEHICLE EXPENSES ===\r\n';
    csvContent += 'Date,Category,Amount,Notes\r\n';
    expenses.forEach(e => {
      csvContent += `${e.date},"${e.category}",${e.amount},"${e.notes || ''}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RickshawFlow_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link); // Required for FF
    link.click();
    document.body.removeChild(link);
  };

  // Best performing platform helper
  let bestPlatform = 'None';
  let bestPlatformNet = 0;
  Object.keys(platformStats).forEach(p => {
    if (platformStats[p].net > bestPlatformNet) {
      bestPlatformNet = platformStats[p].net;
      bestPlatform = p;
    }
  });

  // CNG Expense Ratio
  const cngRatio = totalNetEarnings > 0 ? ((totalCNGSpent / totalNetEarnings) * 100) : 0;
  const totalExpenseRatio = totalNetEarnings > 0 ? ((totalAllExpenses / totalNetEarnings) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Performance Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Understand your most active booking channels, fuel spending, and download statements.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-400 hover:text-amber-350 border border-amber-500/20 hover:border-amber-500/40 font-bold transition-all shadow-md shadow-black/30 cursor-pointer"
        >
          <Download size={16} />
          <span>Export Excel/CSV</span>
        </button>
      </div>

      {/* Main KPI aggregates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gross Business card */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-amber-500/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Earnings</span>
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400"><DollarSign size={18} /></span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-slate-100">₹{totalGrossEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <p className="text-[10px] text-slate-400 mt-1">Total revenue collected from {totalRidesCount} rides</p>
          </div>
        </div>

        {/* CNG Fuel / Expense overhead */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-rose-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuel CNG & Expenses</span>
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-450"><Fuel size={18} /></span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-rose-450">₹{totalAllExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <p className="text-[10px] text-slate-400 mt-1">
              CNG: ₹{totalCNGSpent.toLocaleString()} | Maintenance/Repairs/Other: ₹{(totalAllExpenses - totalCNGSpent).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Net profit callout bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-indigo-500/10 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="p-3 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20"><Award size={22} /></span>
          <div>
            <h4 className="text-sm font-bold text-slate-200">Net Take-Home Earnings (Salary/Profit)</h4>
            <p className="text-xs text-slate-400 mt-0.5">Calculated as: Fares - Fuel/CNG & Repairs</p>
          </div>
        </div>
        <div className="text-center sm:text-right">
          <span className={`text-2xl font-black ${takeHomePay >= 0 ? 'text-emerald-400' : 'text-rose-455'}`}>
            ₹{takeHomePay.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 block">After all vehicle & daily overheads</span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Platform Share chart */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg text-slate-200 mb-5 flex items-center gap-2">
              <PieChart size={18} className="text-slate-450" />
              <span>Earnings by Booking Source</span>
            </h3>
            <div className="space-y-4">
              {Object.keys(PLATFORMS_DETAILS).map(pKey => {
                const stat = platformStats[pKey] || { count: 0, gross: 0, net: 0 };
                const pct = totalNetEarnings > 0 ? ((stat.net / totalNetEarnings) * 100) : 0;
                const percentOfMax = maxPlatformNet > 0 ? (stat.net / maxPlatformNet) * 100 : 0;
                const config = PLATFORMS_DETAILS[pKey];

                return (
                  <div key={pKey} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-350">{config.name} ({stat.count} rides)</span>
                      <span className="text-slate-200">₹{stat.net.toFixed(0)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-slate-900/50 rounded-full h-2.5 overflow-hidden border border-slate-950">
                      <div
                        className={`h-full rounded-full ${config.color.split(' ')[0]} transition-all duration-500`}
                        style={{ width: `${percentOfMax}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 p-4 rounded-xl bg-slate-900/40 border border-slate-850 text-xs text-slate-400">
            🥇 Most active booking channel: <strong className="text-amber-400">{PLATFORMS_DETAILS[bestPlatform]?.name || 'Local Ride'}</strong> with net earnings of ₹{bestPlatformNet.toFixed(0)}.
          </div>
        </div>

        {/* Weekly trends chart */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="font-bold text-lg text-slate-200 mb-5 flex items-center gap-2">
            <BarChart3 size={18} className="text-slate-450" />
            <span>Weekly Net Profit breakdown</span>
          </h3>

          <div className="flex items-end justify-between h-48 pt-6 border-b border-slate-800 pb-2">
            {WEEKDAYS.map(day => {
              const val = weekdayStats[day] || 0;
              const percent = maxWeekdayNet > 0 ? (val / maxWeekdayNet) * 100 : 0;
              return (
                <div key={day} className="flex flex-col items-center flex-1 group relative">
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 bg-slate-900 border border-slate-700 text-[9px] font-bold text-slate-200 py-1 px-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    ₹{val.toFixed(0)}
                  </div>
                  
                  {/* Vertical bar */}
                  <div
                    className="w-5 sm:w-6 bg-gradient-to-t from-amber-500 to-yellow-400 rounded-t-lg group-hover:from-amber-400 group-hover:to-yellow-300 transition-all shadow-md shadow-amber-500/5"
                    style={{ height: `${Math.max(percent, 3)}%` }}
                  />
                  
                  {/* Label */}
                  <span className="text-[9px] text-slate-500 mt-2 font-bold uppercase truncate max-w-full">
                    {day.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-450 mt-4 text-center">Vertical bars show net earnings (₹) logged for each day of the week.</p>
        </div>
      </div>

      {/* Ratios & Operating margins section */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="font-bold text-lg text-slate-250 mb-5 flex items-center gap-2">
          <Wallet size={18} className="text-slate-500" />
          <span>Operating Cost Analysis</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fuel Overhead ratio */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-350 font-semibold flex items-center gap-1.5">
                <Fuel size={14} className="text-emerald-450" />
                <span>CNG / Fuel Cost Ratio</span>
              </span>
              <span className="font-bold text-emerald-400">{cngRatio.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                style={{ width: `${Math.min(cngRatio, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              For every ₹100 earned, you spent <strong>₹{cngRatio.toFixed(0)}</strong> on CNG fuel. A fuel cost below 25% represents healthy margins.
            </p>
          </div>

          {/* Total Expense overhead */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-350 font-semibold flex items-center gap-1.5">
                <Percent size={14} className="text-rose-400" />
                <span>Total Expenses Ratio</span>
              </span>
              <span className="font-bold text-rose-400">{totalExpenseRatio.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-red-500 rounded-full transition-all"
                style={{ width: `${Math.min(totalExpenseRatio, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Total expenses (fuel, EMI, repairs, tea) consume <strong>{totalExpenseRatio.toFixed(0)}%</strong> of your net earnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
