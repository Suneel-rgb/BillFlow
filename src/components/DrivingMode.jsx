import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mic, MicOff, X, Check, Volume2, VolumeX, LogOut, Sparkles, Navigation } from 'lucide-react';

export default function DrivingMode({
  appMode,
  onAddRide,
  onAddExpense,
  onAddPersonalExpense,
  onAddPersonalBill,
  onClose,
  soundEnabled,
  triggerHaptic,
  showToast,
  playChime
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pendingEntry, setPendingEntry] = useState(null);
  const [speechError, setSpeechError] = useState('');
  
  const recognitionRef = useRef(null);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setPendingEntry(null);
      setSpeechError('');
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          setSpeechError('Web Speech API is not supported in this browser.');
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Optimized for Indian English speakers

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('');
          setSpeechError('');
          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(30); // light haptic start
          }
        };

        recognition.onresult = (event) => {
          const result = event.results[0][0].transcript;
          setTranscript(result);
          setIsListening(false);
          handleParsedSpeech(result);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          if (event.error === 'no-speech') {
            setSpeechError("No speech detected. Tap button to try again.");
          } else if (event.error === 'not-allowed') {
            setSpeechError("Microphone blocked. Web Speech API requires HTTPS (or localhost) and microphone permissions enabled in browser settings.");
          } else if (event.error === 'network') {
            setSpeechError("Network error. Active internet connection is required for Web Speech recognition.");
          } else {
            setSpeechError(`Error: ${event.error}. Tap to retry.`);
          }
          if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([40, 40]); // error haptic
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.error('Failed to start speech recognition', e);
        setSpeechError(`Failed to start microphone: ${e.message}`);
      }
    }
  };

  // Parsing algorithms for voice recognition
  const handleParsedSpeech = (spokenText) => {
    const normalized = spokenText.toLowerCase().trim();
    
    // Find amount
    let amount = null;
    const digitMatches = normalized.match(/\b\d+\b/);
    if (digitMatches) {
      amount = parseFloat(digitMatches[0]);
    } else {
      // Basic word-to-number fallback for common words
      const numberWords = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
        'hundred': 100, 'thousand': 1000
      };
      
      const words = normalized.split(/\s+/);
      let tempAmount = 0;
      words.forEach((w) => {
        if (numberWords[w]) {
          if (w === 'hundred' && tempAmount > 0) {
            tempAmount *= 100;
          } else if (w === 'thousand' && tempAmount > 0) {
            tempAmount *= 1000;
          } else {
            tempAmount += numberWords[w];
          }
        }
      });
      if (tempAmount > 0) amount = tempAmount;
    }

    if (!amount || isNaN(amount)) {
      setSpeechError(`Parsed "${spokenText}", but couldn't find a valid amount. Speak e.g., "Add 150 rupees".`);
      return;
    }

    if (appMode === 'rickshaw') {
      const isExpense = /fuel|cng|gas|petrol|diesel|repair|maintenance|mechanic|puncture|service|food|tea|chai|coffee|lunch|breakfast|dinner|fine|challan|police|ticket|rent|emi|loan/.test(normalized);
      
      if (isExpense) {
        let category = 'Others';
        let categoryName = 'Other Expense';
        
        if (/fuel|cng|gas|petrol|diesel/.test(normalized)) {
          category = 'CNG/Fuel';
          categoryName = 'CNG / Fuel';
        } else if (/repair|maintenance|mechanic|puncture|service/.test(normalized)) {
          category = 'Maintenance';
          categoryName = 'Repairs / Service';
        } else if (/rent|emi|loan/.test(normalized)) {
          category = 'Rent/EMI';
          categoryName = 'Rent / EMI';
        } else if (/food|tea|chai|coffee|lunch|breakfast|dinner/.test(normalized)) {
          category = 'Food/Tea';
          categoryName = 'Food / Chai';
        } else if (/fine|challan|police|ticket/.test(normalized)) {
          category = 'Fines';
          categoryName = 'Challan Fine';
        }
        
        setPendingEntry({
          type: 'expense',
          amount,
          category,
          categoryName,
          notes: spokenText,
          date: new Date().toISOString().split('T')[0],
          id: Date.now().toString()
        });
      } else {
        let platform = 'Local';
        if (/uber/.test(normalized)) platform = 'Uber';
        else if (/ola/.test(normalized)) platform = 'Ola';
        else if (/rapido/.test(normalized)) platform = 'Rapido';
        else if (/namma yatri|yatri/.test(normalized)) platform = 'Namma Yatri';
        
        setPendingEntry({
          type: 'ride',
          platform,
          amount,
          commission: 0,
          netAmount: amount,
          paymentMode: (platform === 'Local') ? 'Cash' : 'UPI / Online',
          notes: spokenText,
          date: new Date().toISOString().split('T')[0],
          id: Date.now().toString()
        });
      }
    } else {
      // appMode === 'personal'
      const isBill = /electricity|power|bescom|water|broadband|internet|wifi|rent|recharge|phone|mobile/.test(normalized);
      
      if (isBill) {
        let title = 'Bill';
        let category = 'Others';
        
        if (/electricity|power|bescom/.test(normalized)) {
          title = 'Electricity Bill';
          category = 'Electricity';
        } else if (/water/.test(normalized)) {
          title = 'Water Bill';
          category = 'Water';
        } else if (/broadband|internet|wifi/.test(normalized)) {
          title = 'Broadband Bill';
          category = 'Broadband';
        } else if (/rent/.test(normalized)) {
          title = 'Rent';
          category = 'Rent';
        } else if (/recharge|mobile|phone/.test(normalized)) {
          title = 'Mobile Recharge';
          category = 'Mobile Recharge';
        }
        
        setPendingEntry({
          type: 'personal_bill',
          title,
          amount,
          category,
          dueDate: new Date().toISOString().split('T')[0],
          paymentMode: 'UPI / Online',
          status: 'Unpaid',
          frequency: 'Monthly',
          id: Date.now().toString()
        });
      } else {
        let category = 'Others';
        
        if (/food|restaurant|swiggy|zomato|dinner|lunch|breakfast|tea|chai|coffee/.test(normalized)) {
          category = 'Food';
        } else if (/shopping|grocery|groceries|clothes|mall/.test(normalized)) {
          category = 'Shopping';
        } else if (/fuel|petrol|diesel|cng|cab|uber|ola|auto|transport|bus|train/.test(normalized)) {
          category = 'Transport';
        } else if (/movie|show|game|fun|party|entertainment/.test(normalized)) {
          category = 'Entertainment';
        }
        
        setPendingEntry({
          type: 'personal_expense',
          amount,
          category,
          paymentMode: 'UPI / Online',
          notes: spokenText,
          date: new Date().toISOString().split('T')[0],
          id: Date.now().toString()
        });
      }
    }

    // Vibration feedback on successful parse
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([15, 15]);
    }
  };

  const handleConfirm = () => {
    if (!pendingEntry) return;

    // Trigger Browser Vibration API for success (tactile physical confirmation)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate([30, 50, 30]);
    }

    const { type } = pendingEntry;

    if (type === 'ride') {
      onAddRide(pendingEntry.platform, pendingEntry.amount);
    } else if (type === 'expense') {
      onAddExpense({
        amount: pendingEntry.amount,
        category: pendingEntry.category,
        notes: pendingEntry.notes,
        date: pendingEntry.date,
        id: pendingEntry.id
      });
      playChime(soundEnabled, 'success');
      showToast(`Expense logged: ₹${pendingEntry.amount} for ${pendingEntry.categoryName}! 💸`, 'success');
    } else if (type === 'personal_expense') {
      onAddPersonalExpense({
        amount: pendingEntry.amount,
        category: pendingEntry.category,
        notes: pendingEntry.notes,
        date: pendingEntry.date,
        paymentMode: pendingEntry.paymentMode,
        id: pendingEntry.id
      });
      playChime(soundEnabled, 'success');
      showToast(`Spend logged: ₹${pendingEntry.amount} for ${pendingEntry.category}! 🛍️`, 'success');
    } else if (type === 'personal_bill') {
      onAddPersonalBill(pendingEntry.title, pendingEntry.amount, pendingEntry.category);
    }

    setPendingEntry(null);
    setTranscript('');
  };

  const handleCancel = () => {
    // Trigger Browser Vibration API for cancel/discard (single medium vibration)
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(60);
    }

    playChime(soundEnabled, 'delete');
    showToast('Entry discarded.', 'info');
    setPendingEntry(null);
    setTranscript('');
  };

  // Drag coordinates for Framer Motion gestures
  const x = useMotionValue(0);
  
  // Transform drag distance to screen background transitions for high clarity
  // Drag right (confirm) -> turns green, Drag left (cancel) -> turns red
  const dragBackground = useTransform(
    x,
    [-180, 0, 180],
    ['#310d13', '#000000', '#062818'] // ultra dark red, solid black, ultra dark green
  );

  const confirmIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);
  const cancelIndicatorOpacity = useTransform(x, [-100, 0], [1, 0]);

  const themeAccentColor = appMode === 'rickshaw' ? 'text-amber-400' : 'text-emerald-400';
  const themeAccentBorder = appMode === 'rickshaw' ? 'border-amber-500/20' : 'border-emerald-500/20';
  const themeGlowShadow = appMode === 'rickshaw' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)';

  return (
    <motion.div 
      style={{ backgroundColor: pendingEntry ? dragBackground : '#000000' }}
      className="fixed inset-0 z-50 flex flex-col justify-between p-4 overflow-y-auto text-white font-sans transition-colors duration-200 scrollbar-none"
    >
      {/* Top Header Row (Contrast Level check: Black/White = AAA) */}
      <div className="flex items-center justify-between w-full h-16 border-b border-slate-900 px-2 flex-shrink-0 relative z-10">
        <div className="flex items-center gap-2.5">
          <Navigation className={`${themeAccentColor} animate-pulse`} size={24} />
          <span className="text-lg font-black tracking-tight text-white font-heading">
            DRIVING MODE
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 text-[10px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full text-slate-300">
            {appMode === 'rickshaw' ? '🛺 Captain' : '💵 Finance'}
          </div>
          
          <button
            onClick={onClose}
            className="flex items-center justify-center p-3 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 cursor-pointer transition-all active:scale-95"
            style={{ minHeight: '48px', minWidth: '48px' }}
            title="Exit Driving Mode"
          >
            <LogOut size={20} className="text-rose-455" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Optimized with overflow-y-auto for smaller screen viewports */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full py-4 overflow-y-auto scrollbar-none min-h-[50vh] z-10">
        
        {/* Swipe instruction layer overlayed when dragging */}
        <AnimatePresence>
          {pendingEntry && (
            <>
              {/* Drag Right indicator */}
              <motion.div 
                style={{ opacity: confirmIndicatorOpacity }}
                className="absolute inset-y-0 right-0 w-1/3 bg-emerald-500/10 border-l border-emerald-500/30 flex flex-col justify-center items-center pointer-events-none"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center mb-2 shadow-2xl">
                  <Check size={36} strokeWidth={3} />
                </div>
                <span className="text-emerald-400 text-sm font-black tracking-widest">CONFIRM</span>
              </motion.div>

              {/* Drag Left indicator */}
              <motion.div 
                style={{ opacity: cancelIndicatorOpacity }}
                className="absolute inset-y-0 left-0 w-1/3 bg-rose-500/10 border-r border-rose-500/30 flex flex-col justify-center items-center pointer-events-none"
              >
                <div className="w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center mb-2 shadow-2xl">
                  <X size={36} strokeWidth={3} />
                </div>
                <span className="text-rose-400 text-sm font-black tracking-widest">CANCEL</span>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!pendingEntry ? (
            /* STATE 1: Tap to Speak button mode */
            <motion.div
              key="speech-terminal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center justify-center gap-6 py-2"
            >
              <div className="text-center px-4 max-w-sm">
                <h2 className="text-lg font-bold text-slate-400 leading-tight uppercase tracking-wider">
                  Voice Logging Active
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-normal">
                  Tap below and state your entry clearly. We'll automatically identify the amount and type.
                </p>
              </div>

              {/* Responsive Pulsating Button taking up substantial screen space */}
              <div className="relative flex items-center justify-center h-[35vh] w-full max-w-xs">
                
                {/* Pulsating background rings */}
                {isListening && (
                  <>
                    <div className={`absolute inset-0 rounded-full bg-red-650/10 border border-red-500/20 animate-ping`} />
                    <div className={`absolute -inset-4 rounded-full bg-red-650/5 border border-red-500/10 animate-pulse duration-1000`} />
                  </>
                )}

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full flex flex-col items-center justify-center gap-4 border-8 cursor-pointer transition-all duration-300 shadow-2xl relative z-10 ${
                    isListening
                      ? 'bg-red-600 border-red-500/30 text-white animate-pulse'
                      : appMode === 'rickshaw'
                      ? 'bg-amber-400 hover:bg-amber-300 border-amber-500/20 text-slate-950 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-500/20 text-slate-950 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                  style={{ 
                    boxShadow: isListening 
                      ? '0 0 50px rgba(239, 68, 68, 0.4)' 
                      : `0 0 40px ${themeGlowShadow}`
                  }}
                >
                  <div className="p-4 rounded-full bg-black/5">
                    {isListening ? (
                      <div className="flex items-center gap-1.5 h-10 px-1">
                        <span className="w-1.5 h-6 bg-white rounded animate-bounce delay-100" />
                        <span className="w-1.5 h-10 bg-white rounded animate-bounce delay-200" />
                        <span className="w-1.5 h-8 bg-white rounded animate-bounce delay-300" />
                        <span className="w-1.5 h-4 bg-white rounded animate-bounce delay-400" />
                        <span className="w-1.5 h-9 bg-white rounded animate-bounce delay-500" />
                      </div>
                    ) : (
                      <Mic size={48} strokeWidth={2.5} />
                    )}
                  </div>
                  <span className="text-xs font-black tracking-widest uppercase">
                    {isListening ? 'LISTENING NOW' : 'TAP TO SPEAK'}
                  </span>
                </button>
              </div>

              {/* Status / Errors */}
              <div className="text-center min-h-[48px] px-6 max-w-md">
                {speechError ? (
                  <p className="text-xs text-rose-400 font-bold border border-rose-500/20 bg-rose-500/5 px-4 py-2 rounded-xl">
                    ⚠️ {speechError}
                  </p>
                ) : isListening ? (
                  <p className={`text-sm ${appMode === 'rickshaw' ? 'text-amber-300' : 'text-emerald-300'} font-bold tracking-widest animate-pulse uppercase`}>
                    Speak now...
                  </p>
                ) : (
                  /* Contextual suggest helpers for Rickshaw vs Personal Mode */
                  appMode === 'rickshaw' ? (
                    <div className="text-left bg-slate-955/60 border border-slate-900 p-3 rounded-2xl flex flex-col gap-1 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300 block mb-0.5">💬 Try saying:</span>
                      <span>• "Add 120 rupees for Ola Auto"</span>
                      <span>• "Log 450 rupees CNG fuel"</span>
                      <span>• "Tea cup expense 40 rupees"</span>
                    </div>
                  ) : (
                    <div className="text-left bg-slate-955/60 border border-slate-900 p-3 rounded-2xl flex flex-col gap-1 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300 block mb-0.5">💬 Try saying:</span>
                      <span>• "Add 1200 rupees electricity bill"</span>
                      <span>• "Log 500 rupees groceries"</span>
                      <span>• "Rent payment 15000 rupees"</span>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          ) : (
            /* STATE 2: Pending swipe verification mode (height responsive) */
            <motion.div
              key="pending-terminal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full flex flex-col items-center justify-center py-2"
            >
              <span className={`text-[10px] font-extrabold ${themeAccentColor} uppercase tracking-[0.2em] mb-2`}>
                Verify Entry (Swipe Left/Right)
              </span>

              {/* Draggable Card - Reduced min-height and spacing on mobile */}
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                style={{ x }}
                onDragEnd={(event, info) => {
                  const threshold = 140;
                  if (info.offset.x > threshold) {
                    handleConfirm();
                  } else if (info.offset.x < -threshold) {
                    handleCancel();
                  }
                }}
                className="w-full max-w-sm bg-slate-955 border-4 border-slate-800 rounded-3xl p-4 md:p-6 text-center select-none shadow-2xl flex flex-col justify-between min-h-[35vh] md:min-h-[42vh] cursor-grab active:cursor-grabbing relative overflow-hidden"
              >
                {/* Visual swipe guidelines */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-slate-800 to-emerald-500" />
                
                {/* Icon Category Identifier */}
                <div className="mt-2 flex justify-center">
                  <span className="text-4xl p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-md">
                    {pendingEntry.type === 'ride' ? (
                      pendingEntry.platform === 'Uber' ? '⚫' :
                      pendingEntry.platform === 'Ola' ? '🟢' :
                      pendingEntry.platform === 'Rapido' ? '🟡' :
                      pendingEntry.platform === 'Namma Yatri' ? '🟠' : '🛺'
                    ) : pendingEntry.type === 'personal_bill' ? (
                      pendingEntry.category === 'Electricity' ? '⚡' :
                      pendingEntry.category === 'Water' ? '💧' :
                      pendingEntry.category === 'Broadband' ? '🌐' :
                      pendingEntry.category === 'Rent' ? '🏠' :
                      pendingEntry.category === 'Mobile Recharge' ? '📱' : '💵'
                    ) : (
                      pendingEntry.category === 'CNG/Fuel' ? '⛽' :
                      pendingEntry.category === 'Maintenance' ? '🔧' :
                      pendingEntry.category === 'Food/Tea' ? '☕' :
                      pendingEntry.category === 'Fines' ? '🚨' :
                      pendingEntry.category === 'Rent/EMI' ? '🏦' :
                      pendingEntry.category === 'Food' ? '🍔' :
                      pendingEntry.category === 'Shopping' ? '🛍️' :
                      pendingEntry.category === 'Transport' ? '🚗' :
                      pendingEntry.category === 'Entertainment' ? '🎬' : '💸'
                    )}
                  </span>
                </div>

                {/* Massive Typography: text-6xl / text-7xl for monetary value (AAA Compliance) */}
                <div className="my-4">
                  <span className="text-[10px] font-bold text-slate-450 block uppercase tracking-widest">
                    {pendingEntry.type === 'ride' ? `${pendingEntry.platform} Ride` : 
                     pendingEntry.type === 'personal_bill' ? `${pendingEntry.title} (${pendingEntry.category})` : 
                     pendingEntry.categoryName || pendingEntry.category}
                  </span>
                  <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-white mt-1">
                    ₹{pendingEntry.amount}
                  </h1>
                </div>

                <div className="bg-slate-900/40 border border-slate-900 p-2.5 rounded-2xl text-[11px] text-slate-400 font-medium italic select-none">
                  "{pendingEntry.notes || 'Voice log details'}"
                </div>
                
                <div className="mt-3 text-[9px] text-slate-500 font-bold tracking-widest uppercase animate-pulse">
                  ← Swipe Left to Cancel | Swipe Right to Confirm →
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Massive Touch Targets Bottom Actions (min height 96px, full width) */}
      <div className="w-full flex flex-col gap-3.5 pt-4 border-t border-slate-950 flex-shrink-0 relative z-10">
        <AnimatePresence>
          {pendingEntry && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="flex flex-col gap-3 w-full"
            >
              {/* Massive Confirm Button: 96px min height, full-width, AAA Contrast */}
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full h-24 min-h-[96px] bg-emerald-500 text-black font-black text-2xl tracking-wider rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-emerald-400 active:scale-98 cursor-pointer shadow-lg shadow-emerald-500/10 border-4 border-emerald-400/25"
              >
                <Check size={28} strokeWidth={3} />
                <span>CONFIRM (SWIPE RIGHT)</span>
              </button>

              {/* Massive Cancel Button: 96px min height, full-width, AAA Contrast */}
              <button
                type="button"
                onClick={handleCancel}
                className="w-full h-24 min-h-[96px] bg-rose-600 text-white font-black text-2xl tracking-wider rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-rose-500 active:scale-98 cursor-pointer shadow-lg shadow-rose-600/10 border-4 border-rose-500/25"
              >
                <X size={28} strokeWidth={3} />
                <span>DISCARD (SWIPE LEFT)</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informative voice log indicator (Contextual title) */}
        {!pendingEntry && (
          <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">
            {appMode === 'rickshaw' ? '🛺 RickshawFlow Voice Assist Terminal 🛺' : '💵 BillTracker Voice Assist Terminal 💵'}
          </div>
        )}
      </div>
    </motion.div>
  );
}
