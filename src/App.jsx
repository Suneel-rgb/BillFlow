import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import RidesTab from './components/RidesTab';
import ExpensesTab from './components/ExpensesTab';
import AnalyticsTab from './components/AnalyticsTab';
import RideFormModal from './components/RideFormModal';
import ExpenseFormModal from './components/ExpenseFormModal';

// Personal Mode Components
import PersonalDashboard from './components/PersonalDashboard';
import BillsTab from './components/BillsTab';
import PersonalExpensesTab from './components/PersonalExpensesTab';
import PersonalAnalyticsTab from './components/PersonalAnalyticsTab';
import BillFormModal from './components/BillFormModal';
import PersonalExpenseFormModal from './components/PersonalExpenseFormModal';

import { LayoutDashboard, ReceiptText, Fuel, BarChart3, LogOut, Loader2, AlertTriangle } from 'lucide-react';
import { auth, googleProvider, db, isConfigValid } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, collection, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

function SignInPage({ onSignIn, loading }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500/30 selection:text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-550/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative border border-slate-800/80 animate-zoom-in text-center space-y-6">
        <div className="flex justify-center">
          <span className="text-5xl p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-lg shadow-amber-500/5">🛺</span>
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-550 bg-clip-text text-transparent font-heading">
            RickshawFlow
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Track daily ride targets, calculate platform commissions, monitor CNG fuel expenses, and watch your margins grow.
          </p>
        </div>

        <div className="border-t border-slate-800/60 my-6" />

        <button
          onClick={onSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-lg shadow-white/5 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {loading ? (
            <Loader2 className="animate-spin text-slate-900" size={20} />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>Sign In with Google</span>
        </button>

        <p className="text-[11px] text-slate-500">
          Secure cloud-synchronized personal logs for Indian Auto Drivers.
        </p>
      </div>
    </div>
  );
}

function ConfigErrorPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500/30 selection:text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative border border-slate-800/80 animate-zoom-in text-center space-y-6">
        <div className="flex justify-center">
          <span className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-450 shadow-lg shadow-rose-500/5">
            <AlertTriangle size={40} className="text-rose-400" />
          </span>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
            Configuration Required
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Firebase environment variables are missing or incorrect in your deployment settings.
          </p>
        </div>

        <div className="text-left text-xs bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-slate-350">
          <p className="font-semibold text-rose-350">How to fix this:</p>
          <ol className="list-decimal pl-4 space-y-1.5 text-slate-405">
            <li>Ensure you have a `.env` file in the project root.</li>
            <li>Verify your keys contain:
              <code className="block mt-1 p-1 bg-slate-950 rounded text-slate-200 select-all font-mono text-[10px]">VITE_FIREBASE_API_KEY</code>
              <code className="block mt-1 p-1 bg-slate-950 rounded text-slate-200 select-all font-mono text-[10px]">VITE_FIREBASE_PROJECT_ID</code>
            </li>
            <li>Rebuild and reload the app dev server.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => {
    return !isConfigValid || !auth ? false : true;
  });
  
  // Custom Auto states
  const [rides, setRides] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dailyTarget, setDailyTarget] = useState(1500);

  // Personal Mode states
  const [appMode, setAppMode] = useState('rickshaw'); // 'rickshaw' or 'personal'
  const [personalBudget, setPersonalBudget] = useState(20000);
  const [bills, setBills] = useState([]);
  const [personalExpenses, setPersonalExpenses] = useState([]);

  // Modal Controls
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRideModalOpen, setIsRideModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isPersonalExpenseModalOpen, setIsPersonalExpenseModalOpen] = useState(false);

  const [editingRide, setEditingRide] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [editingPersonalExpense, setEditingPersonalExpense] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Listen to Auth State
  useEffect(() => {
    if (!isConfigValid || !auth) {
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Daily Target Settings from Firestore
  useEffect(() => {
    if (!isConfigValid || !db || !user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.dailyTarget !== undefined) {
          setDailyTarget(data.dailyTarget);
        }
        if (data.appMode !== undefined) {
          setAppMode(data.appMode);
        }
        if (data.personalBudget !== undefined) {
          setPersonalBudget(data.personalBudget);
        }
      } else {
        // Initialize default fields in DB
        setDoc(userDocRef, { dailyTarget: 1500, appMode: 'rickshaw', personalBudget: 20000 }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Rides from Firestore
  useEffect(() => {
    if (!isConfigValid || !db || !user) return;
    const ridesColRef = collection(db, 'users', user.uid, 'rides');
    const unsubscribe = onSnapshot(ridesColRef, (querySnapshot) => {
      const ridesList = [];
      querySnapshot.forEach((doc) => {
        ridesList.push({ id: doc.id, ...doc.data() });
      });
      setRides(ridesList);
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Expenses from Firestore
  useEffect(() => {
    if (!isConfigValid || !db || !user) return;
    const expensesColRef = collection(db, 'users', user.uid, 'expenses');
    const unsubscribe = onSnapshot(expensesColRef, (querySnapshot) => {
      const expensesList = [];
      querySnapshot.forEach((doc) => {
        expensesList.push({ id: doc.id, ...doc.data() });
      });
      setExpenses(expensesList);
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Personal Bills from Firestore
  useEffect(() => {
    if (!isConfigValid || !db || !user) return;
    const billsColRef = collection(db, 'users', user.uid, 'personal_bills');
    const unsubscribe = onSnapshot(billsColRef, (querySnapshot) => {
      const billsList = [];
      querySnapshot.forEach((doc) => {
        billsList.push({ id: doc.id, ...doc.data() });
      });
      setBills(billsList);
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Personal Expenses from Firestore
  useEffect(() => {
    if (!isConfigValid || !db || !user) return;
    const personalExpensesColRef = collection(db, 'users', user.uid, 'personal_expenses');
    const unsubscribe = onSnapshot(personalExpensesColRef, (querySnapshot) => {
      const personalExpensesList = [];
      querySnapshot.forEach((doc) => {
        personalExpensesList.push({ id: doc.id, ...doc.data() });
      });
      setPersonalExpenses(personalExpensesList);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSignIn = async () => {
    setAuthLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      alert('Failed to sign in. Please check your credentials/network.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 1. Submit Ride Logs (Add / Edit)
  const handleRideFormSubmit = async (formData) => {
    if (!user) return;
    
    try {
      const docId = formData.id.toString();
      const rideDocRef = doc(db, 'users', user.uid, 'rides', docId);
      await setDoc(rideDocRef, {
        platform: formData.platform,
        amount: formData.amount,
        commission: formData.commission,
        netAmount: formData.netAmount,
        paymentMode: formData.paymentMode,
        date: formData.date,
        distance: formData.distance,
        notes: formData.notes
      });
    } catch (err) {
      console.error("Database write error:", err);
      alert("Error saving ride: " + err.message);
    }
    setEditingRide(null);
  };

  // 2. High-speed Quick Ride Log Submission
  const handleQuickRideSubmit = async (platform, amount) => {
    if (!user) return;

    const commission = 0;
    const netAmount = amount;

    // Smart default payment mode
    let paymentMode = 'Cash';
    if (platform === 'Uber' || platform === 'Ola' || platform === 'Rapido') {
      paymentMode = 'Platform Wallet';
    } else if (platform === 'Namma Yatri') {
      paymentMode = 'UPI / Online';
    }

    try {
      const newDocRef = doc(collection(db, 'users', user.uid, 'rides'));
      await setDoc(newDocRef, {
        platform,
        amount,
        commission,
        netAmount,
        paymentMode,
        date: new Date().toISOString().split('T')[0],
        distance: null,
        notes: 'Quick log drop-off'
      });
    } catch (err) {
      console.error("Database write error:", err);
      alert("Error quick logging ride: " + err.message);
    }
  };

  // 3. Submit Expenses (Add / Edit)
  const handleExpenseFormSubmit = async (formData) => {
    if (!user) return;

    try {
      const docId = formData.id.toString();
      const expenseDocRef = doc(db, 'users', user.uid, 'expenses', docId);
      await setDoc(expenseDocRef, {
        amount: formData.amount,
        category: formData.category,
        date: formData.date,
        notes: formData.notes
      });
    } catch (err) {
      console.error("Database write error:", err);
      alert("Error saving expense: " + err.message);
    }
    setEditingExpense(null);
  };

  // 4. Submit Personal Bill (Add / Edit)
  const handleBillFormSubmit = async (formData) => {
    if (!user) return;
    try {
      const docId = formData.id.toString();
      const billDocRef = doc(db, 'users', user.uid, 'personal_bills', docId);
      await setDoc(billDocRef, {
        title: formData.title,
        amount: formData.amount,
        category: formData.category,
        dueDate: formData.dueDate,
        paymentMode: formData.paymentMode,
        status: formData.status
      });
    } catch (err) {
      console.error("Database write error:", err);
      alert("Error saving bill: " + err.message);
    }
    setEditingBill(null);
  };

  // 5. Submit Personal Expense (Add / Edit)
  const handlePersonalExpenseFormSubmit = async (formData) => {
    if (!user) return;
    try {
      const docId = formData.id.toString();
      const expenseDocRef = doc(db, 'users', user.uid, 'personal_expenses', docId);
      await setDoc(expenseDocRef, {
        amount: formData.amount,
        category: formData.category,
        date: formData.date,
        paymentMode: formData.paymentMode,
        notes: formData.notes
      });
    } catch (err) {
      console.error("Database write error:", err);
      alert("Error saving personal expense: " + err.message);
    }
    setEditingPersonalExpense(null);
  };

  // 6. Quick Bill Log
  const handleQuickBillSubmit = async (title, amount, category) => {
    if (!user) return;
    try {
      const newDocRef = doc(collection(db, 'users', user.uid, 'personal_bills'));
      await setDoc(newDocRef, {
        title,
        amount,
        category,
        dueDate: new Date().toISOString().split('T')[0],
        paymentMode: 'UPI / Online',
        status: 'Unpaid'
      });
    } catch (err) {
      console.error("Database write error:", err);
      alert("Error quick logging bill: " + err.message);
    }
  };

  // 7. Toggle Bill Paid/Unpaid Status directly from list
  const handleToggleBillStatus = async (id) => {
    if (!user) return;
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    try {
      const billDocRef = doc(db, 'users', user.uid, 'personal_bills', id.toString());
      await setDoc(billDocRef, {
        status: bill.status === 'Paid' ? 'Unpaid' : 'Paid'
      }, { merge: true });
    } catch (err) {
      console.error("Database update error:", err);
    }
  };

  // 8. Delete Bill
  const handleDeleteBill = async (id) => {
    if (!user) return;
    try {
      const billDocRef = doc(db, 'users', user.uid, 'personal_bills', id.toString());
      await deleteDoc(billDocRef);
    } catch (err) {
      console.error("Database delete error:", err);
      alert("Error deleting bill: " + err.message);
    }
  };

  // 9. Delete Personal Expense
  const handleDeletePersonalExpense = async (id) => {
    if (!user) return;
    try {
      const expenseDocRef = doc(db, 'users', user.uid, 'personal_expenses', id.toString());
      await deleteDoc(expenseDocRef);
    } catch (err) {
      console.error("Database delete error:", err);
      alert("Error deleting expense: " + err.message);
    }
  };

  // Initiators for forms
  const handleEditRideInitiate = (ride) => {
    setEditingRide(ride);
    setIsRideModalOpen(true);
  };

  const handleEditExpenseInitiate = (expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleEditBillInitiate = (bill) => {
    setEditingBill(bill);
    setIsBillModalOpen(true);
  };

  const handleEditPersonalExpenseInitiate = (expense) => {
    setEditingPersonalExpense(expense);
    setIsPersonalExpenseModalOpen(true);
  };

  // Deletions
  const handleDeleteRide = async (id) => {
    if (!user) return;
    try {
      const rideDocRef = doc(db, 'users', user.uid, 'rides', id.toString());
      await deleteDoc(rideDocRef);
    } catch (err) {
      console.error("Database delete error:", err);
      alert("Error deleting ride: " + err.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!user) return;
    try {
      const expenseDocRef = doc(db, 'users', user.uid, 'expenses', id.toString());
      await deleteDoc(expenseDocRef);
    } catch (err) {
      console.error("Database delete error:", err);
      alert("Error deleting expense: " + err.message);
    }
  };

  const handleDeleteRideInitiate = (id) => {
    const ride = rides.find(r => r.id === id);
    const label = ride ? `${ride.platform} ride (₹${ride.amount})` : 'this ride';
    setDeleteConfirm({ type: 'ride', id, label });
  };

  const handleDeleteExpenseInitiate = (id) => {
    const exp = expenses.find(e => e.id === id);
    const label = exp ? `${exp.category} (₹${exp.amount})` : 'this expense';
    setDeleteConfirm({ type: 'expense', id, label });
  };

  const handleDeleteBillInitiate = (id) => {
    const bill = bills.find(b => b.id === id);
    const label = bill ? `${bill.title} bill (₹${bill.amount})` : 'this bill';
    setDeleteConfirm({ type: 'personal_bill', id, label });
  };

  const handleDeletePersonalExpenseInitiate = (id) => {
    const exp = personalExpenses.find(e => e.id === id);
    const label = exp ? `${exp.category} spend (₹${exp.amount})` : 'this expense';
    setDeleteConfirm({ type: 'personal_expense', id, label });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    if (type === 'ride') {
      await handleDeleteRide(id);
    } else if (type === 'expense') {
      await handleDeleteExpense(id);
    } else if (type === 'personal_bill') {
      await handleDeleteBill(id);
    } else if (type === 'personal_expense') {
      await handleDeletePersonalExpense(id);
    }
    setDeleteConfirm(null);
  };

  // Update Personal Budget Settings
  const handleSetPersonalBudget = async (newBudget) => {
    setPersonalBudget(newBudget);
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { personalBudget: newBudget }, { merge: true });
      } catch (err) {
        console.error("Database update error:", err);
      }
    }
  };

  // Update Active App Mode
  const handleSetAppMode = async (mode) => {
    setAppMode(mode);
    setActiveTab('dashboard');
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { appMode: mode }, { merge: true });
      } catch (err) {
        console.error("Database update error:", err);
      }
    }
  };

  // Set daily target target
  const handleSetDailyTarget = async (newTarget) => {
    setDailyTarget(newTarget);
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, { dailyTarget: newTarget }, { merge: true });
      } catch (err) {
        console.error("Database update error:", err);
      }
    }
  };

  if (!isConfigValid) {
    return <ConfigErrorPage />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-100">
        <Loader2 className="animate-spin text-amber-400" size={40} />
        <span className="mt-4 text-sm text-slate-400 font-medium tracking-wide">Loading Captain Cabin...</span>
      </div>
    );
  }

  if (!user) {
    return <SignInPage onSignIn={handleSignIn} loading={authLoading} />;
  }

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-${appMode === 'rickshaw' ? 'amber-500' : 'emerald-500'}/30 selection:text-white theme-transition`}>
      {/* Header bar */}
      <header className="glass-panel sticky top-0 z-40 backdrop-blur-md border-b border-slate-900/50 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">{appMode === 'rickshaw' ? '🛺' : '💵'}</span>
            <span className={`text-xl font-black tracking-tight bg-gradient-to-r from-${appMode === 'rickshaw' ? 'amber-300 to-yellow-450' : 'emerald-300 to-teal-450'} bg-clip-text text-transparent font-heading theme-transition`}>
              {appMode === 'rickshaw' ? 'RickshawFlow' : 'Bill Tracker'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sliding Profile Switcher Button */}
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-[10px] sm:text-xs font-bold leading-none select-none">
              <button
                onClick={() => handleSetAppMode('rickshaw')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  appMode === 'rickshaw' 
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🛺</span>
                <span className="hidden md:inline">RickshawFlow</span>
              </button>
              <button
                onClick={() => handleSetAppMode('personal')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  appMode === 'personal' 
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 font-bold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>💵</span>
                <span className="hidden md:inline">Bill Tracker</span>
              </button>
            </div>

            {/* User Profile Info and Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800/80">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-8 h-8 rounded-full border border-slate-800"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-200 leading-none">{user.displayName}</span>
                <span className="text-[10px] text-slate-550 mt-0.5 block">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl text-slate-405 hover:text-rose-450 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="glass-panel p-4 rounded-3xl md:sticky md:top-24 space-y-1.5 border border-slate-800/60 shadow-lg shadow-black/20">
            {/* Tab 1: Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? `${appMode === 'rickshaw' ? 'bg-amber-500 shadow-amber-500/15' : 'bg-emerald-500 shadow-emerald-500/15'} text-slate-955 shadow-lg`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>

            {/* Tab 2: Rides / Bills log */}
            <button
              onClick={() => setActiveTab('rides')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'rides'
                  ? `${appMode === 'rickshaw' ? 'bg-amber-500 shadow-amber-500/15' : 'bg-emerald-500 shadow-emerald-500/15'} text-slate-955 shadow-lg`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ReceiptText size={16} />
              <span>{appMode === 'rickshaw' ? 'Rides Log' : 'Bills Log'}</span>
              <span className={`ml-auto text-[10px] py-0.5 px-2 rounded-full font-extrabold ${
                activeTab === 'rides' ? 'bg-slate-955/20 text-slate-950' : 'bg-slate-900 text-slate-400'
              }`}>
                {appMode === 'rickshaw' ? rides.length : bills.length}
              </span>
            </button>

            {/* Tab 3: Expenses */}
            <button
              onClick={() => setActiveTab('expenses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'expenses'
                  ? `${appMode === 'rickshaw' ? 'bg-amber-500 shadow-amber-500/15' : 'bg-emerald-500 shadow-emerald-500/15'} text-slate-955 shadow-lg`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Fuel size={16} />
              <span>{appMode === 'rickshaw' ? 'Expenses' : 'Spends Log'}</span>
              <span className={`ml-auto text-[10px] py-0.5 px-2 rounded-full font-extrabold ${
                activeTab === 'expenses' ? 'bg-slate-955/20 text-slate-950' : 'bg-slate-900 text-slate-400'
              }`}>
                {appMode === 'rickshaw' ? expenses.length : personalExpenses.length}
              </span>
            </button>

            {/* Tab 4: Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? `${appMode === 'rickshaw' ? 'bg-amber-500 shadow-amber-500/15' : 'bg-emerald-500 shadow-emerald-500/15'} text-slate-955 shadow-lg`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>

            {/* Settings Quick Summary */}
            <div className="pt-4 mt-4 border-t border-slate-900">
              <div className="px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>{appMode === 'rickshaw' ? 'Targets' : 'Goals'}</span>
              </div>
              <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2 font-medium">
                  {appMode === 'rickshaw' ? 'Daily Target' : 'Month Budget'}
                </span>
                <span className="font-extrabold text-slate-200">
                  ₹{appMode === 'rickshaw' ? dailyTarget : personalBudget}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Tab viewports */}
        <section className="flex-1 min-w-0">
          {appMode === 'rickshaw' ? (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard 
                  rides={rides} 
                  expenses={expenses} 
                  dailyTarget={dailyTarget} 
                  setDailyTarget={handleSetDailyTarget}
                  onQuickRideSubmit={handleQuickRideSubmit}
                  onOpenAddRideModal={() => {
                    setEditingRide(null);
                    setIsRideModalOpen(true);
                  }}
                  onOpenAddExpenseModal={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'rides' && (
                <RidesTab 
                  rides={rides} 
                  onAddRideClick={() => {
                    setEditingRide(null);
                    setIsRideModalOpen(true);
                  }}
                  onEdit={handleEditRideInitiate}
                  onDelete={handleDeleteRideInitiate}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesTab 
                  expenses={expenses} 
                  onAddExpenseClick={() => {
                    setEditingExpense(null);
                    setIsExpenseModalOpen(true);
                  }}
                  onEdit={handleEditExpenseInitiate}
                  onDelete={handleDeleteExpenseInitiate}
                />
              )}

              {activeTab === 'analytics' && (
                <AnalyticsTab 
                  rides={rides} 
                  expenses={expenses} 
                />
              )}
            </>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <PersonalDashboard 
                  bills={bills} 
                  personalExpenses={personalExpenses} 
                  personalBudget={personalBudget} 
                  setPersonalBudget={handleSetPersonalBudget}
                  onQuickBillSubmit={handleQuickBillSubmit}
                  onOpenAddBillModal={() => {
                    setEditingBill(null);
                    setIsBillModalOpen(true);
                  }}
                  onOpenAddExpenseModal={() => {
                    setEditingPersonalExpense(null);
                    setIsPersonalExpenseModalOpen(true);
                  }}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'rides' && (
                <BillsTab 
                  bills={bills} 
                  onAddBillClick={() => {
                    setEditingBill(null);
                    setIsBillModalOpen(true);
                  }}
                  onEdit={handleEditBillInitiate}
                  onDelete={handleDeleteBillInitiate}
                  onToggleStatus={handleToggleBillStatus}
                />
              )}

              {activeTab === 'expenses' && (
                <PersonalExpensesTab 
                  expenses={personalExpenses} 
                  onAddExpenseClick={() => {
                    setEditingPersonalExpense(null);
                    setIsPersonalExpenseModalOpen(true);
                  }}
                  onEdit={handleEditPersonalExpenseInitiate}
                  onDelete={handleDeletePersonalExpenseInitiate}
                />
              )}

              {activeTab === 'analytics' && (
                <PersonalAnalyticsTab 
                  bills={bills} 
                  personalExpenses={personalExpenses} 
                />
              )}
            </>
          )}
        </section>
      </main>

      {/* Ride Modal */}
      <RideFormModal 
        key={isRideModalOpen ? (editingRide ? `edit-${editingRide.id}` : 'new') : 'ride-modal-closed'}
        isOpen={isRideModalOpen} 
        onClose={() => {
          setIsRideModalOpen(false);
          setEditingRide(null);
        }}
        onSubmit={handleRideFormSubmit}
        editingRide={editingRide}
      />

      {/* Expense Modal */}
      <ExpenseFormModal 
        key={isExpenseModalOpen ? (editingExpense ? `edit-${editingExpense.id}` : 'new') : 'expense-modal-closed'}
        isOpen={isExpenseModalOpen} 
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleExpenseFormSubmit}
        editingExpense={editingExpense}
      />

      {/* Personal Bill Modal */}
      <BillFormModal 
        key={isBillModalOpen ? (editingBill ? `edit-${editingBill.id}` : 'new') : 'bill-modal-closed'}
        isOpen={isBillModalOpen}
        onClose={() => {
          setIsBillModalOpen(false);
          setEditingBill(null);
        }}
        onSubmit={handleBillFormSubmit}
        editingBill={editingBill}
      />

      {/* Personal Expense Modal */}
      <PersonalExpenseFormModal 
        key={isPersonalExpenseModalOpen ? (editingPersonalExpense ? `edit-${editingPersonalExpense.id}` : 'new') : 'personal-expense-modal-closed'}
        isOpen={isPersonalExpenseModalOpen}
        onClose={() => {
          setIsPersonalExpenseModalOpen(false);
          setEditingPersonalExpense(null);
        }}
        onSubmit={handlePersonalExpenseFormSubmit}
        editingExpense={editingPersonalExpense}
      />

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative glass-panel w-full max-w-md rounded-3xl shadow-2xl p-6 overflow-hidden animate-zoom-in border border-rose-500/20">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-red-500 to-rose-600" />
            <div className="text-center space-y-4 pt-2">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-455">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-heading">Delete Record?</h3>
                <p className="text-xs text-slate-405 mt-1">
                  Are you sure you want to permanently delete <strong>{deleteConfirm.label}</strong>? This action cannot be undone and will update your database immediately.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-4 border-t border-slate-900/60 mt-5">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-450 text-white text-xs font-bold shadow-lg shadow-rose-500/10 transition-all cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RickshawFlow. Built with React & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}
