import React, { useState } from 'react';
import { 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles,
  Lock,
  Mail
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
      setErrorMessage('Please enter a valid email address');
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
    }, 600);
  };

  const handleFillDemo = () => {
    setEmail('alex.m@genzneuralx.io');
    setPassword('password123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-royal-600 selection:text-white font-sans">
      
      {/* Main Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-10 flex items-center justify-center">
        
        {/* Unified Single Floating Card in Full White Theme */}
        <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT PANEL: Light White/Royal Tinted Brand Panel */}
          <div className="lg:col-span-6 bg-gradient-to-br from-royal-50/50 via-slate-50 to-indigo-50/30 border-b lg:border-b-0 lg:border-r border-slate-100 p-6 sm:p-8 lg:p-12 flex flex-col justify-between">
            
            <div className="space-y-6 sm:space-y-8">
              
              {/* Logo Badge Container */}
              <div className="inline-flex items-center space-x-3 bg-white border border-slate-200/80 px-3.5 py-2 rounded-2xl shadow-2xs">
                <img 
                  src="/genz-logo.png" 
                  alt="GEN-Z Digital Marketing CRM" 
                  className="h-7 w-auto object-contain"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
                  Welcome to <br />
                  <span className="text-royal-600">
                    Marketing CRM
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-md">
                  Streamline your business operations, manage projects, and enhance client relationships with our advanced CRM platform.
                </p>
              </div>

              {/* 3 Checkmark Bullet Points */}
              <div className="space-y-3 pt-1">
                
                <div className="flex items-center space-x-3 text-slate-700 text-xs sm:text-sm font-semibold">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Real-time Team & Client Tracking</span>
                </div>

                <div className="flex items-center space-x-3 text-slate-700 text-xs sm:text-sm font-semibold">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Advanced Task & Project Management</span>
                </div>

                <div className="flex items-center space-x-3 text-slate-700 text-xs sm:text-sm font-semibold">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Integrated Accounting & Invoicing</span>
                </div>

              </div>

            </div>

            {/* Operational Status Pill */}
            <div className="pt-6 sm:pt-8 flex items-center space-x-2 text-xs font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>All systems operational</span>
            </div>

          </div>

          {/* RIGHT PANEL: Clean White Sign In Form */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 lg:p-12 flex flex-col justify-center space-y-6">
            
            {/* Header */}
            <div className="space-y-1">
              <h3 className="text-2xl font-black font-heading text-slate-900 tracking-tight">
                Sign In
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Enter your credentials to access the dashboard
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 font-heading">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@crm.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-600 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 font-heading">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Demo Reset: Password is "password123"')}
                    className="text-xs font-semibold text-royal-600 hover:text-royal-800 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-royal-500/20 focus:border-royal-600 focus:bg-white transition-all"
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

              {/* Remember Me */}
              <div className="flex items-center pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-royal-600 focus:ring-royal-500/30"
                  />
                  <span className="text-xs font-semibold text-slate-600">Remember me</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-royal-600 hover:bg-royal-700 active:bg-royal-800 text-white font-bold font-heading text-xs shadow-md shadow-royal-600/20 hover:shadow-lg transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In Securely</span>
                )}
              </button>

            </form>

            {/* Footer Support Text */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-[11px] font-medium text-slate-500">
                Having trouble logging in? <button onClick={handleFillDemo} className="font-bold text-royal-600 hover:underline">Auto-fill Demo Credentials</button>
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs font-medium text-slate-400">
        <p>© 2026 GENZ Neural-X Digital Marketing CRM</p>
      </footer>

    </div>
  );
}
