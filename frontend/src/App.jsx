import React, { useState, useEffect } from 'react';
import { getApiUrl } from './apiConfig';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ComingSoonView from './components/ComingSoonView';
import AttendanceModal from './components/AttendanceModal';
import LoginView from './components/LoginView';
import { CheckCircle2, Sparkles } from 'lucide-react';

const ATTENDANCE_STORAGE_KEY = 'crm_daily_attendance_v2';
const AUTH_STORAGE_KEY = 'crm_auth_session';
const USERS_LIST_STORAGE_KEY = 'crm_registered_users_v2';
const USER_SESSION_KEY = 'crm_current_user_v2';

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
  } catch (e) { }
  return initial;
};

const saveAttendance = (todayKey, attendanceData) => {
  try {
    localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify({ date: todayKey, ...attendanceData }));
  } catch (e) {
    console.error("Failed to save daily attendance:", e);
  }
};

const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};


const DEFAULT_USERS = [];

const getStoredUser = () => {
  try {
    const rawSession = sessionStorage.getItem(USER_SESSION_KEY);
    if (rawSession) return JSON.parse(rawSession);
  } catch (e) { }
  return null;
};

const getStoredAuth = () => {
  try {
    const hasAuthSession = sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true';
    const stored = getStoredUser();
    return Boolean(hasAuthSession && stored && stored.email);
  } catch (e) {
    return false;
  }
};

