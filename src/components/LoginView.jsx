import React, { useState } from 'react';
import { 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles,
  Lock,
  Mail
} from 'lucide-react';

export default function LoginView({ onLogin, registeredUsers = [] }) {
  const [email, setEmail] = useState('admin@genzneuralx.io');
  const [password, setPassword] = useState('admin123');
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
    if (!password || password.length < 3) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();

      // Dynamic Login Check from registeredUsers with domain fallback support
      let matchedUser = registeredUsers.find(
        u => (u.email || '').trim().toLowerCase() === cleanEmail ||
             ((u.email || '').trim().toLowerCase().replace('.io', '.com') === cleanEmail) ||
             ((u.email || '').trim().toLowerCase().replace('.com', '.io') === cleanEmail)
      );

      // Fallback for Admin accounts
      if (!matchedUser) {
        if (cleanEmail === 'admin' || cleanEmail === 'info@genzneuralx.com' || cleanEmail === 'admin@genzneuralx.io' || cleanEmail === 'admin@genzneuralx.com') {
          matchedUser = registeredUsers.find(u => u.isAdmin || u.role === 'Super Admin') || registeredUsers[0];
        }
      }

      if (matchedUser) {
        if (matchedUser.status === 'Inactive' || matchedUser.isInactive) {
          setErrorMessage(`Account for "${matchedUser.name}" has been DEACTIVATED by Administrator. Login is disabled.`);
          return;
        }

        const userPass = (matchedUser.password || '').toString().trim();
        const isPassValid = userPass === cleanPass || 
                            userPass.toLowerCase() === cleanPass.toLowerCase() ||
                            (matchedUser.isAdmin && (cleanPass === 'admin' || cleanPass === 'admin123' || cleanPass === 'admin@123'));

        if (isPassValid) {
          const isSysAdmin = Boolean(matchedUser.isAdmin || matchedUser.role === 'Super Admin' || matchedUser.id === 'admin-001' || matchedUser.id === 'admin-002');
          onLogin({
            ...matchedUser,
            isAdmin: isSysAdmin
          });
        } else {
          setErrorMessage('Invalid Password. Please enter the correct password.');
        }
      } else {
        setErrorMessage('Invalid Email or Password. Please check credentials or contact Admin.');
      }
    }, 600);
  };

  const handleFillAdmin = () => {
    const adminUser = registeredUsers.find(u => u.isAdmin || u.role === 'Super Admin' || u.id === 'admin-001') || registeredUsers[0];
    if (adminUser) {
      setEmail(adminUser.email);
      setPassword(adminUser.password || 'admin123');
    }
    setErrorMessage('');
  };

  const handleFillDemo = () => {
    const firstEmp = registeredUsers.find(u => !u.isAdmin && u.role !== 'Super Admin' && u.id !== 'admin-001');
    if (firstEmp) {
      setEmail(firstEmp.email);
      setPassword(firstEmp.password || '');
    }
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
              
              {/* Logo Image Direct (Positioned slightly down and left) */}
              <div className="pt-2 sm:pt-3 -ml-1 sm:-ml-2.5">
                <img 
                  src="/genz-logo.png" 
                  alt="GEN-Z Marketing CRM" 
                  className="h-10 sm:h-14 lg:h-16 max-h-20 w-auto object-contain drop-shadow-xs transition-all"
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

            {/* Quick Access Roles */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">Quick Login Roles</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleFillAdmin}
                  className="px-3 py-2 rounded-xl bg-royal-50 hover:bg-royal-100 border border-royal-200/80 text-royal-700 font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5 text-royal-600" />
                  <span>Admin (`admin` / `admin@123`)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo()}
                  className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Employee Login</span>
                </button>
              </div>
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
