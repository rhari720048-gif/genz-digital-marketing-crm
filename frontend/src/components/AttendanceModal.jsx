import React from 'react';
import { X, Clock, Calendar } from 'lucide-react';

export default function AttendanceModal({ isOpen, onClose, user, attendanceLogs, onToggleCheckIn }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-white/10">
              <Clock className="w-4 h-4 text-royal-300" />
            </div>
            <div>
              <h3 className="text-sm font-black font-heading">My Attendance & Shift Logs</h3>
              <p className="text-[10px] text-slate-400">GENZ NEURAL-X Tracker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Status Box */}
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-royal-50 border border-royal-100">
            <div className="flex items-center space-x-2.5">
              <div className={`w-2.5 h-2.5 rounded-full ${
                user.isCheckedIn ? 'bg-emerald-500 animate-ping' : 
                user.hasCheckedOutToday ? 'bg-slate-400' : 'bg-amber-500'
              }`} />
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Current Status</p>
                <p className="text-xs font-black text-slate-800">
                  {user.isCheckedIn 
                    ? `Checked In (${user.checkInTime || 'Active'})` 
                    : user.hasCheckedOutToday 
                    ? `Shift Completed Today (${user.checkInTime || ''} - ${user.checkOutTime || ''})`
                    : 'Not Checked In'}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleCheckIn}
              disabled={!user.isCheckedIn && user.hasCheckedOutToday}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs ${
                user.isCheckedIn ? 'bg-amber-600 hover:bg-amber-700 cursor-pointer' :
                user.hasCheckedOutToday ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-royal-600 hover:bg-royal-700 cursor-pointer'
              }`}
            >
              {user.isCheckedIn ? 'Check Out' : user.hasCheckedOutToday ? 'Shift Done' : 'Check In'}
            </button>
          </div>

          {/* History List */}
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 font-mono mb-2">
              RECENT SHIFT LOGS
            </h4>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {attendanceLogs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg border border-slate-200 bg-white text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-royal-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{log.date}</p>
                        <p className="text-[10px] text-slate-400 font-mono">In: {log.checkIn} | Out: {log.checkOut}</p>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {log.hours}
                    </span>
                  </div>

                  {(log.notes || log.purpose) && (
                    <p className="text-[10px] text-slate-600 font-medium pl-5 border-l-2 border-royal-400 italic">
                      Notes: {log.notes || log.purpose}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

