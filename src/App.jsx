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

import DrivingMode from './components/DrivingMode';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ReceiptText, Fuel, BarChart3, LogOut, Loader2, AlertTriangle, Volume2, VolumeX, CheckCircle, XCircle, Info, Plus, Mic, Car, X } from 'lucide-react';
import { auth, googleProvider, db, isConfigValid } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, collection, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

function playChime(soundEnabled, type = 'success') {
  if (!soundEnabled) return;
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (type === 'success') {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(880.00, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.35);
      osc1.start();
      osc2.start();
      setTimeout(() => {
        try {
          const osc3 = audioCtx.createOscillator();
          const gainNode2 = audioCtx.createGain();
          osc3.connect(gainNode2);
          gainNode2.connect(audioCtx.destination);
          osc3.type = 'sine';
          osc3.frequency.setValueAtTime(1174.66, audioCtx.currentTime);
          gainNode2.gain.setValueAtTime(0.1, audioCtx.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.45);
          osc3.start();
          osc3.stop(audioCtx.currentTime + 0.5);
        } catch (e) {}
      }, 70);
      osc1.stop(audioCtx.currentTime + 0.4);
      osc2.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'delete') {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(165, audioCtx.currentTime + 0.25);
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.005, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn("Audio Context blocked or unsupported:", e);
  }
}

function triggerHaptic(type = 'light') {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    try {
      if (type === 'light') window.navigator.vibrate(12);
      else if (type === 'medium') window.navigator.vibrate(30);
      else if (type === 'heavy') window.navigator.vibrate(60);
      else if (type === 'success') window.navigator.vibrate([15, 30, 15]);
      else if (type === 'warning') window.navigator.vibrate([40, 40, 40]);
    } catch (e) {}
  }
}

