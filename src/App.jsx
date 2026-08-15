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

const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Alex Morgan',
    email: 'alex.m@genzneuralx.io',
    password: 'alex123',
    mobile: '+91 98765 43210',
    empId: 'GNX-2026-0842',
    role: 'Head of Growth Marketing',
    department: 'Marketing Strategy & Leads',
    manager: 'Vikram Sharma (VP of Growth)',
    joiningDate: '15 March 2024',
    location: 'Chennai Tech Park / Hybrid',
    address: 'Suite 402, Neural Tower, OMR Tech Corridor, Chennai, TN - 600096',
    emergencyContact: '+91 98765 12345 (Family)',
    bloodGroup: 'O+ Positive',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 2,
    name: 'Sarah Connor',
    email: 'sarah.c@genzneuralx.io',
    password: 'sarah123',
    mobile: '+91 98765 43211',
    empId: 'GNX-2026-0843',
    role: 'Senior Performance Marketer',
    department: 'Performance Marketing',
    manager: 'Alex Morgan',
    joiningDate: '01 June 2024',
    location: 'Chennai Tech Park',
    address: 'T-Nagar Tech Hub, OMR Road, Chennai, TN - 600017',
    emergencyContact: '+91 98765 22222 (Father)',
    bloodGroup: 'A+ Positive',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250'
  },
  {
    id: 3,
    name: 'David Miller',
    email: 'david.m@genzneuralx.io',
    password: 'david123',
    mobile: '+91 98765 43212',
    empId: 'GNX-2026-0844',
    role: 'Sales & Lead Conversion Specialist',
    department: 'Sales & Conversions',
    manager: 'Alex Morgan',
    joiningDate: '10 January 2025',
    location: 'Hybrid',
    address: 'Velachery Cyber City, OMR, Chennai, TN - 600042',
    emergencyContact: '+91 98765 33333 (Spouse)',
    bloodGroup: 'B+ Positive',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_registered_users_v2');
      return saved ? JSON.parse(saved) : DEFAULT_USERS;
    } catch (e) {
      return DEFAULT_USERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_registered_users_v2', JSON.stringify(registeredUsers));
    } catch (e) {}
  }, [registeredUsers]);

  const [activeTab, setActiveTab] = useState('profile');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize attendance state from localStorage
  const initialAttendance = getStoredAttendance();

  // User state
  const [user, setUser] = useState(() => {
    return registeredUsers[0] || DEFAULT_USERS[0];
  });

  const handleAddUser = (newUser) => {
    setRegisteredUsers(prev => [newUser, ...prev]);
  };

  const handleDeleteUser = (userId) => {
    setRegisteredUsers(prev => prev.filter(u => u.id !== userId && u.empId !== userId));
  };

  const handleLoginAsUser = (targetUser) => {
    setUser(prev => ({
      ...prev,
      ...targetUser,
      greeting: `Welcome, ${targetUser.name.split(' ')[0]}`
    }));
    triggerToast(`Switched active profile to ${targetUser.name}`);
  };

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
    const nowStr = formatTime(new Date());

    if (!user.isCheckedIn) {
      const newAttendance = {
        isCheckedIn: true,
        checkInTime: nowStr,
        checkOutTime: null,
        hasCheckedOutToday: false
      };
      saveAttendance(todayKey, newAttendance);

      setUser(prev => ({
        ...prev,
        isCheckedIn: true,
        checkInTime: nowStr,
        checkOutTime: null,
        hasCheckedOutToday: false,
        totalHoursToday: '0h 01m'
      }));

      setAttendanceLogs(prev => [
        {
          id: Date.now(),
          date: `Today, ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          checkIn: nowStr,
          checkOut: 'In Progress',
          hours: 'Counting...',
          status: 'Active',
          isToday: true
        },
        ...prev.filter(l => !l.isToday)
      ]);

      triggerToast(`Checked In successfully at ${nowStr}! Have a great workday!`);
    } else {
      const newAttendance = {
        isCheckedIn: false,
        checkInTime: user.checkInTime || '09:00 AM',
        checkOutTime: nowStr,
        hasCheckedOutToday: true
      };
      saveAttendance(todayKey, newAttendance);

      setUser(prev => ({
        ...prev,
        isCheckedIn: false,
        checkOutTime: nowStr,
        hasCheckedOutToday: true,
        totalHoursToday: '8h 30m'
      }));

      setAttendanceLogs(prev =>
        prev.map(l =>
          l.isToday
            ? { ...l, checkOut: nowStr, hours: '8h 30m', status: 'Completed' }
            : l
        )
      );

      triggerToast(`Checked Out at ${nowStr}! Attendance logged.`);
    }
  };

  const handleLogin = (loggedUser) => {
    setIsAuthenticated(true);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    } catch (e) {}
    if (loggedUser) {
      setUser(prev => ({
        ...prev,
        ...loggedUser,
        greeting: `Welcome back, ${loggedUser.name?.split(' ')[0] || 'User'}`
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
    return <LoginView onLogin={handleLogin} registeredUsers={registeredUsers} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-royal-500 selection:text-white">
      
      <Header
        user={user}
        onToggleCheckIn={handleToggleCheckIn}
        onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        onLogout={handleLogout}
      />

      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-royal-500/30 flex items-center space-x-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row">
        
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          user={user}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 p-3 sm:p-4 lg:p-5 min-w-0 bg-slate-50/50 pb-6">
          <ComingSoonView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            stats={stats}
            refetchStats={refetchStats}
            attendanceLogs={attendanceLogs}
            onToggleCheckIn={handleToggleCheckIn}
            registeredUsers={registeredUsers}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            onLoginAsUser={handleLoginAsUser}
          />
        </main>

      </div>

      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        user={user}
        onToggleCheckIn={handleToggleCheckIn}
        attendanceLogs={attendanceLogs}
      />

    </div>
  );
}
