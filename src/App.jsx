import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import BillList from './components/BillList';
import BillForm from './components/BillForm';
import { LayoutDashboard, ReceiptText, Wallet, Calendar, LogOut, Loader2 } from 'lucide-react';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, collection, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

function SignInPage({ onSignIn, loading }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500/30 selection:text-white relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl shadow-2xl relative border border-slate-800/80 animate-zoom-in text-center space-y-6">
        <div className="flex justify-center">
          <span className="text-5xl p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5">💸</span>
        </div>
        
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-500 bg-clip-text text-transparent font-heading">
            BillFlow
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Manage your budget, track bills, and analyze expenses securely in the cloud.
          </p>
        </div>

        <div className="border-t border-slate-800/60 my-6" />

        <button
          onClick={onSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-lg shadow-white/5 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
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
          Secure, cloud-synchronized personal finance tracking.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [budget, setBudget] = useState(2500);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Budget from Firestore
  useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.budget !== undefined) {
          setBudget(data.budget);
        }
      } else {
        // Initialize default budget in DB
        setDoc(userDocRef, { budget: 2500 }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Bills from Firestore
  useEffect(() => {
    if (!user) return;
    const billsColRef = collection(db, 'users', user.uid, 'bills');
    const unsubscribe = onSnapshot(billsColRef, (querySnapshot) => {
      const billsList = [];
      querySnapshot.forEach((doc) => {
        billsList.push({ id: doc.id, ...doc.data() });
      });
      setBills(billsList);
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

  // Add or edit a bill
  const handleFormSubmit = async (formData) => {
    if (!user) return;
    
    // Create reference to Firestore collection
    const billsColRef = collection(db, 'users', user.uid, 'bills');

    if (editingBill) {
      // Update existing
      const billDocRef = doc(db, 'users', user.uid, 'bills', formData.id.toString());
      await setDoc(billDocRef, {
        name: formData.name,
        amount: formData.amount,
        category: formData.category,
        dueDate: formData.dueDate,
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      }, { merge: true });
    } else {
      // Add new
      const newDocRef = doc(collection(db, 'users', user.uid, 'bills'));
      await setDoc(newDocRef, {
        name: formData.name,
        amount: formData.amount,
        category: formData.category,
        dueDate: formData.dueDate,
        status: formData.status,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes
      });
    }
    setEditingBill(null);
  };

  const handleToggleStatus = async (id) => {
    if (!user) return;
    const bill = bills.find(b => b.id === id);
    if (bill) {
      const billDocRef = doc(db, 'users', user.uid, 'bills', id.toString());
      await setDoc(billDocRef, { status: bill.status === 'Paid' ? 'Unpaid' : 'Paid' }, { merge: true });
    }
  };

  const handleEditInitiate = (bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to delete this record?')) {
      const billDocRef = doc(db, 'users', user.uid, 'bills', id.toString());
      await deleteDoc(billDocRef);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBill(null);
    setIsModalOpen(true);
  };

  const handleSetBudget = async (newBudget) => {
    setBudget(newBudget);
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { budget: newBudget }, { merge: true });
    }
  };

  // Find next upcoming bill
  const upcomingBills = bills
    .filter(b => b.status === 'Unpaid' && b.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  const nextBill = upcomingBills.length > 0 ? upcomingBills[0] : null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-100">
        <Loader2 className="animate-spin text-teal-400" size={40} />
        <span className="mt-4 text-sm text-slate-400">Loading your space...</span>
      </div>
    );
  }

  if (!user) {
    return <SignInPage onSignIn={handleSignIn} loading={authLoading} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-white">
      {/* Header bar */}
      <header className="glass-panel sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💸</span>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent font-heading">
              BillFlow
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Stat widget on desktop header */}
            {nextBill && (
              <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-800">
                <Calendar size={13} className="text-amber-400" />
                <span>Next: <strong className="text-slate-200">{nextBill.name}</strong> due {new Date(nextBill.dueDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
              </div>
            )}

            {/* User Profile and Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800/80">
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName} 
                  className="w-8 h-8 rounded-full border border-slate-700"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-slate-200 leading-none">{user.displayName}</span>
                <span className="text-[10px] text-slate-400">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-450 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="glass-panel p-4 rounded-2xl md:sticky md:top-24 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('bills')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all cursor-pointer ${
                activeTab === 'bills'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ReceiptText size={18} />
              <span>Bills & Payments</span>
              <span className="ml-auto text-xs bg-slate-800 text-slate-300 py-0.5 px-2 rounded-full font-bold">
                {bills.length}
              </span>
            </button>

            <div className="pt-4 mt-4 border-t border-slate-800/80">
              <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Preferences
              </div>
              <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-2"><Wallet size={12} /> Budget</span>
                <span className="font-bold text-slate-200">₹{budget}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Tab content viewports */}
        <section className="flex-1">
          {activeTab === 'dashboard' ? (
            <Dashboard 
              bills={bills} 
              budget={budget} 
              setBudget={handleSetBudget} 
              onOpenAddModal={handleOpenAddModal} 
            />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-white font-heading">
                    Bills & Payments
                  </h1>
                  <p className="text-slate-400 text-sm mt-0.5">
                    Filter, search, sort, and manage all your expense records.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="md:hidden flex items-center justify-center p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 cursor-pointer"
                >
                  <span className="text-xl leading-none">+</span>
                </button>
              </div>

              <BillList 
                bills={bills} 
                onToggleStatus={handleToggleStatus} 
                onEdit={handleEditInitiate} 
                onDelete={handleDelete} 
              />
            </div>
          )}
        </section>
      </main>

      {/* Bill creation / edit modal popup */}
      <BillForm 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingBill(null);
        }} 
        onSubmit={handleFormSubmit} 
        editingBill={editingBill} 
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BillFlow. Built with ReactJS & Tailwind CSS v4.</p>
        </div>
      </footer>
    </div>
  );
}