function SignInPage({ onSignIn, loading }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500/30 selection:text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="mesh-glow-bg opacity-40"></div>

      <div className="w-full max-w-2xl flex flex-col items-center gap-8 relative z-10">
        {/* Brand Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-xs font-bold text-slate-400">
            <span>✨</span>
            <span>Version 2.0 Fully Responsive Redesign</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-450 bg-clip-text text-transparent font-heading">
            RickshawFlow
          </h1>
          <p className="text-slate-400 max-w-md mx-auto text-sm sm:text-base font-medium">
            The ultimate companion for Indian Auto Captains and personal bill management.
          </p>
        </div>

        {/* Double Feature Preview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {/* Card 1: Rickshaw mode */}
          <div className="glass-card p-6 rounded-2xl border border-amber-500/10 flex flex-col justify-between text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🛺</span>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Captain Mode</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-100">Driver Dashboard</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log detailed passenger fares, track daily target goals, input vehicle mileage/odometer stats, and calculate fuel CNG cost ratios.
              </p>
            </div>
          </div>

          {/* Card 2: Personal mode */}
          <div className="glass-card p-6 rounded-2xl border border-emerald-500/10 flex flex-col justify-between text-left space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl">💵</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Finance Mode</span>
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-100">Personal Bill Tracker</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage utility bills (electricity, water, broadband), configure monthly budgets, and keep track of daily household spends.
              </p>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="w-full max-w-sm glass-panel p-6 rounded-3xl text-center space-y-4 border border-slate-800/80 shadow-2xl">
          <button
            onClick={onSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 hover:scale-[1.01] active:scale-[0.99] font-bold shadow-xl shadow-white/5 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
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
            <span className="text-sm text-slate-900">Sign In with Google Account</span>
          </button>
          
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            <span>🛡️</span>
            <span>Secure Cloud-Synchronized Ledger</span>
          </div>
        </div>
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

  const [toast, setToast] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('rickshawflow_sound_enabled') !== 'false';
  });

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const newVal = !prev;
      localStorage.setItem('rickshawflow_sound_enabled', newVal.toString());
      return newVal;
    });
    const nextVal = localStorage.getItem('rickshawflow_sound_enabled') !== 'false';
    showToast(nextVal ? 'Chime sounds enabled 🔊' : 'Chime sounds muted 🔇', 'info');
  };
  
  // Custom Auto states
  const [rides, setRides] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dailyTarget, setDailyTarget] = useState(1500);

  // Personal Mode states
  const [appMode, setAppMode] = useState('rickshaw'); // 'rickshaw' or 'personal'
  const [personalBudget, setPersonalBudget] = useState(20000);
  const [bills, setBills] = useState([]);
  const [personalExpenses, setPersonalExpenses] = useState([]);
  const [dailyMilestones, setDailyMilestones] = useState([]);

  // Modal Controls & FAB Controls
  const [activeTab, setActiveTabState] = useState('dashboard');
  const [fabOpen, setFabOpen] = useState(false);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    triggerHaptic('light');
  };

  const tabsOrder = ['dashboard', 'rides', 'expenses', 'analytics'];
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const handleTouchStart = (e) => {
    if (activeTab === 'driving') return; // Disable app-wide swipe navigation in driving mode
    if (window.innerWidth >= 768) return;
    const isScroller = e.target.closest('.overflow-x-auto') || e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea') || e.target.closest('.no-swipe') || e.target.closest('.swipe-container');
    if (isScroller) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (touchStart === null) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 85;
    const isRightSwipe = distance < -85;

    const currentIndex = tabsOrder.indexOf(activeTab);
    if (isLeftSwipe && currentIndex < tabsOrder.length - 1) {
      setActiveTab(tabsOrder[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      setActiveTab(tabsOrder[currentIndex - 1]);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const [menuOpen, setMenuOpen] = useState(false);
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

  // Sync Daily Milestones from Firestore
  useEffect(() => {
    if (!isConfigValid || !db || !user) return;
    const milestonesColRef = collection(db, 'users', user.uid, 'daily_milestones');
    const unsubscribe = onSnapshot(milestonesColRef, (querySnapshot) => {
      const milestonesList = [];
      querySnapshot.forEach((doc) => {
        milestonesList.push({ id: doc.id, ...doc.data() });
      });
      setDailyMilestones(milestonesList);
    });
    return () => unsubscribe();
  }, [user]);

  // Save Daily Milestone (Odometer readings)
  const handleSaveDailyMilestone = async (date, startOdo, endOdo) => {
    if (!user) return;
    try {
      const docId = date.toString();
      const milestoneDocRef = doc(db, 'users', user.uid, 'daily_milestones', docId);
      await setDoc(milestoneDocRef, {
        date,
        startOdo: startOdo !== '' ? parseFloat(startOdo) : null,
        endOdo: endOdo !== '' ? parseFloat(endOdo) : null
      });
      playChime(soundEnabled, 'success');
      triggerHaptic('success');
      showToast("Daily odometer readings saved! 🛺", 'success');
    } catch (err) {
      console.error("Database write error:", err);
      showToast("Error saving odometer: " + err.message, "error");
    }
  };

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
        notes: formData.notes,
        createdAt: editingRide?.createdAt || Date.now()
      });
      playChime(soundEnabled, 'success');
      triggerHaptic('success');
      showToast(editingRide ? 'Ride details updated successfully! 🛺' : 'Ride fare logged successfully! 🛺', 'success');
    } catch (err) {
      console.error("Database write error:", err);
      showToast("Error saving ride: " + err.message, "error");
    }
    setEditingRide(null);
  };

  // 2. High-speed Quick Ride Log Submission
  const handleQuickRideSubmit = async (platform, amount) => {
    if (!user) return;

    const commission = 0;
    const netAmount = amount;

    let paymentMode = 'Cash';
    if (platform === 'Uber' || platform === 'Ola' || platform === 'Rapido') {
      paymentMode = 'UPI / Online';
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
        notes: 'Quick log drop-off',
        createdAt: Date.now()
      });
      playChime(soundEnabled, 'success');
      triggerHaptic('success');
      showToast(`Quick logged ₹${amount} for ${platform}! 🛺`, 'success');
    } catch (err) {
      console.error("Database write error:", err);
      showToast("Error quick logging ride: " + err.message, "error");
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
      playChime(soundEnabled, 'success');
      triggerHaptic('success');
      showToast(editingExpense ? 'Auto expense details saved! 💸' : 'Auto expense logged! 💸', 'success');
    } catch (err) {
      console.error("Database write error:", err);
      showToast("Error saving expense: " + err.message, "error");
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
        status: formData.status,
        frequency: formData.frequency || 'Monthly'
      });
      playChime(soundEnabled, 'success');
      triggerHaptic('success');
      showToast(editingBill ? 'Utility bill updated! 💵' : 'New utility bill logged! 💵', 'success');
    } catch (err) {
      console.error("Database write error:", err);
      showToast("Error saving bill: " + err.message, "error");
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
      playChime(soundEnabled, 'success');
      triggerHaptic('success');
      showToast(editingPersonalExpense ? 'Spend details updated! 💸' : 'Personal spend logged! 💸', 'success');
    } catch (err) {
      console.error("Database write error:", err);
      showToast("Error saving personal expense: " + err.message, "error");
    }
    setEditingPersonalExpense(null);
  };

  // 6. Quick Bill Log
  const handleQuickBillSubmit = async (title, amount, category, frequency = 'Monthly') => {
    if (!user) return;
    try {
      const newDocRef = doc(collection(db, 'users', user.uid, 'personal_bills'));
      await setDoc(newDocRef, {
        title,
        amount,
        category,
        dueDate: new Date().toISOString().split('T')[0],
        paymentMode: 'UPI / Online',
        status: 'Unpaid',
        frequency
      });
      playChime(soundEnabled, 'success');
      triggerHaptic('success');
      showToast(`Quick logged bill: ${title} (₹${amount})! 💵`, 'success');
    } catch (err) {
      console.error("Database write error:", err);
      showToast("Error quick logging bill: " + err.message, "error");
    }
  };

  // 7. Toggle Bill Paid/Unpaid Status directly from list
  const handleToggleBillStatus = async (id) => {
    if (!user) return;
    const bill = bills.find(b => b.id === id);
    if (!bill) return;
    try {
      const billDocRef = doc(db, 'users', user.uid, 'personal_bills', id.toString());
      const newStatus = bill.status === 'Paid' ? 'Unpaid' : 'Paid';
      await setDoc(billDocRef, {
        status: newStatus
      }, { merge: true });
      playChime(soundEnabled, 'success');
      triggerHaptic('success');
      showToast(`Bill marked as ${newStatus === 'Paid' ? 'Paid (Cleared! 🎉)' : 'Unpaid ❌'}`, 'success');
    } catch (err) {
      console.error("Database update error:", err);
      showToast("Error updating bill status: " + err.message, "error");
    }
  };

  // 8. Delete Bill
  const handleDeleteBill = async (id) => {
    if (!user) return;
    const billDocRef = doc(db, 'users', user.uid, 'personal_bills', id.toString());
    await deleteDoc(billDocRef);
  };

  // 9. Delete Personal Expense
  const handleDeletePersonalExpense = async (id) => {
    if (!user) return;
    const expenseDocRef = doc(db, 'users', user.uid, 'personal_expenses', id.toString());
    await deleteDoc(expenseDocRef);
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
    const rideDocRef = doc(db, 'users', user.uid, 'rides', id.toString());
    await deleteDoc(rideDocRef);
  };

  const handleDeleteExpense = async (id) => {
    if (!user) return;
    const expenseDocRef = doc(db, 'users', user.uid, 'expenses', id.toString());
    await deleteDoc(expenseDocRef);
  };

  const handleDeleteRideInitiate = (id) => {
    const ride = rides.find(r => r.id === id);
    const label = ride ? `${ride.platform} ride (₹${ride.amount})` : 'this ride';
    setDeleteConfirm({ type: 'ride', id, label });
    triggerHaptic('warning');
  };

  const handleDeleteExpenseInitiate = (id) => {
    const exp = expenses.find(e => e.id === id);
    const label = exp ? `${exp.category} (₹${exp.amount})` : 'this expense';
    setDeleteConfirm({ type: 'expense', id, label });
    triggerHaptic('warning');
  };

  const handleDeleteBillInitiate = (id) => {
    const bill = bills.find(b => b.id === id);
    const label = bill ? `${bill.title} bill (₹${bill.amount})` : 'this bill';
    setDeleteConfirm({ type: 'personal_bill', id, label });
    triggerHaptic('warning');
  };

  const handleDeletePersonalExpenseInitiate = (id) => {
    const exp = personalExpenses.find(e => e.id === id);
    const label = exp ? `${exp.category} spend (₹${exp.amount})` : 'this expense';
    setDeleteConfirm({ type: 'personal_expense', id, label });
    triggerHaptic('warning');
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { type, id } = deleteConfirm;
    try {
      if (type === 'ride') {
        await handleDeleteRide(id);
      } else if (type === 'expense') {
        await handleDeleteExpense(id);
      } else if (type === 'personal_bill') {
        await handleDeleteBill(id);
      } else if (type === 'personal_expense') {
        await handleDeletePersonalExpense(id);
      }
      playChime(soundEnabled, 'delete');
      triggerHaptic('heavy');
      showToast(`${deleteConfirm.label} deleted successfully.`, 'info');
    } catch (err) {
      console.error("Delete error:", err);
      showToast("Error deleting: " + err.message, "error");
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
    triggerHaptic('medium');
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
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`app-mode-${appMode} min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-${appMode === 'rickshaw' ? 'amber-500' : 'emerald-500'}/30 selection:text-white theme-transition relative`}
    >
      {/* Dynamic Background Mesh Gradient */}
      <div className="mesh-glow-bg"></div>

      {/* Header bar */}
      <header className="glass-panel sticky top-0 z-40 backdrop-blur-md border-b border-slate-900/40 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">{appMode === 'rickshaw' ? '🛺' : '💵'}</span>
            <span className={`text-xl font-black tracking-tight bg-gradient-to-r from-${appMode === 'rickshaw' ? 'amber-300 to-yellow-400' : 'emerald-300 to-teal-400'} bg-clip-text text-transparent font-heading theme-transition`}>
              {appMode === 'rickshaw' ? 'RickshawFlow' : 'Bill Tracker'}
            </span>
          </div>

          {/* Desktop header menu (hidden on mobile to prevent overflow) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Sliding Mode Switcher Pill */}
            <div className="flex bg-slate-955/80 p-1 rounded-2xl border border-slate-900 text-[10px] sm:text-xs font-bold leading-none select-none relative">
              <button
                onClick={() => handleSetAppMode('rickshaw')}
                className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-300 cursor-pointer z-10 ${
                  appMode === 'rickshaw' 
                    ? 'bg-amber-500 text-slate-955 shadow-lg shadow-amber-500/10 font-black scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🛺</span>
                <span className="hidden sm:inline">Captain Auto</span>
                <span className="inline sm:hidden">Auto</span>
              </button>
              <button
                onClick={() => handleSetAppMode('personal')}
                className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl transition-all duration-300 cursor-pointer z-10 ${
                  appMode === 'personal' 
                    ? 'bg-emerald-500 text-slate-955 shadow-lg shadow-emerald-500/10 font-black scale-[1.02]' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>💵</span>
                <span className="hidden sm:inline">Bill Tracker</span>
                <span className="inline sm:hidden">Personal</span>
              </button>
            </div>

            {/* User Profile Info and Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-900">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-8 h-8 rounded-full border border-slate-800 shadow-md shadow-black/20"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-200 leading-none">{user.displayName}</span>
                <span className="text-[9px] text-slate-500 mt-0.5 block">{user.email}</span>
              </div>
              <button
                onClick={toggleSound}
                className={`p-2.5 rounded-xl transition-all border border-transparent cursor-pointer ${
                  soundEnabled 
                    ? 'text-amber-400 hover:text-amber-350 hover:bg-amber-500/10 hover:border-amber-500/20' 
                    : 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/50 hover:border-slate-800'
                }`}
                title={soundEnabled ? "Mute chimes" : "Enable chimes"}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <button
                onClick={handleSignOut}
                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>

          {/* Mobile Hamburger toggle button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => {
                setMenuOpen(!menuOpen);
                triggerHaptic('light');
              }}
              className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all active:scale-95 flex items-center justify-center"
              style={{ minHeight: '40px', minWidth: '40px' }}
              title="Toggle Menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in Drawer Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Drawer Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setMenuOpen(false);
                triggerHaptic('light');
              }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden"
            />
            
            {/* Drawer Menu Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 max-w-xs bg-slate-950 border-l border-slate-900 shadow-2xl p-6 flex flex-col justify-between md:hidden"
            >
              <div className="space-y-6">
                {/* Drawer Close Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-900">
                  <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                    Navigation Menu
                  </span>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      triggerHaptic('light');
                    }}
                    className="p-2 rounded-xl hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer border border-transparent hover:border-slate-800 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Account Details */}
                <div className="flex items-center gap-3 p-3 bg-slate-900/40 border border-slate-900 rounded-2xl">
                  {user.photoURL && (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName} 
                      className="w-10 h-10 rounded-full border border-slate-800 shadow-md shadow-black/20"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="text-left min-w-0">
                    <span className="block text-xs font-black text-slate-200 leading-none truncate">{user.displayName}</span>
                    <span className="text-[10px] text-slate-500 mt-1 block truncate">{user.email}</span>
                  </div>
                </div>

                {/* Switcher Pill */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Dashboard Mode
                  </span>
                  <div className="flex flex-col gap-2 w-full bg-slate-900/60 p-1.5 rounded-2xl border border-slate-900">
                    <button
                      onClick={() => {
                        handleSetAppMode('rickshaw');
                        setMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 w-full text-xs font-black cursor-pointer ${
                        appMode === 'rickshaw' 
                          ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <span>🛺</span>
                      <span>Captain Auto</span>
                    </button>
                    <button
                      onClick={() => {
                        handleSetAppMode('personal');
                        setMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 w-full text-xs font-black cursor-pointer ${
                        appMode === 'personal' 
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/10' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                      }`}
                    >
                      <span>💵</span>
                      <span>Personal Spends</span>
                    </button>
                  </div>
                </div>

                {/* Driving Mode Shortcut button */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Quick Tools
                  </span>
                  <button
                    onClick={() => {
                      setActiveTab('driving');
                      setMenuOpen(false);
                    }}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl transition-all w-full text-xs font-black cursor-pointer border ${
                      appMode === 'rickshaw'
                        ? 'border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/15'
                        : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15'
                    }`}
                  >
                    <Mic size={15} />
                    <span>Start Driving Mode</span>
                  </button>
                </div>
              </div>

              {/* Drawer footer options */}
              <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-900">
                <button
                  onClick={() => {
                    toggleSound();
                    setMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black cursor-pointer border transition-all ${
                    soundEnabled 
                      ? 'border-amber-500/20 text-amber-400 bg-amber-500/5 hover:bg-amber-500/15' 
                      : 'border-slate-850 text-slate-400 hover:text-slate-200 bg-slate-900/20 hover:bg-slate-900/50'
                  }`}
                >
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  <span>{soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}</span>
                </button>

                <button
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-rose-455 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/15 hover:border-rose-500/30 text-xs font-black cursor-pointer transition-all"
                >
                  <LogOut size={15} />
                  <span>Sign Out Account</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 md:py-8 flex flex-col md:flex-row gap-8 relative z-10">
        
        {/* Navigation Sidebar */}
        <aside className="hidden md:block w-full md:w-64 flex-shrink-0">
          <div className="glass-panel p-4 rounded-3xl md:sticky md:top-24 space-y-1.5 shadow-xl border border-slate-900/50">
            {/* Tab 1: Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'dashboard'
                  ? `${appMode === 'rickshaw' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-500/15' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/15'} text-slate-955 shadow-lg scale-[1.02] border border-white/5`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </button>

            {/* Tab 2: Rides / Bills log */}
            <button
              onClick={() => setActiveTab('rides')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'rides'
                  ? `${appMode === 'rickshaw' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-500/15' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/15'} text-slate-955 shadow-lg scale-[1.02] border border-white/5`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <ReceiptText size={16} />
              <span>{appMode === 'rickshaw' ? 'Rides History' : 'Utility Bills'}</span>
              <span className={`ml-auto text-[10px] py-0.5 px-2.5 rounded-full font-extrabold transition-colors ${
                activeTab === 'rides' ? 'bg-slate-950/20 text-slate-955' : 'bg-slate-950 text-slate-400 border border-slate-900'
              }`}>
                {appMode === 'rickshaw' ? rides.length : bills.length}
              </span>
            </button>

            {/* Tab 3: Expenses */}
            <button
              onClick={() => setActiveTab('expenses')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'expenses'
                  ? `${appMode === 'rickshaw' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-500/15' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/15'} text-slate-955 shadow-lg scale-[1.02] border border-white/5`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <Fuel size={16} />
              <span>{appMode === 'rickshaw' ? 'Expenses Log' : 'Personal Spends'}</span>
              <span className={`ml-auto text-[10px] py-0.5 px-2.5 rounded-full font-extrabold transition-colors ${
                activeTab === 'expenses' ? 'bg-slate-955/20 text-slate-955' : 'bg-slate-950 text-slate-400 border border-slate-900'
              }`}>
                {appMode === 'rickshaw' ? expenses.length : personalExpenses.length}
              </span>
            </button>

            {/* Tab 4: Analytics */}
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'analytics'
                  ? `${appMode === 'rickshaw' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-500/15' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/15'} text-slate-955 shadow-lg scale-[1.02] border border-white/5`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>

            {/* Tab 5: Driving Mode */}
            <button
              onClick={() => setActiveTab('driving')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeTab === 'driving'
                  ? `${appMode === 'rickshaw' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-amber-500/15' : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/15'} text-slate-955 shadow-lg scale-[1.02] border border-white/5`
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <Mic size={16} />
              <span>Driving Mode</span>
            </button>

            {/* Settings Quick Summary */}
            <div className="pt-4 mt-4 border-t border-slate-900">
              <div className="px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>{appMode === 'rickshaw' ? 'Daily Goal' : 'Budget Goal'}</span>
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
                  dailyMilestones={dailyMilestones}
                  onSaveDailyMilestone={handleSaveDailyMilestone}
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
      </main>      {/* Mobile Bottom Navigation Bar */}
      <nav className={`md:hidden fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 bg-slate-950/80 backdrop-blur-2xl border border-slate-900 shadow-2xl rounded-3xl flex justify-around items-center py-3 px-3 theme-transition`}>
        {/* Tab 1: Dashboard */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-1 px-1 sm:px-3 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'dashboard'
              ? `${appMode === 'rickshaw' ? 'text-amber-400 scale-105 font-bold' : 'text-emerald-400 scale-105 font-bold'}`
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Dashboard</span>
          {activeTab === 'dashboard' && (
            <span className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${appMode === 'rickshaw' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          )}
        </button>

        {/* Tab 2: Rides / Bills */}
        <button
          onClick={() => setActiveTab('rides')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-1 px-1 sm:px-3 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'rides'
              ? `${appMode === 'rickshaw' ? 'text-amber-400 scale-105 font-bold' : 'text-emerald-400 scale-105 font-bold'}`
              : 'text-slate-500 hover:text-slate-400'
          }`}
        >
          <div className="relative">
            <ReceiptText size={20} />
            {(appMode === 'rickshaw' ? rides.length : bills.length) > 0 && (
              <span className={`absolute -top-2 -right-3 text-[8px] font-black py-0.5 px-1.5 rounded-full ${
                activeTab === 'rides'
                  ? `${appMode === 'rickshaw' ? 'bg-amber-500 text-slate-955' : 'bg-emerald-500 text-slate-955'}`
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {appMode === 'rickshaw' ? rides.length : bills.length}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold tracking-wider uppercase">
            {appMode === 'rickshaw' ? 'Rides' : 'Bills'}
          </span>
          {activeTab === 'rides' && (
            <span className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${appMode === 'rickshaw' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          )}
        </button>

        {/* Tab 3: Expenses / Spends */}
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-1 px-1 sm:px-3 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'expenses'
              ? `${appMode === 'rickshaw' ? 'text-amber-400 scale-105 font-bold' : 'text-emerald-400 scale-105 font-bold'}`
              : 'text-slate-550 hover:text-slate-400'
          }`}
        >
          <div className="relative">
            <Fuel size={20} />
            {(appMode === 'rickshaw' ? expenses.length : personalExpenses.length) > 0 && (
              <span className={`absolute -top-2 -right-3 text-[8px] font-black py-0.5 px-1.5 rounded-full ${
                activeTab === 'expenses'
                  ? `${appMode === 'rickshaw' ? 'bg-amber-500 text-slate-955' : 'bg-emerald-500 text-slate-955'}`
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}>
                {appMode === 'rickshaw' ? expenses.length : personalExpenses.length}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold tracking-wider uppercase">
            {appMode === 'rickshaw' ? 'Expenses' : 'Spends'}
          </span>
          {activeTab === 'expenses' && (
            <span className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${appMode === 'rickshaw' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          )}
        </button>

        {/* Tab 4: Analytics */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-1 px-1 sm:px-3 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'analytics'
              ? `${appMode === 'rickshaw' ? 'text-amber-400 scale-105 font-bold' : 'text-emerald-400 scale-105 font-bold'}`
              : 'text-slate-550 hover:text-slate-400'
          }`}
        >
          <BarChart3 size={20} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Analytics</span>
          {activeTab === 'analytics' && (
            <span className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${appMode === 'rickshaw' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          )}
        </button>

        {/* Tab 5: Driving Mode */}
        <button
          onClick={() => setActiveTab('driving')}
          className={`flex-1 flex flex-col items-center gap-1.5 py-1 px-1 sm:px-3 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'driving'
              ? `${appMode === 'rickshaw' ? 'text-amber-400 scale-105 font-bold' : 'text-emerald-400 scale-105 font-bold'}`
              : 'text-slate-555 hover:text-slate-400'
          }`}
        >
          <Mic size={20} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Driving</span>
          {activeTab === 'driving' && (
            <span className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${appMode === 'rickshaw' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          )}
        </button>
      </nav>
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

      {/* Mobile Floating Action Button (FAB) Speed-dial */}
      <div className="md:hidden fixed bottom-24 right-4 z-40 flex flex-col items-end gap-2.5">
        {fabOpen && (
          <>
            {/* Speed-dial backdrop overlay */}
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 animate-fade-in"
              onClick={() => {
                setFabOpen(false);
                triggerHaptic('light');
              }}
            />
            
            {/* Speed dial list items */}
            <div className="flex flex-col items-end gap-2.5 z-40">
              {appMode === 'rickshaw' ? (
                <>
                  <button
                    onClick={() => {
                      setEditingRide(null);
                      setIsRideModalOpen(true);
                      setFabOpen(false);
                      triggerHaptic('medium');
                    }}
                    className="fab-speed-dial-item flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-xs font-bold rounded-xl shadow-lg border border-amber-600/30"
                  >
                    <span>Detailed Ride</span>
                    <span>🛺</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingExpense(null);
                      setIsExpenseModalOpen(true);
                      setFabOpen(false);
                      triggerHaptic('medium');
                    }}
                    className="fab-speed-dial-item flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 text-rose-400 text-xs font-bold rounded-xl shadow-lg"
                  >
                    <span>Log Expense</span>
                    <span>💸</span>
                  </button>
                  <button
                    onClick={() => {
                      setFabOpen(false);
                      setActiveTab('dashboard');
                      triggerHaptic('light');
                      setTimeout(() => {
                        const quickInput = document.querySelector('input[placeholder*="fare amount"]');
                        if (quickInput) {
                          quickInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          quickInput.focus();
                        }
                      }, 150);
                    }}
                    className="fab-speed-dial-item flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 text-amber-400 text-xs font-bold rounded-xl shadow-lg"
                  >
                    <span>Quick Fare</span>
                    <span>⚡</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setEditingBill(null);
                      setIsBillModalOpen(true);
                      setFabOpen(false);
                      triggerHaptic('medium');
                    }}
                    className="fab-speed-dial-item flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-650 text-slate-950 text-xs font-bold rounded-xl shadow-lg border border-emerald-600/30"
                  >
                    <span>Log Utility Bill</span>
                    <span>💵</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingPersonalExpense(null);
                      setIsPersonalExpenseModalOpen(true);
                      setFabOpen(false);
                      triggerHaptic('medium');
                    }}
                    className="fab-speed-dial-item flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold rounded-xl shadow-lg"
                  >
                    <span>Log Spend</span>
                    <span>🛍️</span>
                  </button>
                  <button
                    onClick={() => {
                      setFabOpen(false);
                      setActiveTab('dashboard');
                      triggerHaptic('light');
                      setTimeout(() => {
                        const quickInput = document.querySelector('input[placeholder*="BESCOM"]');
                        if (quickInput) {
                          quickInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          quickInput.focus();
                        }
                      }, 150);
                    }}
                    className="fab-speed-dial-item flex items-center gap-2 px-4 py-3 bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-bold rounded-xl shadow-lg"
                  >
                    <span>Quick Bill</span>
                    <span>⚡</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
        
        {/* Main Floating Trigger Action Button */}
        <button
          onClick={() => {
            setFabOpen(!fabOpen);
            triggerHaptic('medium');
          }}
          className={`z-40 p-4 rounded-full text-slate-950 shadow-2xl flex items-center justify-center transition-all duration-300 ${
            appMode === 'rickshaw' 
              ? 'bg-amber-500 hover:bg-amber-400 hover:shadow-amber-500/20' 
              : 'bg-emerald-500 hover:bg-emerald-400 hover:shadow-emerald-500/20'
          } ${fabOpen ? 'rotate-45 scale-95' : 'hover:scale-105 active:scale-95'}`}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Immersive Driving Mode Overlay */}
      {activeTab === 'driving' && (
        <DrivingMode
          appMode={appMode}
          onAddRide={handleQuickRideSubmit}
          onAddExpense={handleExpenseFormSubmit}
          onAddPersonalExpense={handlePersonalExpenseFormSubmit}
          onAddPersonalBill={handleQuickBillSubmit}
          onClose={() => setActiveTab('dashboard')}
          soundEnabled={soundEnabled}
          triggerHaptic={triggerHaptic}
          showToast={showToast}
          playChime={playChime}
        />
      )}

      {/* Floating Toast Notification Box */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-0 left-0 md:left-auto md:right-6 flex justify-center md:justify-end z-50 px-4 animate-toast-in pointer-events-none">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md text-xs font-bold text-slate-105 pointer-events-auto ${
            toast.type === 'success' 
              ? 'bg-emerald-950/90 border-emerald-500/35 shadow-emerald-500/5' 
              : toast.type === 'error'
              ? 'bg-rose-955/90 border-rose-500/35 shadow-rose-500/5'
              : 'bg-slate-900/90 border-slate-700/40 shadow-black/20'
          }`}>
            <span>
              {toast.type === 'success' && <CheckCircle size={15} className="text-emerald-400" />}
              {toast.type === 'error' && <XCircle size={15} className="text-rose-450" />}
              {toast.type === 'info' && <Info size={15} className="text-amber-400" />}
            </span>
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)} 
              className="ml-2 hover:text-white text-slate-400 p-0.5 rounded cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
