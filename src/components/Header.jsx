import React from 'react';
import { LogIn, UserCheck, Clock, Menu, X, BellRing, Sparkles, LogOut } from 'lucide-react';

export default function Header({ user, onToggleCheckIn, onOpenAttendanceModal, isMobileMenuOpen, onToggleMobileMenu, onLogout }) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs transition-all">
      {/* AppBar Container */}
      <div className="px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between max-w-7xl mx-auto">
        
        {/* Left Side: Flutter Drawer Menu Button + Logo Emblem */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* Drawer Menu Button */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-2xl bg-slate-100/80 hover:bg-royal-50 text-slate-700 hover:text-royal-600 transition-all active:scale-95 shadow-2xs"
            aria-label="Toggle Navigation Drawer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>

          {/* Logo Image */}
          <div className="flex items-center cursor-pointer">
            <img 
              src="/genz-logo.png" 
              alt="GEN-Z Digital Marketing CRM" 
              className="h-8 sm:h-9 w-auto object-contain drop-shadow-2xs"
            />
          </div>

        </div>

        {/* Right Side: Flutter Action Pills */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* Status Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 text-[11px] font-bold text-slate-700">
            <span className={`w-2 h-2 rounded-full ${
              user.isCheckedIn ? 'bg-emerald-500 animate-pulse' : 
              user.hasCheckedOutToday ? 'bg-slate-400' : 'bg-amber-500'
            }`} />
            <span className="font-mono">
              {user.isCheckedIn ? 'On Shift' : user.hasCheckedOutToday ? 'Shift Completed' : 'Off Shift'}
            </span>
          </div>

          {/* Check In Action Button */}
          <button
            onClick={onToggleCheckIn}
            disabled={!user.isCheckedIn && user.hasCheckedOutToday}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 active:scale-95 ${
              user.isCheckedIn
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-emerald-600/20 cursor-pointer'
                : user.hasCheckedOutToday
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed opacity-80 shadow-none border border-slate-300'
                : 'bg-gradient-to-r from-royal-600 to-royal-700 text-white shadow-royal-600/20 cursor-pointer'
            }`}
          >
            {user.isCheckedIn ? (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                <span className="text-xs">Checked In (Click Out)</span>
              </>
            ) : user.hasCheckedOutToday ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs">Shift Done Today</span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span className="text-xs">Check In</span>
              </>
            )}
          </button>

          {/* Sign Out Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer active:scale-95"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
