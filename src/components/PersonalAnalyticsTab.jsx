// Analytics Tab for Personal Mode
import { BarChart3, PieChart, Download, TrendingDown, Wallet, AlertCircle } from 'lucide-react';

export default function PersonalAnalyticsTab({ bills, personalExpenses }) {
  // Current Month String
  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const monthLabel = new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Filter this month's items
  const thisMonthBills = bills.filter(b => b.dueDate && b.dueDate.startsWith(currentMonthStr));
  const thisMonthExpenses = personalExpenses.filter(e => e.date && e.date.startsWith(currentMonthStr));

  // Totals calculations
  const totalBillsThisMonth = thisMonthBills.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const paidBillsThisMonth = thisMonthBills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const unpaidBillsThisMonth = thisMonthBills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const totalExpensesThisMonth = thisMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const totalMonthlySpending = paidBillsThisMonth + totalExpensesThisMonth;

  // Category Breakdown
  const categoryTotals = {};
  
  thisMonthBills.forEach(b => {
    const statusLabel = b.status === 'Paid' ? 'Paid' : 'Unpaid';
    const cat = `Bill: ${b.category} (${statusLabel})`;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(b.amount || 0);
  });

  thisMonthExpenses.forEach(e => {
    const cat = `Spend: ${e.category}`;
    categoryTotals[cat] = (categoryTotals[cat] || 0) + parseFloat(e.amount || 0);
  });

  const sortedCategories = Object.keys(categoryTotals)
    .map(name => ({ name, value: categoryTotals[name] }))
    .sort((a, b) => b.value - a.value);

  // Payment Mode Allocations
  const paymentModeTotals = {};
  thisMonthBills.filter(b => b.status === 'Paid').forEach(b => {
    const mode = b.paymentMode || 'UPI / Online';
    paymentModeTotals[mode] = (paymentModeTotals[mode] || 0) + parseFloat(b.amount || 0);
  });
  thisMonthExpenses.forEach(e => {
    const mode = e.paymentMode || 'UPI / Online';
    paymentModeTotals[mode] = (paymentModeTotals[mode] || 0) + parseFloat(e.amount || 0);
  });

  const maxCategoryValue = sortedCategories.length > 0 ? Math.max(...sortedCategories.map(c => c.value)) : 1;
  const totalPaymentModes = Object.values(paymentModeTotals).reduce((s, v) => s + v, 0) || 1;

  // Find most used payment mode
  const topPaymentMode = Object.keys(paymentModeTotals).reduce(
    (top, mode) => paymentModeTotals[mode] > (paymentModeTotals[top] || 0) ? mode : top,
    'UPI / Online'
  );

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Title/Category,Amount (INR),Date/Due Date,Payment Mode,Status/Notes,Frequency\n";

    bills.forEach(b => {
      const escapedTitle = (b.title || "").replace(/,/g, " ");
      const freq = b.frequency || "Monthly";
      csvContent += `Bill,${escapedTitle},${b.amount},${b.dueDate},${b.paymentMode},${b.status},${freq}\n`;
    });

    personalExpenses.forEach(e => {
      const escapedNotes = (e.notes || "").replace(/,/g, " ");
      csvContent += `Expense,${e.category},${e.amount},${e.date},${e.paymentMode},${escapedNotes},One-time\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `personal_ledger_${currentMonthStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Color assignments for payment mode bars
  const paymentModeColors = {
    'UPI / Online': { bar: 'from-emerald-500 to-teal-400', dot: 'bg-emerald-500' },
    'Cash': { bar: 'from-amber-500 to-yellow-400', dot: 'bg-amber-500' },
    'Credit / Debit Card': { bar: 'from-indigo-500 to-purple-500', dot: 'bg-indigo-500' }
  };

  return (
    <div className="space-y-5 animate-fade-in text-left relative z-10">
      
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
            Personal Analytics
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Monthly household bills & spend patterns — {monthLabel}
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-emerald-400 hover:text-emerald-300 border border-emerald-500/15 hover:border-emerald-500/30 font-bold transition-all cursor-pointer text-xs"
        >
          <Download size={14} />
          <span>Export Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-emerald-500/10">
          <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest block">Spent This Month</span>
          <span className="text-xl font-black text-slate-100 mt-2 block">₹{totalMonthlySpending.toLocaleString()}</span>
          <div className="flex gap-2 mt-2 text-[9px] text-slate-600">
            <span>Bills: ₹{paidBillsThisMonth.toLocaleString()}</span>
            <span>•</span>
            <span>Spends: ₹{totalExpensesThisMonth.toLocaleString()}</span>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800/40">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle size={10} className="text-rose-400" />
            <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest">Pending</span>
          </div>
          <span className="text-xl font-black text-rose-400 block">₹{unpaidBillsThisMonth.toLocaleString()}</span>
          <span className="text-[9px] text-slate-600 block mt-2">Total billed: ₹{totalBillsThisMonth.toLocaleString()}</span>
        </div>
      </div>

      {/* Category Split */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800/40">
        <h3 className="font-bold text-sm text-slate-300 mb-1 flex items-center gap-2">
          <BarChart3 size={15} className="text-emerald-400" />
          <span>Category Breakdown</span>
        </h3>
        <p className="text-[10px] text-slate-600 mb-4">Highest outlays this month</p>

        <div className="space-y-3.5">
          {sortedCategories.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-600 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800/40">
              Log bills or spends to see category splits.
            </div>
          ) : (
            sortedCategories.map((cat, idx) => {
              const percentage = Math.round((cat.value / maxCategoryValue) * 100);
              const isBill = cat.name.startsWith('Bill:');
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isBill ? 'bg-teal-400' : 'bg-violet-400'}`} />
                      <span className="truncate max-w-[200px]">{cat.name}</span>
                    </span>
                    <span className="text-slate-300 font-bold tabular-nums">₹{cat.value.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-900/60 border border-slate-800/30 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ease-out ${isBill ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-violet-500 to-purple-400'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Payment Mode Distribution */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800/40">
        <h3 className="font-bold text-sm text-slate-300 mb-1 flex items-center gap-2">
          <PieChart size={15} className="text-emerald-400" />
          <span>Payment Channels</span>
        </h3>
        <p className="text-[10px] text-slate-600 mb-4">Where your money flows</p>

        <div className="space-y-3.5">
          {Object.keys(paymentModeTotals).length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-600">
              No paid records found this month.
            </div>
          ) : (
            Object.keys(paymentModeTotals).map((mode) => {
              const amount = paymentModeTotals[mode];
              const pct = ((amount / totalPaymentModes) * 100).toFixed(0);
              const colors = paymentModeColors[mode] || { bar: 'from-slate-500 to-slate-400', dot: 'bg-slate-500' };
              return (
                <div key={mode} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-400 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      {mode}
                    </span>
                    <span className="font-bold text-slate-300 tabular-nums">₹{amount.toLocaleString()} <span className="text-slate-600 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-900/60 border border-slate-800/30 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all duration-700 ease-out`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-slate-900/30 border border-slate-800/30 text-[10px] text-slate-500 flex items-center gap-1.5">
          🥇 Primary channel: <strong className="text-emerald-400">{topPaymentMode}</strong>
        </div>
      </div>
    </div>
  );
}
