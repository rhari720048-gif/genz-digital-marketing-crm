import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Briefcase, 
  Building, 
  Calendar, 
  UserCheck, 
  Globe, 
  Heart, 
  PhoneCall, 
  Lock, 
  ShieldCheck,
  Send,
  CheckCircle2,
  X,
  BadgeCheck,
  Copy,
  Check,
  Sparkles,
  QrCode,
  Fingerprint,
  Activity,
  Layers
} from 'lucide-react';

export default function ProfileView({ user }) {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  const profileData = {
    name: user?.name || 'Alex Morgan',
    role: user?.role || 'Head of Growth Marketing',
    empId: user?.empId || 'GNX-2026-0842',
    mobile: user?.mobile || '+91 98765 43210',
    email: user?.email || 'alex.m@genzneuralx.io',
    address: user?.address || 'Suite 402, Neural Tower, OMR Tech Corridor, Chennai, TN - 600096',
    department: user?.department || '',
    joiningDate: user?.joiningDate || '15 March 2024',
    manager: user?.manager || '',
    location: user?.location || 'Chennai Tech Park / Hybrid',
    emergencyContact: user?.emergencyContact || '+91 98765 12345 (Family)',
    bloodGroup: user?.bloodGroup || 'O+ Positive',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSendRequest = (e) => {
    e.preventDefault();
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setIsRequestModalOpen(false);
      setRequestNotes('');
    }, 2500);
  };

  return (
    <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-8">

      {/* HEADER BANNER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight flex items-center space-x-2.5">
            <User className="w-6 h-6 text-royal-600 shrink-0" />
            <span>My Profile</span>
          </h1>
        </div>
      </div>
      
      {/* 1. DIGITAL PASSPORT HEADER */}
      <div className="relative rounded-3xl bg-white p-6 sm:p-8 text-slate-900 shadow-xs border border-slate-200/80">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 text-center sm:text-left">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-royal-50 text-royal-700 border border-royal-200 font-mono">
                  {profileData.empId}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-emerald-600" />
                  <span>HR Verified</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-slate-900">
                {profileData.name}
              </h1>

              <p className="text-xs sm:text-sm font-bold text-royal-600">
                {profileData.role}
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-500">
                {profileData.department && profileData.department.trim() !== '' && (
                  <>
                    <span className="flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5 text-royal-500 shrink-0" />
                      <span>{profileData.department}</span>
                    </span>
                    <span className="hidden sm:inline text-slate-300">•</span>
                  </>
                )}
                <span className="flex items-center space-x-1">
                  <Globe className="w-3.5 h-3.5 text-royal-500 shrink-0" />
                  <span>{profileData.location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full md:w-auto flex justify-center md:justify-end">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Request Profile Correction</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DUAL-COLUMN HIGH-DENSITY DETAILS MODULE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* MODULE A: Personal Credentials Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-royal-100 text-royal-700 shadow-2xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black font-heading text-slate-900">Personal Credentials</h2>
                <p className="text-[10px] text-slate-400">Verified Contact & Identity Records</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center space-x-1">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>HR Lock</span>
            </span>
          </div>

          <div className="space-y-3">
            
            {/* Name */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border-l-4 border-l-royal-600 border border-slate-200/70 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Full Legal Name</p>
                <p className="text-xs font-black text-slate-800 mt-0.5">{profileData.name}</p>
              </div>
              <Lock className="w-3.5 h-3.5 text-slate-300" />
            </div>

            {/* Mobile Phone */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border-l-4 border-l-emerald-500 border border-slate-200/70 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mobile Phone Number</p>
                <p className="text-xs font-black text-slate-800 font-mono mt-0.5">{profileData.mobile}</p>
              </div>
              <button
                onClick={() => copyToClipboard(profileData.mobile, 'mobile')}
                className="p-1.5 rounded-lg bg-white text-slate-400 hover:text-royal-600 shadow-2xs transition-colors"
                title="Copy phone"
              >
                {copiedField === 'mobile' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Work Email */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border-l-4 border-l-indigo-500 border border-slate-200/70 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Work Email Address</p>
                <p className="text-xs font-black text-slate-800 font-mono mt-0.5 truncate max-w-[200px]">{profileData.email}</p>
              </div>
              <button
                onClick={() => copyToClipboard(profileData.email, 'email')}
                className="p-1.5 rounded-lg bg-white text-slate-400 hover:text-royal-600 shadow-2xs transition-colors"
                title="Copy email"
              >
                {copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Address */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border-l-4 border-l-sky-500 border border-slate-200/70 flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-royal-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Residential Address</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5 leading-relaxed">{profileData.address}</p>
              </div>
            </div>

            {/* Emergency & Blood */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                <p className="text-[9px] font-bold uppercase text-rose-500">Emergency Contact</p>
                <p className="text-[11px] font-bold text-slate-800 font-mono mt-0.5 break-words">{profileData.emergencyContact}</p>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100">
                <p className="text-[9px] font-bold uppercase text-rose-500">Blood Group</p>
                <p className="text-[11px] font-bold text-slate-800 font-mono mt-0.5">{profileData.bloodGroup}</p>
              </div>
            </div>

          </div>
        </div>

        {/* MODULE B: Enterprise Employment Matrix */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-royal-100 text-royal-700 shadow-2xs">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-black font-heading text-slate-900">Employment Matrix</h2>
                <p className="text-[10px] text-slate-400">Role, Department & Manager Metrics</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verified</span>
            </span>
          </div>

          <div className="space-y-3">
            
            {/* Employee ID */}
            <div className="p-3.5 rounded-2xl bg-royal-50/70 border border-royal-100 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-royal-700">Employee ID Number</p>
                <p className="text-xs font-black text-royal-900 font-mono mt-0.5">{profileData.empId}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-royal-700 border border-royal-200 font-mono">HR-VERIFIED</span>
            </div>

            {/* Role */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Designation / Role</p>
              <p className="text-xs font-black text-slate-800 mt-0.5">{profileData.role}</p>
            </div>

            {/* Department (Optional - rendered only if typed/provided) */}
            {profileData.department && profileData.department.trim() !== '' && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center space-x-3">
                <Building className="w-4 h-4 text-royal-600 shrink-0" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Department</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5">{profileData.department}</p>
                </div>
              </div>
            )}

            {/* Reporting Manager (Optional - rendered only if typed/provided) */}
            {profileData.manager && profileData.manager.trim() !== '' && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center space-x-3">
                <UserCheck className="w-4 h-4 text-royal-600 shrink-0" />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Reporting Manager</p>
                  <p className="text-xs font-black text-slate-800 mt-0.5">{profileData.manager}</p>
                </div>
              </div>
            )}

            {/* Date of Joining & Work Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Date of Joining</p>
                <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">{profileData.joiningDate}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Work Location</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5 break-words leading-tight">{profileData.location}</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Admin Request Change Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black font-heading">Request Profile Edit from Admin</h3>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {requestSent ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-1 animate-fadeIn">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold">Request Sent to Admin!</p>
                  <p className="text-[11px] text-emerald-600">Your HR administrator will review and update your employee record.</p>
                </div>
              ) : (
                <form onSubmit={handleSendRequest} className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Enter the details you want updated for employee ID <strong>{profileData.empId}</strong>.
                  </p>
                  <textarea
                    required
                    rows={3}
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="Describe requested change (e.g. Please update mobile number to +91 99887 76655)..."
                    className="w-full p-2.5 rounded-2xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRequestModalOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold flex items-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Request</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
