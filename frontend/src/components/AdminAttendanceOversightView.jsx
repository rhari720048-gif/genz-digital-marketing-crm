import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Calendar, 
  Search, 
  Filter, 
  ArrowLeft, 
  CheckCircle2, 
  Briefcase, 
  ChevronRight, 
  LogIn,
  LogOut,
  Navigation,
  BadgeCheck,
  Building2,
  MapPin
} from 'lucide-react';

const calculateDuration = (startTimeStr, endTimeStr) => {
  if (!startTimeStr || !endTimeStr) return '-';
  
  const parseTime = (timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes; // in minutes
  };

  const startMin = parseTime(startTimeStr);
  const endMin = parseTime(endTimeStr);
  
  if (startMin === null || endMin === null) return '-';
  
  let diffMin = endMin - startMin;
  if (diffMin < 0) diffMin += 24 * 60; // handle cross-midnight shift
  
  const hrs = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return `${hrs}h ${String(mins).padStart(2, '0')}m`;
};

export default function AdminAttendanceOversightView({ users = [], attendanceLogs = [], userAttendanceRecords = {} }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');

  // Extract live date-wise logs from userAttendanceRecords
  const getUserAttendanceHistory = (user) => {
    if (!user || !user.email) return [];
    const emailKey = user.email.toLowerCase();
    const rawUserLogs = userAttendanceRecords[emailKey];
    
    if (!rawUserLogs || !Array.isArray(rawUserLogs) || rawUserLogs.length === 0) {
      return [];
    }

    return rawUserLogs.map((dateGroup, index) => {
      const checkInLog = dateGroup.logs.find(l => l.action === 'Office Check In' || l.action === 'Check In');
      const checkOutLog = dateGroup.logs.find(l => l.action === 'Shift Check Out' || l.action === 'Check Out' || l.status === 'Day Closed');
      const outLogs = dateGroup.logs.filter(l => l.action === 'Office Out');

      const clientVisits = outLogs.map(outLog => {
        const backLog = dateGroup.logs.find(l => l.action === 'Back to Office' && l.id >= outLog.id);
        return {
          out: outLog.time,
          in: backLog ? backLog.time : (outLog.status === 'Active Field' ? 'In Field' : 'Returned'),
          purpose: `${outLog.location || 'Field Location'} - ${outLog.purpose || 'Field Visit'}`
        };
      });

      const totalHoursVal = (checkInLog && checkOutLog)
        ? calculateDuration(checkInLog.time, checkOutLog.time)
        : (index === 0 && !dateGroup.isClosed ? 'Calculating...' : '-');

      return {
        id: index + 1,
        date: dateGroup.dateLabel || dateGroup.dateKey,
        checkIn: checkInLog ? checkInLog.time : 'Not Checked In',
        checkOut: checkOutLog ? checkOutLog.time : (index === 0 && !dateGroup.isClosed ? 'In Progress' : '-'),
        clientVisits: clientVisits,
        totalHours: totalHoursVal,
        status: dateGroup.isClosed ? 'Completed' : (index === 0 && !dateGroup.isClosed ? 'On Shift (Active)' : 'In Progress'),
        isToday: index === 0
      };
    });
  };

  // Filter out Admin users so only employees are shown
  const employeeUsers = users.filter(u => !(u.isAdmin || u.role === 'Super Admin' || u.email === 'admin@genzneuralx.io'));

  const filteredUsers = employeeUsers.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.empId && u.empId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDept = deptFilter === 'all' || u.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departmentsList = Array.from(new Set(employeeUsers.map(u => u.department).filter(Boolean)));

  // Detailed Employee Attendance & Client Visit History Screen
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
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs text-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">{selectedUser.name}</h1>
              <BadgeCheck className="w-5 h-5 text-royal-600" />
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">{selectedUser.role} • {selectedUser.department}</p>
            <div className="flex items-center space-x-3 text-[11px] text-slate-600 font-mono mt-1.5">
              <span>Emp ID: <strong className="text-royal-700">{selectedUser.empId}</strong></span>
              <span>•</span>
              <span>Work: <strong className="text-slate-800">{selectedUser.location || 'Chennai Tech Park'}</strong></span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase text-slate-400">Current Status</p>
              <p className="text-xs font-black text-emerald-600 font-mono">
                {selectedUser.isCheckedIn ? '🟢 Active On Shift' : '⚪ Shift Completed / Off'}
              </p>
            </div>
          </div>
        </div>

        {/* Date-Wise Attendance & Client Field Visit Logs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-royal-100 text-royal-700">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black font-heading text-slate-900">
                  Date-Wise Check In, Client Visits & Check Out Logs
                </h3>
                <p className="text-[11px] text-slate-500">
                  Includes morning Office Check-In, multiple Client Visit Office Out/In movements, and evening Check-Out.
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
                  <th className="px-5 py-3.5">Client Visit / Field Movement Logs (Office Out → In)</th>
                  <th className="px-5 py-3.5">Check Out (Exit)</th>
                  <th className="px-5 py-3.5">Total Shift Hours</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {historyLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-12 text-center text-slate-400 font-bold text-xs">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Clock className="w-8 h-8 text-slate-300" />
                        <p className="text-slate-600 font-extrabold text-sm">No Attendance Activity Recorded Yet</p>
                        <p className="text-slate-400 text-xs">When {selectedUser.name} logs in and performs Check-In or Office Out field visits, real-time records will appear here.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  historyLogs.map((log) => (
                  <tr key={log.id} className={`hover:bg-slate-50/50 transition-colors ${log.isToday ? 'bg-royal-50/30' : ''}`}>
                    
                    {/* Date */}
                    <td className="px-5 py-4 font-bold text-slate-900 font-heading align-top">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-royal-600 shrink-0" />
                        <span>{log.date}</span>
                      </div>
                    </td>

                    {/* Check In */}
                    <td className="px-5 py-4 font-mono font-extrabold text-emerald-600 align-top">
                      <div className="flex items-center space-x-1.5">
                        <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{log.checkIn}</span>
                      </div>
                    </td>

                    {/* Multiple Client Field Visits (Office Out -> Office In) */}
                    <td className="px-5 py-4 align-top">
                      <div className="space-y-1.5">
                        {log.clientVisits.map((visit, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px]">
                            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
                              <Navigation className="w-3 h-3 text-royal-600 shrink-0" />
                              <span>{visit.purpose}</span>
                            </div>
                            <div className="flex items-center space-x-3 font-mono text-[10px] text-slate-600 mt-1">
                              <span className="text-amber-700 font-bold">Out: {visit.out}</span>
                              <span className="text-slate-300">➔</span>
                              <span className="text-indigo-700 font-bold">In: {visit.in}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Check Out & Work Notes */}
                    <td className="px-5 py-4 font-mono font-bold text-slate-800 align-top">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center space-x-1.5 font-mono">
                          <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{log.checkOut}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-sans font-medium italic bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 max-w-[180px]">
                          <strong>Notes:</strong> {log.notes || log.checkOutNotes || 'Completed lead followups & EOD report'}
                        </p>
                      </div>
                    </td>

                    {/* Total Hours */}
                    <td className="px-5 py-4 font-mono font-black text-slate-900 align-top">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                        {log.totalHours}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center align-top">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border inline-block ${
                        log.isToday 
                          ? 'bg-royal-50 text-royal-700 border-royal-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>

                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  // All Employees Directory Screen (Row Clickable Directly!)
  return (
    <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-8">
      
      {/* HEADER BANNER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs text-slate-900">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight flex items-center space-x-2.5">
            <Clock className="w-6 h-6 text-royal-600 shrink-0" />
            <span>User Attendance</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/50 flex items-center space-x-3 min-w-[130px]">
            <div className="p-2 rounded-xl bg-royal-100 text-royal-700">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase">Total Employees</p>
              <p className="text-sm font-black font-heading text-slate-900">{employeeUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
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

      {/* ALL EMPLOYEES DIRECTORY TABLE (Entire Row Clickable!) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black font-heading text-slate-900">
            Employee Directory (Click row to view Attendance History)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-4 w-16 text-center">S.No</th>
                <th className="px-6 py-4">Employee Details</th>
                <th className="px-6 py-4">Emp ID & Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredUsers.map((u, index) => (
                <tr 
                  key={u.id || u.empId} 
                  onClick={() => setSelectedUser(u)}
                  className="hover:bg-royal-50/60 transition-all cursor-pointer group"
                >
                  
                  {/* S.No */}
                  <td className="px-4 py-4.5 text-center font-mono font-bold text-slate-400">
                    {index + 1}
                  </td>

                  {/* Employee Details */}
                  <td className="px-6 py-4.5">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-slate-900 group-hover:text-royal-600 transition-colors">{u.name}</span>
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <span className="text-xs text-slate-400 font-mono block">{u.email}</span>
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
                    <span className="text-xs font-bold text-slate-800">{u.department || 'N/A'}</span>
                  </td>

                  {/* Inspect Action */}
                  <td className="px-6 py-4.5 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(u);
                      }}
                      className="p-2 rounded-xl bg-royal-600 group-hover:bg-royal-700 text-white transition-all shadow-2xs group-hover:scale-110 shrink-0 inline-flex items-center justify-center cursor-pointer"
                      title="Inspect Full Attendance Logs"
                    >
                      <ChevronRight className="w-4 h-4" />
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
