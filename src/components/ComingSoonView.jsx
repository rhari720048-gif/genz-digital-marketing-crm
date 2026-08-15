import React from 'react';
import ProfileView from './ProfileView';
import AttendanceView from './AttendanceView';
import LeadsView from './LeadsView';
import QuotationsView from './QuotationsView';
import InvoicesView from './InvoicesView';
import NotesView from './NotesView';
import MeetingsView from './MeetingsView';

export default function ComingSoonView({ activeTab, setActiveTab, user, stats, refetchStats, attendanceLogs, onToggleCheckIn }) {
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

  // Fallback to ProfileView
  return <ProfileView user={user} />;
}
