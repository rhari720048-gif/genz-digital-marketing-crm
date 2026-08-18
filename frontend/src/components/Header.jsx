import React, { useState, useEffect } from 'react';
import { LogIn, UserCheck, Clock, Menu, X, Sun, Power, CheckCircle2 } from 'lucide-react';

export default function Header({ user, onToggleCheckIn, onOpenAttendanceModal, isMobileMenuOpen, onToggleMobileMenu, onLogout }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] transition-all">
      {/* Main AppBar Container */}
      <div className="px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Left Side: Drawer Menu Button + Logo Emblem */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          
          {/* Drawer Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-50 hover:bg-royal-50 border border-slate-200/60 text-slate-700 hover:text-royal-600 transition-all active:scale-95 cursor-pointer"
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-slate-800" /> : <Menu className="w-4 h-4 text-slate-800" />}
          </button>

          {/* Logo Image & Subtext Branding */}
          <div className="flex flex-col items-start justify-center cursor-pointer group shrink-0">
            <img 
              src="/genz-logo.png" 
              alt="GEN-Z Marketing CRM" 
              className="h-7 sm:h-8 max-h-8 w-auto object-contain shrink-0 group-hover:opacity-90 transition-opacity"
              style={{ height: '28px', maxHeight: '30px' }}
            />
            <div className="-mt-0.5 leading-none font-heading tracking-tight">
              <span className="text-xs sm:text-sm font-extrabold text-royal-600 tracking-wide">
                Marketing CRM
              </span>
            </div>
          </div>

        </div>

        {/* CENTER: Desktop Greeting & Live Clock Pills */}
        <div className="hidden md:flex items-center space-x-2">
          
          {/* Greeting Pill */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-50/50 border border-slate-150 text-xs font-semibold text-slate-800">
            <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              {user?.isAdmin ? (
                <span className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-royal-50 text-royal-700 border border-royal-100 text-[9px] font-extrabold font-mono tracking-wider uppercase">ADMIN PORTAL</span>
                  <span className="font-bold text-slate-750">System Administrator</span>
                </span>
              ) : (
                <>Welcome back, <strong className="text-royal-650 font-bold font-heading">{firstName}</strong></>
              )}
            </span>
          </div>

          {/* Live Clock & Date Pill */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-50/50 border border-slate-150 text-xs">
            <Clock className="w-3.5 h-3.5 text-royal-600 shrink-0" />
            <span className="font-mono font-bold text-royal-600">{formattedTime}</span>
            <span className="text-slate-300">•</span>
            <span className="font-mono text-slate-500 text-[11px]">{formattedDate}</span>
          </div>

        </div>

        {/* Right Side: Action Pills */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* Status Badge & Check In Button (Only shown for Non-Admin Employees) */}
          {!user?.isAdmin && (
            <>
              {/* Status Badge */}
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-150 text-[11px] font-bold text-slate-750">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  user?.isCheckedIn ? 'bg-emerald-500 animate-pulse' : 
                  user?.hasCheckedOutToday ? 'bg-slate-400' : 'bg-amber-500'
                }`} />
                <span className="font-mono">
                  {user?.isCheckedIn ? 'On Shift' : user?.hasCheckedOutToday ? 'Shift Completed' : 'Off Shift'}
                </span>
              </div>

              {/* Check In Action Button */}
              <button
                onClick={onToggleCheckIn}
                disabled={!user?.isCheckedIn && user?.hasCheckedOutToday}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer ${
                  user?.isCheckedIn
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : user?.hasCheckedOutToday
                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-80 border border-slate-200'
                    : 'bg-royal-600 hover:bg-royal-700 text-white shadow-sm'
                }`}
              >
                {user?.isCheckedIn ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs">Checked In (Click Out)</span>
                  </>
                ) : user?.hasCheckedOutToday ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs">Shift Done Today</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs">Check In</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Sign Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer active:scale-95"
              title="Sign Out"
            >
              <Power className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}

        </div>

      </div>

      {/* MOBILE SUB-BAR: Greeting, Live Clock & Date (< md screens) */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2 bg-white border-t border-slate-100 text-[11px]">
        <div className="flex items-center space-x-1.5 text-slate-750 font-semibold">
          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Welcome, <strong className="text-royal-600 font-bold">{firstName}</strong></span>
        </div>
        <div className="flex items-center space-x-1.5 font-mono text-[10px]">
          <span className="font-bold text-royal-650">{formattedTime}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">{formattedDate}</span>
        </div>
      </div>

    </header>
  );
}
