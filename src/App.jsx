import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ComingSoonView from './components/ComingSoonView';
import AttendanceModal from './components/AttendanceModal';
import LoginView from './components/LoginView';
import { CheckCircle2, Sparkles } from 'lucide-react';

const ATTENDANCE_STORAGE_KEY = 'crm_daily_attendance_v2';
const AUTH_STORAGE_KEY = 'crm_auth_session';

const getTodayDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const getStoredAttendance = () => {
  const todayKey = getTodayDateKey();
  try {
    const raw = localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === todayKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading attendance state:", e);
  }
  const initial = {
    date: todayKey,
    isCheckedIn: false,
    checkInTime: null,
    checkOutTime: null,
    hasCheckedOutToday: false
  };
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(initial));
  } catch (e) {}
  return initial;
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [activeTab, setActiveTab] = useState('profile');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize attendance state from localStorage
  const initialAttendance = getStoredAttendance();

  // User state
  const [user, setUser] = useState({
    name: 'Alex Morgan',
    role: 'Head of Growth Marketing',
    greeting: 'Good Morning, Alex',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    isCheckedIn: initialAttendance.isCheckedIn,
    checkInTime: initialAttendance.checkInTime,
    checkOutTime: initialAttendance.checkOutTime,
    hasCheckedOutToday: initialAttendance.hasCheckedOutToday,
    totalHoursToday: '3h 45m'
  });

  // Attendance history logs
  const [attendanceLogs, setAttendanceLogs] = useState(() => {
    const logs = [];
    if (initialAttendance.checkInTime) {
      logs.push({
        id: 999,
        date: `Today, ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        checkIn: initialAttendance.checkInTime,
        checkOut: initialAttendance.checkOutTime || 'In Progress',
        hours: initialAttendance.checkOutTime ? '8h 30m' : 'Counting...',
        status: initialAttendance.checkOutTime ? 'Completed' : 'Active',
        isToday: true
      });
    }
    return [
      ...logs,
      { id: 2, date: 'Yesterday, Aug 10', checkIn: '09:00 AM', checkOut: '06:30 PM', hours: '9h 30m', status: 'Completed' },
      { id: 3, date: 'Aug 09, 2026', checkIn: '09:05 AM', checkOut: '06:15 PM', hours: '9h 10m', status: 'Completed' }
    ];
  });

  // Statistics
  const [stats, setStats] = useState({
    leads: { count: 128, change: '+14% this week', active: 42 },
    quotations: { count: 34, pendingValue: '₹1,42,500', approved: 26 },
    invoices: { count: 89, totalRevenue: '₹3,84,200', unpaid: 5 },
    userNotes: { count: 56, pinned: 12 },
    meetings: { today: 4, upcoming: 12 }
  });

  const refetchStats = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUser(prev => ({ ...prev, ...data })))
      .catch(() => {});

    refetchStats();
  }, []);

  const handleToggleCheckIn = () => {
    const todayKey = getTodayDateKey();
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Enforce 1 check-in / check-out limit per day!
    if (!user.isCheckedIn && user.hasCheckedOutToday) {
      triggerToast('You have already completed your Check In & Check Out for today! See you tomorrow.');
      return;
    }

    if (!user.isCheckedIn) {
      // 1. Perform Check In
      const nextTime = user.checkInTime || nowStr;
      const updatedUser = {
        ...user,
        isCheckedIn: true,
        checkInTime: nextTime,
        hasCheckedOutToday: false
      };
      setUser(updatedUser);

      const stateToSave = {
        date: todayKey,
        isCheckedIn: true,
        checkInTime: nextTime,
        checkOutTime: null,
        hasCheckedOutToday: false
      };
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(stateToSave));

      setAttendanceLogs(prev => {
        const filtered = prev.filter(l => !l.isToday);
        return [
          {
            id: Date.now(),
            date: `Today, ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
            checkIn: nextTime,
            checkOut: 'In Progress',
            hours: 'Counting...',
            status: 'Active',
            isToday: true
          },
          ...filtered
        ];
      });

      triggerToast(`Checked In successfully at ${nextTime}! Have a great shift.`);
    } else {
      // 2. Perform Check Out for the day
      const updatedUser = {
        ...user,
        isCheckedIn: false,
        checkOutTime: nowStr,
        hasCheckedOutToday: true
      };
      setUser(updatedUser);

      const stateToSave = {
        date: todayKey,
        isCheckedIn: false,
        checkInTime: user.checkInTime,
        checkOutTime: nowStr,
        hasCheckedOutToday: true
      };
      localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(stateToSave));

      setAttendanceLogs(prev => prev.map((log) => (log.isToday || log.id === 999) ? { ...log, checkOut: nowStr, hours: '8h 30m', status: 'Completed' } : log));

      triggerToast(`Checked Out at ${nowStr}. Shift completed for today!`);
    }
  };

  const handleLogin = (credentials) => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch (e) {}
    if (credentials?.name) {
      setUser(prev => ({
        ...prev,
        name: credentials.name,
        email: credentials.email || prev.email,
        greeting: `Welcome back, ${credentials.name.split(' ')[0]}`
      }));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {}
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-royal-500 selection:text-white">
      
      {/* Top Header Bar */}
      <Header
        user={user}
        onToggleCheckIn={handleToggleCheckIn}
        onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onLogout={handleLogout}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-royal-500/30 flex items-center space-x-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row">
        
        {/* Navigation Sidebar Drawer */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          user={user}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Main View */}
        <main className="flex-1 p-3 sm:p-4 lg:p-5 min-w-0 bg-slate-50/50 pb-6">
          <ComingSoonView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            stats={stats}
            refetchStats={refetchStats}
            attendanceLogs={attendanceLogs}
            onToggleCheckIn={handleToggleCheckIn}
          />
        </main>

      </div>

      {/* Attendance History Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        user={user}
        attendanceLogs={attendanceLogs}
        onToggleCheckIn={handleToggleCheckIn}
      />

    </div>
  );
}
