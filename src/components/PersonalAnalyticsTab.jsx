// Analytics Tab for Personal Mode

export default function PersonalAnalyticsTab({ bills, personalExpenses }) {
  // Current Month String
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  // Filter this month's items
  const thisMonthBills = bills.filter(b => b.dueDate && b.dueDate.startsWith(currentMonthStr));
  const thisMonthExpenses = personalExpenses.filter(e => e.date && e.date.startsWith(currentMonthStr));

  // Totals calculations
  const totalBillsThisMonth = thisMonthBills.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const paidBillsThisMonth = thisMonthBills.filter(b => b.status === 'Paid').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const unpaidBillsThisMonth = thisMonthBills.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + parseFloat(b.amount || 0), 0);
  const totalExpensesThisMonth = thisMonthExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const totalMonthlySpending = paidBillsThisMonth + totalExpensesThisMonth;

  // Category Breakdown (combines paid bills and personal expenses)
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

  // CSV Exporter for personal logs
  const handleExportCSV = () => {
    // 1. Headers
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Title/Category,Amount (INR),Date/Due Date,Payment Mode,Status/Notes,Frequency\n";

    // 2. Add Bills
    bills.forEach(b => {
      const escapedTitle = (b.title || "").replace(/,/g, " ");
      const freq = b.frequency || "Monthly";
      csvContent += `Bill,${escapedTitle},${b.amount},${b.dueDate},${b.paymentMode},${b.status},${freq}\n`;
    });

    // 3. Add Expenses
    personalExpenses.forEach(e => {
      const escapedNotes = (e.notes || "").replace(/,/g, " ");
      csvContent += `Expense,${e.category},${e.amount},${e.date},${e.paymentMode},${escapedNotes},One-time\n`;
    });

    // 4. Download Trigger
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `personal_ledger_${currentMonthStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-emerald-100">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
            Personal Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Understand your monthly household bills and personal outlays.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 border border-emerald-500/20 text-emerald-450 hover:bg-slate-850 hover:text-emerald-350 transition-all font-bold cursor-pointer"
        >
          <span>Export Personal CSV</span>
        </button>
      </div>

      {/* Analytics Summary Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/10">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block font-heading">Monthly Outgoings</span>
          <span className="text-2xl font-black text-slate-100 mt-2 block">₹{totalMonthlySpending.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Paid Bills: ₹{paidBillsThisMonth.toLocaleString()} | Spends: ₹{totalExpensesThisMonth.toLocaleString()}</span>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-rose-450 uppercase tracking-wider block font-heading">Pending Bills Payments</span>
          <span className="text-2xl font-black text-rose-400 mt-2 block">₹{unpaidBillsThisMonth.toLocaleString()}</span>
          <span className="text-[9px] text-slate-500 block mt-0.5">Logged: ₹{totalBillsThisMonth.toLocaleString()} total bills this month</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Category Split progress bars */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 md:col-span-8 space-y-5">
          <div>
            <h3 className="font-bold text-base text-slate-200">Category Spending Split</h3>
            <p className="text-xs text-slate-400 mt-0.5">Highest outlays across bills and personal categories this month.</p>
          </div>

          <div className="space-y-4">
            {sortedCategories.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
                Log bills or personal outlays to view category split details.
              </div>
            ) : (
              sortedCategories.map((cat, idx) => {
                const percentage = Math.round((cat.value / maxCategoryValue) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{cat.name}</span>
                      <span className="text-slate-100">₹{cat.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-900/60 h-2.5 rounded-full overflow-hidden border border-slate-850">
                      <div 
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment mode split */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 md:col-span-4 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-200">Payment Allocations</h3>
            <p className="text-xs text-slate-400 mt-0.5">Where your money goes by payment channels.</p>
          </div>

          <div className="space-y-4 my-4">
            {Object.keys(paymentModeTotals).length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No payment mode allocations to display.
              </div>
            ) : (
              Object.keys(paymentModeTotals).map((mode) => {
                const amount = paymentModeTotals[mode];
                return (
                  <div key={mode} className="flex justify-between items-center text-xs">
                    <span className="font-medium text-slate-450">{mode}</span>
                    <span className="font-bold text-slate-200">₹{amount.toLocaleString()}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-4 border-t border-slate-900 text-center">
            <span className="text-[10px] font-semibold text-emerald-400 flex items-center justify-center gap-1.5 bg-emerald-500/5 py-2 rounded-xl border border-emerald-500/10">
              🥇 Most active mode: <strong className="text-slate-100">UPI / Online</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
