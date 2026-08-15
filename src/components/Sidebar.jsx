import React, { useState, useEffect } from 'react';
import { 
  User, 
  Clock, 
  Target, 
  FileText, 
  Receipt, 
  StickyNote, 
  Calendar, 
  ChevronRight,
  ChevronDown,
  PhoneCall,
  XCircle,
  Briefcase,
  Users,
  CheckCircle2,
  X,
  Sparkles,
  Zap,
  LayoutDashboard,
  Plus,
  Minus
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, stats, user, isOpenMobile, onCloseMobile }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedMenus, setExpandedMenus] = useState({
    leads: false
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const menuItems = [
    {
      id: 'profile',
      label: '1. My Profile',
      icon: User
    },
    {
      id: 'attendance',
      label: '2. My Attendance',
      icon: Clock,
      badge: user?.isCheckedIn ? 'Checked In' : null
    },
    {
      id: 'leads',
      label: '3. Leads',
      icon: Target,
      subItems: [
        { id: 'leads-all', label: 'All Leads', icon: Target },
        { id: 'leads-followups', label: 'Follow-ups', icon: PhoneCall },
        { id: 'leads-canceled', label: 'Canceled Leads', icon: XCircle },
        { id: 'leads-client', label: 'Clients', icon: Briefcase },
        { id: 'leads-completed', label: 'Completed Customers', icon: CheckCircle2 }
      ]
    },
    {
      id: 'quotations',
      label: '4. Quotations',
      icon: FileText
    },
    {
      id: 'invoice',
      label: '5. Invoice',
      icon: Receipt
    },
    {
      id: 'notes',
      label: '6. User Notes',
      icon: StickyNote
    },
    {
      id: 'meetings',
      label: '7. Meetings',
      icon: Calendar
    }
  ];

  const handleSelect = (item) => {
    if (item.subItems) {
      setActiveTab(item.subItems[0].id);
    } else {
      setActiveTab(item.id);
    }
    if (onCloseMobile) onCloseMobile();
  };

  const toggleExpand = (itemId) => {
    setExpandedMenus(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (< lg screens) */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30 h-screen lg:h-[calc(100vh-4rem)] w-72 lg:w-60 bg-white border-r border-slate-200 p-4 lg:p-3 flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-4 overflow-y-auto pr-0.5">
          
          {/* USER CARD IN SIDEBAR */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            
            {/* Mobile Close Header */}
            <div className="flex items-center justify-between lg:hidden pb-1 border-b border-slate-200">
              <span className="text-[10px] font-black font-mono text-royal-700 uppercase">GENZ NEURAL-X</span>
              <button onClick={onCloseMobile} className="p-1 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Top Compact User Row */}
            <div className="flex items-center space-x-2.5">
              <div className="relative shrink-0">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                  alt={user?.name || 'Alex Morgan'}
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-royal-500/20"
                />
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user?.isCheckedIn ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black font-heading text-slate-900 truncate leading-none">
                  {user?.name || 'Alex Morgan'}
                </h3>
                <p className="text-[10px] font-bold text-royal-600 truncate mt-1 leading-none">
                  {user?.role || 'Head of Growth Marketing'}
                </p>
              </div>
            </div>

            {/* Shift & Clock Status */}
            <div className="p-2 rounded-xl bg-white border border-slate-200/70 space-y-1 text-[10px]">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="truncate">{user?.greeting || 'Good Morning'}</span>
                </span>
                <span className="font-mono font-black text-royal-600">{formattedTime}</span>
              </div>

              <div className="flex items-center space-x-1 font-mono text-[9px] text-slate-500 pt-1 border-t border-slate-100">
                <Clock className="w-3 h-3 text-royal-500 shrink-0" />
                <span>{formattedDate}</span>
              </div>
            </div>

          </div>

          {/* MENU MODULES NAVIGATION */}
          <nav className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 pb-1 font-mono">
              Menu Modules
            </p>
            
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isMainActive = activeTab === item.id || (item.subItems && activeTab.startsWith(item.id));
              const isExpanded = expandedMenus[item.id];
              const ChevronIcon = item.subItems ? (isExpanded ? ChevronDown : ChevronRight) : ChevronRight;

              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => handleSelect(item)}
                    className={`w-full h-10 group relative flex items-center justify-between px-2.5 rounded-xl transition-all duration-200 ${
                      isMainActive
                        ? 'bg-gradient-to-r from-royal-600 to-royal-800 text-white shadow-xs ring-1 ring-royal-400/30 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-royal-600 border border-transparent'
                    }`}
                  >
                    {/* Active Indicator Left Accent Bar */}
                    {isMainActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full shadow-xs" />
                    )}

                    <div className="flex items-center space-x-2.5 min-w-0 pr-1">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-md shrink-0 transition-colors ${
                        isMainActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-royal-100 group-hover:text-royal-600'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <p className={`text-xs font-bold leading-none truncate ${
                        isMainActive ? 'text-white font-black' : 'text-slate-800 group-hover:text-royal-700'
                      }`}>
                        {item.label}
                      </p>
                    </div>

                    {/* Count badge & Custom Handcrafted Toggle Pill (Shown ONLY when Leads is active) */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono ${
                          isMainActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      {item.subItems && isMainActive && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(item.id);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 text-[10px] font-bold font-mono transition-all flex items-center space-x-1 cursor-pointer active:scale-95 shadow-2xs"
                          title={isExpanded ? "Collapse sub-menu" : "Expand sub-menu"}
                        >
                          <span>{isExpanded ? 'Less' : 'More'}</span>
                          {isExpanded ? <Minus className="w-3 h-3 shrink-0" /> : <Plus className="w-3 h-3 shrink-0" />}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Sub-menu rendering */}
                  {item.subItems && isExpanded && (
                    <div className="pl-4 ml-3 border-l-2 border-royal-200/60 space-y-1 py-0.5 animate-fadeIn">
                      {item.subItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = activeTab === subItem.id;

                        return (
                          <button
                            key={subItem.id}
                            onClick={() => {
                              setActiveTab(subItem.id);
                              if (onCloseMobile) onCloseMobile();
                            }}
                            className={`w-full h-8 flex items-center space-x-2 px-2.5 rounded-lg text-left transition-all duration-150 ${
                              isSubActive
                                ? 'bg-royal-600 text-white font-black shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-royal-600'
                            }`}
                          >
                            <SubIcon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className={`text-[11px] truncate font-bold ${isSubActive ? 'text-white' : 'text-slate-700'}`}>{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

        </div>
      </aside>
    </>
  );
}
