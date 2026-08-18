import React, { useState, useEffect } from 'react';
import { 
  Target, 
  PhoneCall, 
  XCircle, 
  Briefcase, 
  CheckCircle2, 
  StickyNote, 
  Calendar, 
  FolderKanban, 
  Users,
  LayoutDashboard,
  Clock,
  Sparkles,
  RefreshCw,
  Video,
  MapPin,
  Building,
  UserCheck
} from 'lucide-react';
import { getApiUrl } from '../apiConfig';
import { formatDateDDMMYYYY } from '../utils/dateFormatter';

export default function DashboardView({ user }) {
  const [stats, setStats] = useState({
    allLeads: 0,
    followups: 0,
    canceledLeads: 0,
    clients: 0,
    completedCustomers: 0,
    notes: 0,
    meetings: 0,
    documents: 0,
    users: 0,
    upcomingMeetings: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      // 1. Fetch lightweight database stats from the backend
      const res = await fetch(getApiUrl(`/api/dashboard/stats?email=${encodeURIComponent(user?.email || '')}&_t=${Date.now()}`));
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh stats every 8 seconds for real-time accuracy
    const timer = setInterval(() => {
      fetchStats();
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  const isAdmin = user?.isAdmin || user?.role === 'Super Admin';

  const statCards = [
    {
      title: 'All Leads',
      value: stats.allLeads,
      icon: Target,
      color: 'from-blue-500 to-indigo-600',
      description: 'Incoming prospect pipeline'
    },
    {
      title: 'Follow-ups',
      value: stats.followups,
      icon: PhoneCall,
      color: 'from-amber-500 to-orange-600',
      description: 'Active scheduled callbacks'
    },
    {
      title: 'Canceled Leads',
      value: stats.canceledLeads,
      icon: XCircle,
      color: 'from-rose-500 to-red-600',
      description: 'Lost deals / prospects'
    },
    {
      title: 'Clients',
      value: stats.clients,
      icon: Briefcase,
      color: 'from-violet-500 to-purple-600',
      description: 'Signed service contracts'
    },
    {
      title: 'Completed Customers',
      value: stats.completedCustomers,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-teal-600',
      description: 'Successfully delivered accounts'
    },
    {
      title: 'User Notes',
      value: stats.notes,
      icon: StickyNote,
      color: 'from-sky-500 to-blue-600',
      description: 'Stored strategic notes'
    },
    {
      title: 'Meetings',
      value: stats.meetings,
      icon: Calendar,
      color: 'from-pink-500 to-rose-600',
      description: 'Scheduled conferences'
    },
    {
      title: 'Documents',
      value: stats.documents,
      icon: FolderKanban,
      color: 'from-indigo-500 to-blue-600',
      description: 'Uploaded official records'
    }
  ];

  if (isAdmin) {
    statCards.splice(1, 0, {
      title: 'Registered Users',
      value: stats.users,
      icon: Users,
      color: 'from-royal-600 to-royal-800',
      description: 'Total active employees'
    });
  }

  return (
    <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-8 overflow-y-auto">
      
      {/* 1. HEADER HERO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-royal-600 text-white shadow-md shadow-royal-600/20 shrink-0">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
              Dashboard
            </h1>
          </div>
        </div>

        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Stats'}</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-2">
          <Clock className="w-8 h-8 text-royal-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold">Loading stats dashboard...</p>
        </div>
      ) : (
        <>
          {/* 2. STATS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between group hover:shadow-md hover:border-slate-300 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Subtle Background Accent Gradient Blob */}
                  <div className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-br ${card.color} opacity-[0.03] group-hover:scale-125 transition-transform duration-500`} />

                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-sans">{card.title}</span>
                    <p className="text-2xl font-black font-heading text-slate-900 tracking-tight">{card.value}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">{card.description}</p>
                  </div>

                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shrink-0 shadow-lg shadow-royal-500/10 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. DYNAMIC PANEL LAYOUT */}
          <div className="w-full">
            
            {/* Scheduled Upcoming Meetings (Full Width) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[280px]">
              <div>
                <h3 className="text-sm font-black font-heading text-slate-900 border-b border-slate-100 pb-2.5 flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-royal-600 shrink-0" />
                  <span>Upcoming Scheduled Meetings</span>
                </h3>

                <div className="mt-3.5 space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
                  {stats.upcomingMeetings.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-semibold">No upcoming meetings scheduled</p>
                    </div>
                  ) : (
                    stats.upcomingMeetings.map((m) => (
                      <div 
                        key={m.id} 
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 text-xs font-sans hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            m.type === 'Online' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {m.type === 'Online' ? <Video className="w-4 h-4" /> : <Building className="w-4 h-4" />}
                          </div>

                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-950 truncate" title={m.title}>{m.title}</p>
                            <p className="text-[10px] text-slate-500 font-semibold truncate mt-0.5" title={`Client: ${m.client}`}>Client: {m.client}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex flex-col items-end space-y-0.5">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-mono text-[10px] font-black border border-amber-200/60 shadow-2xs">
                            {formatDateDDMMYYYY(m.date)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono font-bold pr-0.5">{m.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
