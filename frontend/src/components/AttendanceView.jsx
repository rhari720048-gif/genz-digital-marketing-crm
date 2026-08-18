import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  Navigation, 
  LogIn, 
  LogOut, 
  AlertCircle, 
  Calendar, 
  UserCheck, 
  ArrowRight,
  Send,
  Building,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  User,
  X,
  Car,
  Check,
  Layers,
  History,
  FileText,
  Lock,
  ChevronDown
} from 'lucide-react';

export default function AttendanceView({ user, userAttendanceLogs = [], onUpdateUserAttendance, onToggleCheckIn }) {
  // Current status: 'not_checked_in' | 'in_office' | 'outside' | 'day_completed'
  const [status, setStatus] = useState(() => {
    if (user?.hasCheckedOutToday) return 'day_completed';
    return user?.isCheckedIn ? 'in_office' : 'not_checked_in';
  });

  const [checkInTime, setCheckInTime] = useState(user?.checkInTime || null);
  const [checkOutTime, setCheckOutTime] = useState(user?.checkOutTime || null);
  
  // Real-time calculation timestamps
  const [checkInEpoch, setCheckInEpoch] = useState(() => {
    if (user?.checkInEpoch) return user.checkInEpoch;
    if (user?.isCheckedIn) return Date.now();
    return null;
  });
  const [officeOutEpoch, setOfficeOutEpoch] = useState(null);
  const [accumulatedOutsideMs, setAccumulatedOutsideMs] = useState(0);

  // Live timer tick trigger
  const [nowMs, setNowMs] = useState(Date.now());

  // Office Out Modal Inputs
  const [isOfficeOutModalOpen, setIsOfficeOutModalOpen] = useState(false);
  const [outTimeInput, setOutTimeInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [purposeInput, setPurposeInput] = useState('');

  const [activeOutVisit, setActiveOutVisit] = useState(null);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [checkOutNotesInput, setCheckOutNotesInput] = useState('');

  // Date-wise Grouped Activity History Array (Initialized clean from user attendance logs)
  const [activityHistoryByDate, setActivityHistoryByDate] = useState(() => {
    return Array.isArray(userAttendanceLogs) ? userAttendanceLogs : [];
  });

  useEffect(() => {
    if (Array.isArray(userAttendanceLogs)) {
      setActivityHistoryByDate(userAttendanceLogs);
    }
  }, [userAttendanceLogs]);

  // Live timer interval effect
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync state with header check-in status & localStorage state
  useEffect(() => {
    if (user?.hasCheckedOutToday) {
      setStatus('day_completed');
      if (user.checkOutTime) setCheckOutTime(user.checkOutTime);
      if (user.checkInTime) setCheckInTime(user.checkInTime);
    } else if (user?.isCheckedIn) {
      setStatus('in_office');
      if (user.checkInTime) setCheckInTime(user.checkInTime);
      if (user.checkInEpoch) setCheckInEpoch(user.checkInEpoch);
    } else {
      setStatus('not_checked_in');
    }
  }, [user?.isCheckedIn, user?.hasCheckedOutToday, user?.checkInTime, user?.checkOutTime, user?.checkInEpoch]);

  // Sync back to central state
  const syncToParent = (updatedHistory, userStatusUpdate = {}) => {
    setActivityHistoryByDate(updatedHistory);
    if (onUpdateUserAttendance) {
      onUpdateUserAttendance(updatedHistory, userStatusUpdate);
    }
  };

  // Get current date label
  const getTodayDateLabel = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    return `Today • ${dateStr}`;
  };

  const getTodayKey = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to add log to today's active date group
  const addLogToToday = (logEntry, statusUpdate = {}) => {
    const todayKey = getTodayKey();
    const todayLabel = getTodayDateLabel();

    let updatedGroups = [];
    const existingTodayIndex = activityHistoryByDate.findIndex(g => g.dateKey === todayKey && !g.isClosed);

    if (existingTodayIndex !== -1) {
      updatedGroups = [...activityHistoryByDate];
      updatedGroups[existingTodayIndex] = {
        ...updatedGroups[existingTodayIndex],
        logs: [logEntry, ...updatedGroups[existingTodayIndex].logs]
      };
    } else {
      const newTodayGroup = {
        dateKey: todayKey,
        dateLabel: todayLabel,
        isClosed: false,
        logs: [logEntry]
      };
      updatedGroups = [newTodayGroup, ...activityHistoryByDate];
    }

    syncToParent(updatedGroups, statusUpdate);
  };

  // Helper to close today's group upon Check Out
  const closeTodayGroup = (statusUpdate = {}) => {
    const todayKey = getTodayKey();
    const updatedGroups = activityHistoryByDate.map(g => {
      if (g.dateKey === todayKey) {
        return { ...g, isClosed: true };
      }
      return g;
    });
    syncToParent(updatedGroups, statusUpdate);
  };

  const handleCheckInEvent = (customTime) => {
    const nowStr = customTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setCheckInTime(nowStr);
    setCheckInEpoch(Date.now());
    setStatus('in_office');

    if (!user?.isCheckedIn && onToggleCheckIn) {
      onToggleCheckIn();
    }

    const newLog = {
      id: Date.now(),
      time: nowStr,
      action: 'Office Check In',
      location: 'GENZ Office',
      purpose: 'Morning Shift Check In',
      duration: '-',
      status: 'Completed'
    };

    addLogToToday(newLog, {
      isCheckedIn: true,
      hasCheckedOutToday: false,
      checkInTime: nowStr,
      currentAttendanceStatus: 'In Office'
    });
  };

  // Open Office Out Modal
  const handleOpenOfficeOutModal = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setOutTimeInput(nowStr);
    setLocationInput('');
    setPurposeInput('');
    setIsOfficeOutModalOpen(true);
  };

  // Submit Office Out Form
  const handleConfirmOfficeOut = (e) => {
    e.preventDefault();
    const timeToRecord = outTimeInput || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentEpoch = Date.now();

    setOfficeOutEpoch(currentEpoch);
    setActiveOutVisit({
      outTime: timeToRecord,
      location: locationInput,
      purpose: purposeInput,
      startEpoch: currentEpoch
    });

    setStatus('outside');
    setIsOfficeOutModalOpen(false);

    const newLog = {
      id: Date.now(),
      time: timeToRecord,
      action: 'Office Out',
      location: locationInput || 'Field Location',
      purpose: purposeInput || 'Client Visit',
      duration: 'In Progress',
      status: 'Active Field'
    };

    addLogToToday(newLog, {
      currentAttendanceStatus: `Office Out: ${locationInput || 'Field Visit'}`
    });
  };

  // Back to Office
  const handleReturnToOffice = () => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const currentEpoch = Date.now();
    
    // Calculate field visit duration
    const visitMs = officeOutEpoch ? (currentEpoch - officeOutEpoch) : 0;
    const totalSec = Math.floor(visitMs / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const formattedVisitDuration = `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;

    setAccumulatedOutsideMs(prev => prev + visitMs);
    setOfficeOutEpoch(null);
    setStatus('in_office');

    const todayKey = getTodayKey();
    const updatedHistory = activityHistoryByDate.map(g => {
      if (g.dateKey === todayKey) {
        return {
          ...g,
          logs: g.logs.map(l => l.status === 'Active Field' ? { ...l, duration: formattedVisitDuration, status: 'Completed' } : l)
        };
      }
      return g;
    });

    const newLog = {
      id: Date.now(),
      time: nowStr,
      action: 'Back to Office',
      location: 'GENZ Office',
      purpose: `Returned from ${activeOutVisit?.location || 'Field Visit'} (${formattedVisitDuration})`,
      duration: '-',
      status: 'Completed'
    };

    const existingTodayIndex = updatedHistory.findIndex(g => g.dateKey === todayKey && !g.isClosed);
    let finalGroups = [];
    if (existingTodayIndex !== -1) {
      finalGroups = [...updatedHistory];
      finalGroups[existingTodayIndex] = {
        ...finalGroups[existingTodayIndex],
        logs: [newLog, ...finalGroups[existingTodayIndex].logs]
      };
    } else {
      finalGroups = [{ dateKey: todayKey, dateLabel: getTodayDateLabel(), isClosed: false, logs: [newLog] }, ...updatedHistory];
    }

    setActiveOutVisit(null);
    syncToParent(finalGroups, {
      currentAttendanceStatus: 'In Office'
    });
  };

  // Confirm Check Out
  const handleConfirmCheckOut = (e) => {
    if (e) e.preventDefault();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const notesText = checkOutNotesInput.trim() || 'Workday Shift Completed';

    setCheckOutTime(nowStr);
    setStatus('day_completed');
    setIsCheckOutModalOpen(false);

    if (user?.isCheckedIn && onToggleCheckIn) {
      onToggleCheckIn();
    }

    const newLog = {
      id: Date.now(),
      time: nowStr,
      action: 'Check Out',
      location: 'GENZ Office',
      purpose: notesText,
      notes: notesText,
      duration: '-',
      status: 'Day Closed'
    };

    const todayKey = getTodayKey();
    let updatedGroups = [];
    const existingTodayIndex = activityHistoryByDate.findIndex(g => g.dateKey === todayKey && !g.isClosed);

    if (existingTodayIndex !== -1) {
      updatedGroups = [...activityHistoryByDate];
      updatedGroups[existingTodayIndex] = {
        ...updatedGroups[existingTodayIndex],
        isClosed: true,
        logs: [newLog, ...updatedGroups[existingTodayIndex].logs]
      };
    } else {
      updatedGroups = [{ dateKey: todayKey, dateLabel: getTodayDateLabel(), isClosed: true, logs: [newLog] }, ...activityHistoryByDate];
    }

    setCheckOutNotesInput('');
    syncToParent(updatedGroups, {
      isCheckedIn: false,
      hasCheckedOutToday: true,
      checkOutTime: nowStr,
      currentAttendanceStatus: 'Shift Completed'
    });
  };

  // CALCULATE DYNAMIC DURATIONS
  const formatDurationMs = (ms) => {
    if (!ms || ms <= 0) return '0h 00m 00s';
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const formatDurationShortMs = (ms) => {
    if (!ms || ms <= 0) return '0h 00m';
    const totalSec = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
  };

  const liveWorkingMs = checkInEpoch ? (nowMs - checkInEpoch) : 0;
  const liveTotalWorkHoursStr = (status === 'in_office' || status === 'outside') 
    ? formatDurationMs(liveWorkingMs)
    : (status === 'day_completed' ? formatDurationShortMs(liveWorkingMs || 8.5 * 3600 * 1000) : '0h 00m 00s');

  const currentOutsideMs = status === 'outside' && officeOutEpoch ? (nowMs - officeOutEpoch) : 0;
  const liveTotalOutsideMs = accumulatedOutsideMs + currentOutsideMs;
  const liveOutsideTimeStr = formatDurationShortMs(liveTotalOutsideMs);
  const totalLogsCount = activityHistoryByDate.reduce((acc, g) => acc + g.logs.length, 0);
  const totalOutsideVisits = activityHistoryByDate.reduce((acc, g) => {
    return acc + g.logs.filter(l => l.action === 'Office Out').length;
  }, 0);

  return (
    <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-10">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight mt-1">
            My Attendance & Date-Wise Activity History
          </h1>
        </div>

        {/* Dynamic Action Buttons */}
        <div>
          {status === 'in_office' && (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:space-x-2 w-full sm:w-auto">
              <button
                onClick={handleOpenOfficeOutModal}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>Office Out</span>
              </button>

              <button
                onClick={() => setIsCheckOutModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Check Out</span>
              </button>
            </div>
          )}

          {status === 'outside' && (
            <button
              onClick={handleReturnToOffice}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 animate-bounce"
            >
              <Building className="w-4 h-4" />
              <span>Back to Office</span>
            </button>
          )}

          {status === 'day_completed' && (
            <span className="px-4 py-2 rounded-2xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center space-x-1.5 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Day Completed (Shift Closed)</span>
            </span>
          )}
        </div>
      </div>

      {/* 4 DYNAMIC KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        
        {/* Current Status */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status</p>
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === 'in_office' ? 'bg-emerald-500 animate-pulse' :
              status === 'outside' ? 'bg-amber-500 animate-ping' :
              status === 'day_completed' ? 'bg-royal-600' : 'bg-slate-400'
            }`} />
            <p className="text-sm font-black font-heading text-slate-900">
              {status === 'in_office' && 'In Office'}
              {status === 'outside' && 'Outside (Office Out)'}
              {status === 'day_completed' && 'Day Completed'}
              {status === 'not_checked_in' && 'Not Checked In'}
            </p>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {status === 'in_office' && `Checked In: ${checkInTime || 'Active'}`}
            {status === 'outside' && `Site: ${activeOutVisit?.location || 'Field'}`}
            {status === 'day_completed' && `Checked Out: ${checkOutTime}`}
            {status === 'not_checked_in' && 'Click Check In in Navbar'}
          </p>
        </div>

        {/* Total Working Hours */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Working Hours</p>
          <p className="text-base sm:text-lg font-black text-slate-900 font-heading tracking-tight">{liveTotalWorkHoursStr}</p>
          <p className="text-[10px] text-emerald-600 font-bold">
            {(status === 'in_office' || status === 'outside') ? '⚡ Live Shift Timer' : 'Approved Shift'}
          </p>
        </div>

        {/* Field Visit Duration */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Field Visit Duration</p>
          <p className="text-base sm:text-lg font-black text-amber-600 font-heading tracking-tight">{liveOutsideTimeStr}</p>
          <p className="text-[10px] text-amber-600 font-bold">
            {status === 'outside' ? '🚗 Field Visit Active' : 'Total Outside Time'}
          </p>
        </div>

        {/* Total Out Visits */}
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Out Visits</p>
          <p className="text-lg sm:text-xl font-black text-royal-600 font-mono">{totalOutsideVisits} Visits</p>
          <p className="text-[10px] text-royal-600 font-bold">Recorded Visits</p>
        </div>

      </div>

      {/* DATE-WISE GROUPED USER DAY ACTIVITY HISTORY LIST */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-royal-100 text-royal-700">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black font-heading text-slate-900">User Day Activity History</h2>
              <p className="text-[10px] text-slate-400">Completed shifts are locked per date; new shifts start a fresh date group</p>
            </div>
          </div>
        </div>

        {/* Date Group Feed */}
        <div className="space-y-6">
          {activityHistoryByDate.map((dateGroup, gIndex) => (
            <div key={gIndex} className="space-y-3">
              
              {/* Date Group Header Badge */}
              <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-100/80 border border-slate-200/70">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-royal-600" />
                  <h3 className="text-xs font-black text-slate-800 font-heading">
                    {dateGroup.dateLabel}
                  </h3>
                </div>

                {dateGroup.isClosed ? (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-200 text-slate-700 flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span>Shift Closed & Locked</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                    <span>Active Today Shift</span>
                  </span>
                )}
              </div>

              {/* Logs in this Date Group */}
              <div className="space-y-2.5 pl-2 sm:pl-3 border-l-2 border-slate-200/80">
                {dateGroup.logs.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-royal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start sm:items-center space-x-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        item.action === 'Office Check In' ? 'bg-emerald-500 text-white' :
                        item.action === 'Office Out' ? 'bg-amber-500 text-slate-950' :
                        item.action === 'Back to Office' ? 'bg-royal-600 text-white' :
                        'bg-slate-900 text-white'
                      }`}>
                        {item.action === 'Office Check In' && <LogIn className="w-3.5 h-3.5" />}
                        {item.action === 'Office Out' && <Navigation className="w-3.5 h-3.5" />}
                        {item.action === 'Back to Office' && <Building className="w-3.5 h-3.5" />}
                        {item.action === 'Check Out' && <LogOut className="w-3.5 h-3.5" />}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-black text-slate-900">{item.action}</p>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                            item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'Active Field' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            'bg-slate-200 text-slate-800'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 mt-0.5">
                          <strong>Location:</strong> {item.location} • <strong>Purpose:</strong> {item.purpose}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center font-mono text-xs">
                      {item.duration !== '-' && (
                        <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          {item.duration}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 font-black text-royal-700 shadow-2xs">
                        {item.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* MODAL: OFFICE OUT FORM */}
      {isOfficeOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black font-heading">Record Office Out Entry</h3>
              </div>
              <button onClick={() => setIsOfficeOutModalOpen(false)} className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmOfficeOut} className="p-4 space-y-3">
              <p className="text-xs text-slate-600">
                Leaving office for field meeting or lead visit. Enter details:
              </p>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">1. Departure Time</label>
                <input
                  required
                  type="text"
                  value={outTimeInput}
                  onChange={(e) => setOutTimeInput(e.target.value)}
                  placeholder="e.g. 10:05 AM"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">2. Location / Site Address</label>
                <input
                  required
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g. Vertex Tech Hub, OMR Chennai"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">3. Purpose of Visit</label>
                <input
                  required
                  type="text"
                  value={purposeInput}
                  onChange={(e) => setPurposeInput(e.target.value)}
                  placeholder="e.g. Client Lead Meeting & Demo"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOfficeOutModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Office Out</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CHECK OUT MODAL */}
      {isCheckOutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LogOut className="w-4 h-4 text-royal-400" />
                <h3 className="text-sm font-black font-heading">Confirm Shift Check Out</h3>
              </div>
              <button onClick={() => setIsCheckOutModalOpen(false)} className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmCheckOut} className="p-5 space-y-4">
              <p className="text-xs text-slate-600">
                Type your EOD work notes/summary before checking out. Notes will be logged into your Attendance Record:
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Check-In Time:</span>
                  <span className="font-bold font-mono text-slate-800">{checkInTime || 'Recorded'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Check-Out Time:</span>
                  <span className="font-bold font-mono text-royal-600">Now</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Total Working Hours:</span>
                  <span className="font-bold font-heading text-emerald-600">{liveTotalWorkHoursStr}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">Field Visit Duration:</span>
                  <span className="font-bold font-heading text-amber-600">{liveOutsideTimeStr}</span>
                </div>
              </div>

              {/* Mandatory Check Out Work Notes Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                  Check Out Work Notes / EOD Summary *
                </label>
                <textarea
                  rows={3}
                  required
                  value={checkOutNotesInput}
                  onChange={(e) => setCheckOutNotesInput(e.target.value)}
                  placeholder="Enter work summary/notes for today before checking out (e.g. Completed lead follow-ups, converted 2 clients, prepared monthly pitch...)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 font-sans"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCheckOutModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Log Notes & Check Out</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