export default function App() {
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const [userAttendanceRecords, setUserAttendanceRecords] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_user_attendance_records_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) { }
    return {};
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => getStoredAuth());

  // Purge legacy persistent localStorage auth data on mount so direct URL visits ALWAYS land on Login page
  useEffect(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_SESSION_KEY);
    } catch (e) { }
  }, []);

  // Sync registered users from TiDB database when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(getApiUrl('/api/users'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRegisteredUsers(data);
        }
      })
      .catch(err => console.error('Failed to sync users from database:', err));
  }, [isAuthenticated]);

  // Sync attendance records from TiDB database when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetch(getApiUrl('/api/attendance'))
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setUserAttendanceRecords(data);
        }
      })
      .catch(err => console.error('Failed to sync attendance logs from database:', err));
  }, [isAuthenticated]);

  // User state cross-referenced with registeredUsers to preserve exact Admin/Employee roles on refresh
  const [user, setUser] = useState(() => {
    const storedUser = getStoredUser();
    if (storedUser && storedUser.email) {
      const match = registeredUsers.find(u => (u.email || '').toLowerCase() === storedUser.email.toLowerCase());
      if (match) {
        const isSysAdmin = Boolean(match.isAdmin || match.role === 'Super Admin' || match.id === 'admin-001');
        return { ...match, isAdmin: isSysAdmin };
      }
      const isSysAdmin = Boolean(storedUser.isAdmin || storedUser.role === 'Super Admin' || storedUser.id === 'admin-001');
      return { ...storedUser, isAdmin: isSysAdmin };
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const storedUser = getStoredUser();
    if (!storedUser) return 'profile';
    const isSysAdmin = Boolean(storedUser.isAdmin || storedUser.role === 'Super Admin' || storedUser.id === 'admin-001');
    try {
      const savedTab = sessionStorage.getItem('crm_active_tab_v2');
      if (savedTab) {
        if (!isSysAdmin && (savedTab === 'users' || savedTab === 'attendance-admin' || savedTab === 'analytics')) {
          return 'profile';
        }
        if (isSysAdmin && (savedTab === 'profile' || savedTab === 'attendance')) {
          return 'users';
        }
        return savedTab;
      }
    } catch (e) { }
    return isSysAdmin ? 'users' : 'profile';
  });
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Initialize attendance state from localStorage
  const initialAttendance = getStoredAttendance();

  // Role-based activeTab guard effect
  useEffect(() => {
    if (!user) return;
    const isSysAdmin = Boolean(user.isAdmin || user.role === 'Super Admin' || user.id === 'admin-001');
    if (!isSysAdmin && (activeTab === 'users' || activeTab === 'attendance-admin' || activeTab === 'analytics')) {
      setActiveTab('profile');
      try {
        sessionStorage.setItem('crm_active_tab_v2', 'profile');
      } catch (e) { }
    } else if (isSysAdmin && (activeTab === 'profile' || activeTab === 'attendance')) {
      setActiveTab('users');
      try {
        sessionStorage.setItem('crm_active_tab_v2', 'users');
      } catch (e) { }
    } else {
      try {
        sessionStorage.setItem('crm_active_tab_v2', activeTab);
      } catch (e) { }
    }
  }, [user, activeTab]);

  // Scroll to top on active tab switch to prevent layout jumping
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Dynamically measure header height to align sidebar and main area perfectly
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        document.documentElement.style.setProperty('--header-height', `${headerEl.offsetHeight}px`);
      }
    };
    updateHeaderHeight();
    
    // Add small delay to account for rendering/reflows
    const timer = setTimeout(updateHeaderHeight, 150);
    
    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, [activeTab, user]);

  useEffect(() => {
    if (!user) return;
    try {
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } catch (e) { }
  }, [user]);

  // Auto-logout user if they are deactivated (Inactive) or deleted from registeredUsers list, and dynamically sync role changes
  useEffect(() => {
    if (!isAuthenticated || !user || registeredUsers.length === 0) return;
    const currentUserInList = registeredUsers.find(u => (u.email || '').toLowerCase() === user.email.toLowerCase());

    if (!currentUserInList) {
      handleLogout();
      alert('Your account has been deleted by the administrator. Logging out.');
      return;
    }

    if (currentUserInList.status === 'Inactive') {
      handleLogout();
      alert('Your account has been deactivated by the administrator. Logging out.');
      return;
    }

    // Role changes: Admin access granted or removed
    const currentIsAdmin = Boolean(user.isAdmin || user.role === 'Super Admin' || user.id === 'admin-001');
    const listIsAdmin = Boolean(currentUserInList.isAdmin || currentUserInList.role === 'Super Admin' || currentUserInList.id === 'admin-001');

    if (currentIsAdmin !== listIsAdmin) {
      // Role changed! Update user state and activeTab to update view dynamically
      const updatedUser = {
        ...currentUserInList,
        isAdmin: listIsAdmin,
        greeting: listIsAdmin ? 'Welcome, System Administrator' : `Welcome back, ${currentUserInList.name?.split(' ')[0] || 'User'}`
      };
      setUser(updatedUser);
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
      const targetTab = listIsAdmin ? 'users' : 'profile';
      setActiveTab(targetTab);
      sessionStorage.setItem('crm_active_tab_v2', targetTab);
      triggerToast(`Your access level has been updated to ${listIsAdmin ? 'Administrator' : 'Employee'}. Page updated.`);
    }
  }, [registeredUsers, user, isAuthenticated]);

  const handleUpdateUserAttendance = (userEmail, logs, userStatusUpdate) => {
    const emailKey = (userEmail || user?.email || '').toLowerCase();
    if (!emailKey) return;

    setUserAttendanceRecords(prev => {
      const updated = { ...prev, [emailKey]: logs };

      // Save/persist to database
      fetch(getApiUrl('/api/attendance'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailKey, logs })
      }).catch(err => console.error('Error persisting attendance to DB:', err));

      return updated;
    });

    if (userStatusUpdate) {
      setRegisteredUsers(prev => prev.map(u => {
        if (u.email.toLowerCase() === emailKey) {
          return { ...u, ...userStatusUpdate };
        }
        return u;
      }));

      if (user && user.email.toLowerCase() === emailKey) {
        const updatedUser = { ...user, ...userStatusUpdate };
        setUser(updatedUser);
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
      }
    }
  };

  const handleAddUser = async (newUser) => {
    try {
      const res = await fetch(getApiUrl('/api/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      const data = await res.json();
      if (data && data.id) {
        setRegisteredUsers(prev => [data, ...prev]);
      }
    } catch (err) {
      console.error('Failed to add user to TiDB:', err);
    }
  };

  const handleUpdateUser = async (updatedUser) => {
    try {
      const res = await fetch(getApiUrl(`/api/users/${updatedUser.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
      const data = await res.json();

      setRegisteredUsers(prev =>
        prev.map(u => (u.id === data.id) ? data : u)
      );

      if (user && (user.id === data.id || user.email.toLowerCase() === data.email.toLowerCase())) {
        const isSysAdmin = Boolean(data.isAdmin || data.role === 'Super Admin' || data.id === 'admin-001');
        const finalUser = { ...data, isAdmin: isSysAdmin };
        setUser(finalUser);
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(finalUser));
      }
    } catch (err) {
      console.error('Failed to update user in TiDB:', err);
    }
  };

  const handleToggleUserStatus = async (userId) => {
    const matched = registeredUsers.find(u => u.id === userId || u.empId === userId);
    if (!matched) return;
    const newStatus = matched.status === 'Inactive' ? 'Active' : 'Inactive';
    const updatedObj = { ...matched, status: newStatus };

    try {
      const res = await fetch(getApiUrl(`/api/users/${matched.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedObj)
      });
      const data = await res.json();

      setRegisteredUsers(prev => prev.map(u => u.id === data.id ? data : u));
      triggerToast(`User ${data.name} set to ${data.status}`);

      if (user && (user.id === data.id || user.email.toLowerCase() === data.email.toLowerCase())) {
        if (data.status === 'Inactive') {
          setTimeout(() => handleLogout(), 100);
        }
      }
    } catch (err) {
      console.error('Failed to toggle user status in TiDB:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    const matched = registeredUsers.find(u => u.id === userId || u.empId === userId);
    if (!matched) return;

    try {
      await fetch(getApiUrl(`/api/users/${matched.id}`), {
        method: 'DELETE'
      });

      setRegisteredUsers(prev => prev.filter(u => u.id !== matched.id));
      triggerToast(`User deleted successfully`);

      if (user && (user.id === matched.id || user.email.toLowerCase() === matched.email.toLowerCase())) {
        setTimeout(() => handleLogout(), 100);
      }
    } catch (err) {
      console.error('Failed to delete user from TiDB:', err);
    }
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
    fetch(getApiUrl('/api/stats'))
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => { });
  };

  useEffect(() => {
    refetchStats();
  }, []);

  // Sync active user profile with registeredUsers state whenever Admin makes updates
  useEffect(() => {
    if (user && user.email && !user.isAdmin) {
      const latestInList = registeredUsers.find(u => (u.email || '').toLowerCase() === user.email.toLowerCase());
      if (latestInList) {
        setUser(prev => {
          const merged = { ...prev, ...latestInList };
          try {
            localStorage.setItem(USER_SESSION_KEY, JSON.stringify(merged));
          } catch (e) { }
          return merged;
        });
      }
    }
  }, [registeredUsers]);

  const handleToggleCheckIn = () => {
    const todayKey = getTodayDateKey();
    const nowStr = formatTime(new Date());
    const emailKey = (user?.email || '').toLowerCase();
    const todayDateKey = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const todayLabel = `Today • ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}`;

    if (!user.isCheckedIn) {
      const newAttendance = {
        isCheckedIn: true,
        checkInTime: nowStr,
        checkOutTime: null,
        hasCheckedOutToday: false,
        checkInEpoch: Date.now()
      };
      saveAttendance(todayKey, newAttendance);

      const userUpdate = {
        isCheckedIn: true,
        checkInTime: nowStr,
        checkOutTime: null,
        hasCheckedOutToday: false,
        checkInEpoch: Date.now(),
        totalHoursToday: '0h 01m'
      };

      setUser(prev => ({ ...prev, ...userUpdate }));

      // Create date-wise log entry for userAttendanceRecords
      if (emailKey) {
        const currentLogs = userAttendanceRecords[emailKey] || [];
        const existingTodayIdx = currentLogs.findIndex(g => g.dateKey === todayDateKey && !g.isClosed);
        const newLog = {
          id: Date.now(),
          time: nowStr,
          action: 'Office Check In',
          location: 'GENZ Office',
          purpose: 'Morning Shift Check In',
          duration: '-',
          status: 'Completed'
        };

        let updatedGroups = [];
        if (existingTodayIdx !== -1) {
          updatedGroups = [...currentLogs];
          // avoid duplicate check-in log if already present
          const hasCheckIn = updatedGroups[existingTodayIdx].logs.some(l => l.action === 'Office Check In');
          if (!hasCheckIn) {
            updatedGroups[existingTodayIdx] = {
              ...updatedGroups[existingTodayIdx],
              logs: [newLog, ...updatedGroups[existingTodayIdx].logs]
            };
          }
        } else {
          updatedGroups = [
            {
              dateKey: todayDateKey,
              dateLabel: todayLabel,
              isClosed: false,
              logs: [newLog]
            },
            ...currentLogs
          ];
        }
        handleUpdateUserAttendance(emailKey, updatedGroups, userUpdate);
      }

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

      let shiftHoursStr = '8h 30m';
      if (user.checkInEpoch) {
        const ms = Date.now() - user.checkInEpoch;
        const totalSec = Math.floor(ms / 1000);
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        shiftHoursStr = `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
      }

      const userUpdate = {
        isCheckedIn: false,
        checkOutTime: nowStr,
        hasCheckedOutToday: true,
        totalHoursToday: shiftHoursStr
      };

      setUser(prev => ({ ...prev, ...userUpdate }));

      if (emailKey) {
        const currentLogs = userAttendanceRecords[emailKey] || [];
        const existingTodayIdx = currentLogs.findIndex(g => g.dateKey === todayDateKey && !g.isClosed);
        const newLog = {
          id: Date.now(),
          time: nowStr,
          action: 'Check Out',
          location: 'GENZ Office',
          purpose: 'Shift Completed',
          notes: 'Shift Completed',
          duration: '-',
          status: 'Day Closed'
        };

        let updatedGroups = [];
        if (existingTodayIdx !== -1) {
          updatedGroups = [...currentLogs];
          updatedGroups[existingTodayIdx] = {
            ...updatedGroups[existingTodayIdx],
            isClosed: true,
            logs: [newLog, ...updatedGroups[existingTodayIdx].logs]
          };
        } else {
          updatedGroups = [
            {
              dateKey: todayDateKey,
              dateLabel: todayLabel,
              isClosed: true,
              logs: [newLog]
            },
            ...currentLogs
          ];
        }
        handleUpdateUserAttendance(emailKey, updatedGroups, userUpdate);
      }

      setAttendanceLogs(prev =>
        prev.map(l =>
          l.isToday
            ? { ...l, checkOut: nowStr, hours: shiftHoursStr, status: 'Completed' }
            : l
        )
      );

      triggerToast(`Checked Out at ${nowStr}! Attendance logged.`);
    }
  };

  const handleLogin = (loggedUser) => {
    if (!loggedUser) return;
    const isSysAdmin = Boolean(loggedUser.isAdmin || loggedUser.role === 'Super Admin' || loggedUser.id === 'admin-001');
    const updatedUser = {
      ...loggedUser,
      isAdmin: isSysAdmin,
      greeting: isSysAdmin ? 'Welcome, System Administrator' : `Welcome back, ${loggedUser.name?.split(' ')[0] || 'User'}`
    };
    setUser(updatedUser);
    setIsAuthenticated(true);

    const targetTab = isSysAdmin ? 'users' : 'profile';
    setActiveTab(targetTab);

    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'true');
      sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedUser));
      sessionStorage.setItem('crm_active_tab_v2', targetTab);

      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem('crm_active_tab_v2');
    } catch (e) { }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.removeItem(USER_SESSION_KEY);
      sessionStorage.removeItem('crm_active_tab_v2');

      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_SESSION_KEY);
      localStorage.removeItem('crm_active_tab_v2');
    } catch (e) { }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} registeredUsers={registeredUsers} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans selection:bg-royal-500 selection:text-white overflow-x-hidden w-full">

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

      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row min-w-0 overflow-x-hidden lg:min-h-[calc(100vh-var(--header-height))]">

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          user={user}
          isOpenMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        <main className="flex-1 p-2.5 sm:p-4 lg:p-5 min-w-0 max-w-full bg-slate-50/50 pb-6 overflow-x-hidden">
          <ComingSoonView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            stats={stats}
            refetchStats={refetchStats}
            attendanceLogs={attendanceLogs}
            userAttendanceRecords={userAttendanceRecords}
            onUpdateUserAttendance={handleUpdateUserAttendance}
            onToggleCheckIn={handleToggleCheckIn}
            registeredUsers={registeredUsers}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onToggleUserStatus={handleToggleUserStatus}
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
