import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Target, 
  FileText, 
  Clock, 
  Calendar,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function LoginView({ onLogin }) {
  const [email, setEmail] = useState('alex.m@genzneuralx.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail / Work Email address');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Alex Morgan'
      });
    }, 700);
  };

  const handleFillDemo = () => {
    setEmail('alex.m@genzneuralx.io');
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-royal-500 selection:text-white font-sans">
      
      {/* Top Subtle Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center space-x-2 border-b border-slate-800">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-royal-500/30 text-royal-300 border border-royal-400/30">
          v2.4 Live
        </span>
        <span className="truncate">GENZ Neural-X Marketing CRM • Enterprise Revenue Platform</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 hidden sm:inline" />
      </div>

      {/* Main Split Screen Grid Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-4 sm:p-6 lg:p-12 items-center">
        
        {/* LEFT COLUMN: Brand, Welcome & App Features */}
        <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-6">
          
          {/* Logo & Brand Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-3 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-2xl shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-royal-700 via-royal-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-royal-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black font-mono tracking-wider text-slate-900 leading-none">
                  NEURAL-X
                </span>
                <span className="text-[10px] font-bold text-royal-600 tracking-widest uppercase mt-0.5 leading-none">
                  MARKETING CRM
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading tracking-tight text-slate-900 leading-tight">
                Accelerate Leads & Revenue <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-royal-600 via-indigo-600 to-royal-800">
                  With Neural-X CRM
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed max-w-xl">
                Streamline sales pipelines, convert prospects to active clients, issue Instant Rupee (₹) Invoices, and track real-time attendance in one unified workspace.
              </p>
            </div>
          </div>

          {/* CRM Core Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-royal-300 hover:bg-royal-50/40 transition-all group">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-royal-100 text-royal-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Lead Pipeline & Conversion</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Manage All Leads, Follow-ups, Canceled & Active Clients.</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-royal-300 hover:bg-royal-50/40 transition-all group">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Quotations & Rupee (₹) Invoices</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Create GST-ready Quotations & Invoices in INR currency.</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-royal-300 hover:bg-royal-50/40 transition-all group">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">1-Tap Daily Attendance</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Strict 1 Check-in limit per day with persistent session logs.</p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:border-royal-300 hover:bg-royal-50/40 transition-all group">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Client Video Meetings</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Schedule meetings with mandatory Google Meet links.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Social Proof / Security Badge */}
          <div className="flex items-center space-x-4 pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2 text-slate-600 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>256-Bit Encrypted Security</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center space-x-2 text-slate-600 text-xs font-semibold">
              <Zap className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Fast Real-Time Sync</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Modern White Login Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden">
            
            {/* Top Accent Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-royal-600 via-indigo-600 to-royal-800"></div>

            {/* Login Card Header */}
            <div className="space-y-1.5 mb-6">
              <h2 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
                Account Sign In
              </h2>
              <p className="text-xs font-medium text-slate-500">
                Enter your Gmail / Work credentials to access your portal.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2 animate-shake">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Gmail / Work Email Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 font-heading">
                  Gmail / Work Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.m@genzneuralx.io"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-600 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 font-heading">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Demo Reset: Use password "password123" to sign in.')}
                    className="text-[11px] font-bold text-royal-600 hover:text-royal-800 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-600 focus:bg-white transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-royal-600 focus:ring-royal-500/30"
                  />
                  <span className="text-xs font-semibold text-slate-600">Remember me on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-royal-600 to-royal-800 hover:from-royal-700 hover:to-royal-900 text-white font-bold font-heading text-xs shadow-md shadow-royal-600/20 hover:shadow-lg hover:shadow-royal-600/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>

            {/* Quick Demo Fill Helper Box */}
            <div className="mt-6 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1.5">
              <div className="flex items-center justify-center space-x-1.5 text-[11px] font-bold text-slate-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Demo Access Auto-Fill</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                Click below to auto-populate demo credentials:
              </p>
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-royal-600 font-mono font-bold text-[11px] hover:bg-royal-50 hover:border-royal-200 transition-all shadow-2xs"
              >
                alex.m@genzneuralx.io / password123
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-slate-100 text-center text-xs font-semibold text-slate-400">
        <p>© 2026 GENZ Neural-X Digital Marketing CRM. All Rights Reserved.</p>
      </footer>

    </div>
  );
}
