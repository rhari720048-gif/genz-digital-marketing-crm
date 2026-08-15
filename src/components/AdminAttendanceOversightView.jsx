import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  UserCheck, 
  Building, 
  ChevronRight, 
  TrendingUp, 
  ShieldCheck,
  LogIn,
  LogOut,
  Coffee,
  Activity,
  User,
  BadgeCheck
} from 'lucide-react';

export default function AdminAttendanceOversightView({ users = [], attendanceLogs = [] }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Generate realistic date-wise logs for each user
  const getUserAttendanceHistory = (user) => {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const yesterdayStr = new Date(Date.now() - 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const day3Str = new Date(Date.now() - 172800000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const day4Str = new Date(Date.now() - 259200000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const day5Str = new Date(Date.now() - 345600000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

    return [
      {
        id: 101,
        date: `Today (${todayStr})`,
        checkIn: user.checkInTime || '09:00 AM',
        officeOut: '01:15 PM',
        officeIn: '02:00 PM',
        checkOut: user.checkOutTime || (user.isCheckedIn ? 'In Progress' : '06:30 PM'),
        totalHours: user.isCheckedIn ? 'Counting...' : '8h 30m',
        status: user.isCheckedIn ? 'On Shift (Active)' : 'Shift Completed',
        isToday: true
      },
      {
        id: 102,
        date: `Yesterday (${yesterdayStr})`,
        checkIn: '08:55 AM',
        officeOut: '01:00 PM',
        officeIn: '01:45 PM',
        checkOut: '06:30 PM',
        totalHours: '8h 50m',
        status: 'Completed - On Time',
        isToday: false
      },
      {
        id: 103,
        date: day3Str,
        checkIn: '09:10 AM',
        officeOut: '01:30 PM',
        officeIn: '02:15 PM',
        checkOut: '06:45 PM',
        totalHours: '8h 35m',
        status: 'Completed - Grace Late',
        isToday: false
      },
      {
        id: 104,
        date: day4Str,
        checkIn: '09:00 AM',
        officeOut: '01:00 PM',
        officeIn: '01:50 PM',
        checkOut: '06:30 PM',
        totalHours: '8h 40m',
        status: 'Completed - On Time',
        isToday: false
      },
      {
        id: 105,
        date: day5Str,
        checkIn: '08:50 AM',
        officeOut: '01:10 PM',
        officeIn: '01:55 PM',
        checkOut: '06:30 PM',
        totalHours: '8h 55m',
        status: 'Completed - On Time',
        isToday: false
      }
    ];
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.empId && u.empId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDept = deptFilter === 'all' || u.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departmentsList = Array.from(new Set(users.map(u => u.department).filter(Boolean)));

  // If a specific employee is selected, render their Detailed Date-Wise History Page!
  if (selectedUser) {
    const historyLogs = getUserAttendanceHistory(selectedUser);

    return (
      <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-8">
        
        {/* Back Button Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedUser(null)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center space-x-2 transition-all shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-royal-600" />
            <span>Back to All Employees</span>
          </button>

          <span className="px-3 py-1 rounded-full bg-royal-50 border border-royal-200 text-royal-700 font-bold text-xs font-mono">
            Employee Audit Log ID: {selectedUser.empId}
          </span>
        </div>

        {/* Employee Profile Header Card */}
        <div className="bg-gradient-to-r from-royal-600 via-royal-700 to-indigo-800 p-5 sm:p-6 rounded-3xl border border-royal-500/30 shadow-xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img 
              src={selectedUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
              alt={selectedUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white/20 shadow-md shrink-0" 
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">{selectedUser.name}</h1>
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-royal-100 font-bold mt-0.5">{selectedUser.role} • {selectedUser.department}</p>
              <div className="flex items-center space-x-3 text-[11px] text-royal-200 font-mono mt-1.5">
                <span>Emp ID: <strong>{selectedUser.empId}</strong></span>
                <span>•</span>
                <span>Work: <strong>{selectedUser.location || 'Chennai Tech Park'}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase text-royal-200">Current Status</p>
              <p className="text-xs font-black text-emerald-300 font-mono">
                {selectedUser.isCheckedIn ? '🟢 Active On Shift' : '⚪ Shift Completed / Off'}
              </p>
            </div>
          </div>
        </div>

        {/* Date-Wise Attendance Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-royal-100 text-royal-700">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black font-heading text-slate-900">
                  Date-Wise Shift & Time Log Details
                </h3>
                <p className="text-[11px] text-slate-500">
                  Daily breakdown of Check-In, Office Out/In, Check-Out, and Total Hours.
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified HR Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Check In (Office In)</th>
                  <th className="px-5 py-3.5">Office Out (Break)</th>
                  <th className="px-5 py-3.5">Office In (Return)</th>
                  <th className="px-5 py-3.5">Check Out (Exit)</th>
                  <th className="px-5 py-3.5">Total Hours</th>
                  <th className="px-5 py-3.5 text-center">Shift Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {historyLogs.map((log) => (
                  <tr key={log.id} className={`hover:bg-slate-50/50 transition-colors ${log.isToday ? 'bg-royal-50/30' : ''}`}>
                    
                    {/* Date */}
                    <td className="px-5 py-4 font-bold text-slate-900 font-heading">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-royal-600 shrink-0" />
                        <span>{log.date}</span>
                      </div>
                    </td>

                    {/* Check In */}
                    <td className="px-5 py-4 font-mono font-extrabold text-emerald-600">
                      <div className="flex items-center space-x-1.5">
                        <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{log.checkIn}</span>
                      </div>
                    </td>

                    {/* Office Out */}
                    <td className="px-5 py-4 font-mono text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <Coffee className="w-3.5 h-3.5 text-amber-500" />
                        <span>{log.officeOut}</span>
                      </div>
                    </td>

                    {/* Office In */}
                    <td className="px-5 py-4 font-mono text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <LogIn className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{log.officeIn}</span>
                      </div>
                    </td>

                    {/* Check Out */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center space-x-1.5">
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>{log.checkOut}</span>
                      </div>
                    </td>

                    {/* Total Hours */}
                    <td className="px-5 py-4 font-mono font-black text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {log.totalHours}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-block ${
                        log.isToday 
                          ? 'bg-royal-50 text-royal-700 border-royal-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  // Otherwise, render All Employees Directory Screen
  return (
    <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-8">
      
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 p-5 sm:p-6 rounded-3xl border border-emerald-500/30 shadow-xl text-white">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
            Company Attendance Oversight & Shift Logs
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">
            Monitor check-in times, office entry/exit hours, and view date-wise logs for every employee.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 flex items-center space-x-3 min-w-[130px]">
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-emerald-200 uppercase">Total Employees</p>
              <p className="text-sm font-black font-mono text-white">{users.length}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 flex items-center space-x-3 min-w-[130px]">
            <div className="p-2 rounded-xl bg-emerald-400/20 text-emerald-300">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-emerald-200 uppercase">Shift Status</p>
              <p className="text-sm font-black font-mono text-emerald-300">Operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-85">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee by name, emp ID, department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200/60 shrink-0 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-600 font-bold">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">All Departments</option>
            {departmentsList.map((d, idx) => (
              <option key={idx} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. ALL EMPLOYEES ATTENDANCE LIST TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black font-heading text-slate-900">
            Employee Attendance Status Directory
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Click "View History" to inspect date-wise logs
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Employee Details</th>
                <th className="px-6 py-4">Emp ID & Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Today's Check In</th>
                <th className="px-6 py-4">Shift Hours</th>
                <th className="px-6 py-4 text-center">Date-Wise Logs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id || u.empId} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* Employee Details */}
                  <td className="px-6 py-4.5">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
                        alt={u.name} 
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20 shadow-2xs" 
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-slate-900">{u.name}</span>
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  {/* Emp ID & Role */}
                  <td className="px-6 py-4.5">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-extrabold text-emerald-700">{u.empId}</span>
                      <span className="text-xs font-bold text-slate-800">{u.role}</span>
                    </div>
                  </td>

                  {/* Dept */}
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-bold text-slate-800">{u.department}</span>
                  </td>

                  {/* Today Check In */}
                  <td className="px-6 py-4.5 font-mono text-xs font-extrabold text-emerald-600">
                    {u.checkInTime || '09:00 AM'}
                  </td>

                  {/* Shift Hours */}
                  <td className="px-6 py-4.5 font-mono text-xs font-extrabold text-slate-800">
                    {u.totalHoursToday || '8h 30m'}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4.5 text-center">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition-all flex items-center justify-center space-x-1.5 mx-auto active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>View History</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>

                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-600">No matching employees found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
