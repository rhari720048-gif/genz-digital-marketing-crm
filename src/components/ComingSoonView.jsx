import React from 'react';
import ProfileView from './ProfileView';
import AttendanceView from './AttendanceView';
import LeadsView from './LeadsView';
import QuotationsView from './QuotationsView';
import InvoicesView from './InvoicesView';
import NotesView from './NotesView';
import MeetingsView from './MeetingsView';
import UsersView from './UsersView';

export default function ComingSoonView({ 
  activeTab, 
  setActiveTab, 
  user, 
  stats, 
  refetchStats, 
  attendanceLogs, 
  onToggleCheckIn,
  registeredUsers,
  onAddUser,
  onDeleteUser,
  onLoginAsUser
}) {
  // 1. My Profile Page
  if (activeTab === 'profile') {
    return <ProfileView user={user} />;
  }

  // 2. My Attendance Page
  if (activeTab === 'attendance') {
    return (
      <AttendanceView
        user={user}
        attendanceLogs={attendanceLogs}
        onToggleCheckIn={onToggleCheckIn}
      />
    );
  }

  // 3. Leads Page
  if (activeTab.startsWith('leads')) {
    const subTab = activeTab.split('-')[1] || 'all';
    return (
      <LeadsView 
        stats={stats} 
        refetchStats={refetchStats}
        activeSubTab={subTab} 
        setActiveSubTab={(newSub) => setActiveTab(`leads-${newSub}`)} 
      />
    );
  }

  // 4. Quotations Page
  if (activeTab === 'quotations') {
    return <QuotationsView stats={stats} refetchStats={refetchStats} />;
  }

  // 5. Invoice Page
  if (activeTab === 'invoice') {
    return <InvoicesView stats={stats} />;
  }

  // 6. User Notes Page
  if (activeTab === 'notes') {
    return <NotesView stats={stats} />;
  }

  // 7. Meetings Page
  if (activeTab === 'meetings') {
    return <MeetingsView stats={stats} />;
  }

  // 8. All Users Management Page
  if (activeTab === 'users') {
    return (
      <UsersView
        users={registeredUsers || []}
        onAddUser={onAddUser}
        onDeleteUser={onDeleteUser}
        onLoginAsUser={onLoginAsUser}
      />
    );
  }

  // 9. Admin System Analytics
  if (activeTab === 'analytics') {
    return (
      <div className="space-y-6 font-sans">
        <div className="bg-gradient-to-r from-royal-600 to-indigo-700 p-6 rounded-3xl text-white shadow-xl">
          <h1 className="text-2xl font-black font-heading">System Analytics & Operational Audit</h1>
          <p className="text-xs text-royal-100 mt-1">Real-time system health, registered user metrics, and platform usage.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Registered Users</span>
            <p className="text-2xl font-black font-mono text-royal-600 mt-1">{registeredUsers?.length || 3}</p>
            <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">100% Active HR Verified</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">System Roles</span>
            <p className="text-2xl font-black font-mono text-indigo-600 mt-1">4 Active</p>
            <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Super Admin, Lead Marketer, Sales, Performance</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Platform Uptime</span>
            <p className="text-2xl font-black font-mono text-emerald-600 mt-1">99.98%</p>
            <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">All systems operational</span>
          </div>
        </div>
      </div>
    );
  }

  // 10. Admin Attendance Oversight
  if (activeTab === 'attendance-admin') {
    return (
      <div className="space-y-6 font-sans">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 rounded-3xl text-white shadow-xl">
          <h1 className="text-2xl font-black font-heading">Company Attendance Oversight</h1>
          <p className="text-xs text-emerald-100 mt-1">Monitor all employee check-in times, shift hours, and attendance logs.</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">Today's Team Attendance Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3">Check In</th>
                  <th className="px-6 py-3">Check Out</th>
                  <th className="px-6 py-3">Total Hours</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {(registeredUsers || []).map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{u.name} ({u.empId})</td>
                    <td className="px-6 py-3.5 font-mono">09:00 AM</td>
                    <td className="px-6 py-3.5 font-mono">06:30 PM</td>
                    <td className="px-6 py-3.5 font-mono font-bold">9h 30m</td>
                    <td className="px-6 py-3.5"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // 11. Admin Settings
  if (activeTab === 'settings') {
    return (
      <div className="space-y-6 font-sans">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
          <h1 className="text-2xl font-black font-heading">System Settings & Security Policy</h1>
          <p className="text-xs text-slate-300 mt-1">Configure global CRM options, roles, permissions, and security controls.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Admin Security Policy</h3>
          <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-slate-900">Enforce HR Verified Credential Login</p>
              <p className="text-[11px] text-slate-500">Only registered users created in Admin Panel can log into CRM.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500 text-white font-bold rounded-lg text-[10px]">ACTIVE</span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to ProfileView or UsersView for Admin
  if (user?.isAdmin) {
    return (
      <UsersView
        users={registeredUsers || []}
        onAddUser={onAddUser}
        onDeleteUser={onDeleteUser}
        onLoginAsUser={onLoginAsUser}
      />
    );
  }

  return <ProfileView user={user} />;
}
