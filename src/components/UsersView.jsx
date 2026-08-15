import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  UserCheck, 
  Lock, 
  Eye, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  X, 
  Activity, 
  BadgeCheck, 
  KeyRound, 
  Briefcase, 
  Heart, 
  Sparkles,
  PhoneCall
} from 'lucide-react';

export default function UsersView({ users, onAddUser, onDeleteUser, onUpdateUser, onLoginAsUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Form State for Add User Modal (Matches ALL 14 Profile Fields)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    empId: `GNX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    role: 'Marketing Executive',
    department: 'Marketing Strategy & Leads',
    manager: 'Vikram Sharma (VP of Growth)',
    joiningDate: new Date().toISOString().split('T')[0],
    location: 'Chennai Tech Park / Hybrid',
    address: 'Suite 402, Neural Tower, OMR Tech Corridor, Chennai, TN - 600096',
    emergencyContact: '+91 98765 12345 (Family)',
    bloodGroup: 'O+ Positive',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUserSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      showToast('Error: Full Name, Email, and Password are required!');
      return;
    }

    const newUser = {
      id: Date.now(),
      ...formData,
      joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 March 2024'
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
    showToast(`User ${newUser.name} created successfully! Enabled for instant login.`);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      password: '',
      mobile: '',
      empId: `GNX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'Marketing Executive',
      department: 'Marketing Strategy & Leads',
      manager: 'Vikram Sharma (VP of Growth)',
      joiningDate: new Date().toISOString().split('T')[0],
      location: 'Chennai Tech Park / Hybrid',
      address: 'Suite 402, Neural Tower, OMR Tech Corridor, Chennai, TN - 600096',
      emergencyContact: '+91 98765 12345 (Family)',
      bloodGroup: 'O+ Positive',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    });
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.empId && u.empId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.mobile && u.mobile.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDept = deptFilter === 'all' || u.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const departmentsList = Array.from(new Set(users.map(u => u.department).filter(Boolean)));

  return (
    <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-8">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-royal-500/30 flex items-center space-x-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* 1. HEADER BANNER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gradient-to-r from-royal-600 via-royal-700 to-royal-800 p-5 sm:p-6 rounded-3xl border border-royal-500/30 shadow-xl text-white">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
            Team User Management & Credential Provisioning
          </h1>
          <p className="text-xs sm:text-sm text-royal-100 mt-1 font-medium">
            Create, manage, and configure login credentials for CRM team members.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 flex items-center space-x-3 min-w-[130px]">
            <div className="p-2 rounded-xl bg-white/20 text-white">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-royal-200 uppercase">Total Users</p>
              <p className="text-sm font-black font-mono text-white">{users.length}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 flex items-center space-x-3 min-w-[130px]">
            <div className="p-2 rounded-xl bg-emerald-400/20 text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-royal-200 uppercase">HR Verified</p>
              <p className="text-sm font-black font-mono text-emerald-300">{users.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABLE ACTIONS & SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-85">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, employee ID, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-royal-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          
          <div className="flex items-center justify-between sm:justify-start space-x-1.5 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200/60 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-600 font-bold">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departmentsList.map((d, idx) => (
                <option key={idx} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 active:scale-95 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>

        </div>
      </div>

      {/* 3. USERS DIRECTORY TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Emp ID & Role</th>
                <th className="px-6 py-4">Department & Location</th>
                <th className="px-6 py-4">Login Credentials</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredUsers.map((u) => (
                <tr key={u.id || u.empId} className="hover:bg-slate-50/50 transition-colors">
                  
                  {/* User Details */}
                  <td className="px-6 py-4.5">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
                        alt={u.name} 
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-royal-500/20 shadow-2xs" 
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-slate-900">{u.name}</span>
                          <BadgeCheck className="w-3.5 h-3.5 text-royal-600" />
                        </div>
                        <span className="text-xs text-slate-400 font-mono">{u.mobile}</span>
                      </div>
                    </div>
                  </td>

                  {/* Emp ID & Role */}
                  <td className="px-6 py-4.5">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs font-extrabold text-royal-700">{u.empId}</span>
                      <span className="text-xs font-bold text-slate-800">{u.role}</span>
                    </div>
                  </td>

                  {/* Dept & Location */}
                  <td className="px-6 py-4.5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{u.department}</span>
                      <span className="text-[11px] text-slate-500">{u.location}</span>
                    </div>
                  </td>

                  {/* Credentials */}
                  <td className="px-6 py-4.5">
                    <div className="flex flex-col space-y-0.5">
                      <div className="flex items-center space-x-1 text-xs font-mono font-bold text-slate-800">
                        <Mail className="w-3 h-3 text-royal-600" />
                        <span className="truncate max-w-[180px]">{u.email}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] font-mono text-emerald-600 font-bold">
                        <KeyRound className="w-3 h-3 text-emerald-500" />
                        <span>Pass: {u.password || '••••••••'}</span>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4.5 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      
                      <button
                        onClick={() => setViewingUser(u)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-royal-600 hover:bg-royal-50 transition-colors"
                        title="View Full Digital Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {onLoginAsUser && (
                        <button
                          onClick={() => onLoginAsUser(u)}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-royal-50 text-royal-700 hover:bg-royal-100 transition-colors border border-royal-200/60"
                          title="Switch Login to User"
                        >
                          Switch
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${u.name}?`)) {
                            onDeleteUser(u.id || u.empId);
                            showToast(`User ${u.name} removed.`);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-600">No matching team users found.</p>
                    <p className="text-xs mt-0.5 text-slate-400">Click "Add User" above to create a new team member.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ADD USER MODAL (COMPACT & SLEEK FORM) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-5 shadow-2xl border border-slate-100 animate-fadeIn space-y-3.5 max-h-[88vh] flex flex-col my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-royal-100 text-royal-700">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black font-heading text-slate-900">
                    Add New Team Member & Provisions
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Fill in profile details & assign instant login credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateUserSubmit} className="space-y-3 overflow-y-auto pr-1 flex-1">
              
              {/* SECTION A: Primary Credentials (Name, Email, Password, Mobile) */}
              <div className="p-3 rounded-xl bg-royal-50/50 border border-royal-100/80 space-y-2">
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-royal-700">
                  <KeyRound className="w-3 h-3 text-royal-600" />
                  <span>LOGIN CREDENTIALS & PERSONAL IDENTITY</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                      Work Email Address (Login ID) *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="e.g. alex.m@genzneuralx.io"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                      Login Password *
                    </label>
                    <input
                      type="text"
                      name="password"
                      required
                      placeholder="e.g. alex123"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                      Mobile Phone Number *
                    </label>
                    <input
                      type="text"
                      name="mobile"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION B: Employment Matrix Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Employee ID Number
                  </label>
                  <input
                    type="text"
                    name="empId"
                    value={formData.empId}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    required
                    placeholder="e.g. Head of Growth Marketing"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Department
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500 font-bold"
                  >
                    <option value="Marketing Strategy & Leads">Marketing Strategy & Leads</option>
                    <option value="Performance Marketing">Performance Marketing</option>
                    <option value="Sales & Conversions">Sales & Conversions</option>
                    <option value="Client Success & Accounts">Client Success & Accounts</option>
                    <option value="HR & Operations">HR & Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Reporting Manager
                  </label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Work Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                </div>

              </div>

              {/* SECTION C: Personal & Emergency Records */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    placeholder="e.g. +91 98765 12345 (Family)"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500 font-bold"
                  >
                    <option value="O+ Positive">O+ Positive</option>
                    <option value="A+ Positive">A+ Positive</option>
                    <option value="B+ Positive">B+ Positive</option>
                    <option value="AB+ Positive">AB+ Positive</option>
                    <option value="O- Negative">O- Negative</option>
                    <option value="A- Negative">A- Negative</option>
                    <option value="B- Negative">B- Negative</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                </div>

              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-royal-600 hover:bg-royal-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Register & Create User</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 5. VIEW USER FULL PROFILE MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 animate-fadeIn space-y-5 my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <img src={viewingUser.avatar} alt={viewingUser.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-royal-500/40" />
                <div>
                  <h3 className="text-lg font-black font-heading text-slate-900">{viewingUser.name}</h3>
                  <p className="text-xs text-royal-600 font-bold">{viewingUser.role}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Employee ID</span>
                <p className="font-mono font-black text-slate-900 mt-0.5">{viewingUser.empId}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mobile Phone</span>
                <p className="font-mono font-black text-slate-900 mt-0.5">{viewingUser.mobile}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Work Email (Login ID)</span>
                <p className="font-mono font-black text-slate-900 mt-0.5">{viewingUser.email}</p>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Login Password</span>
                <p className="font-mono font-black text-emerald-900 mt-0.5">{viewingUser.password || '••••••••'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingUser.department}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Reporting Manager</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingUser.manager}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Date of Joining</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{viewingUser.joiningDate}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Work Location</span>
                <p className="font-bold text-slate-900 mt-0.5">{viewingUser.location}</p>
              </div>

              <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">
                <span className="text-[10px] font-bold text-rose-500 uppercase">Emergency Contact</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{viewingUser.emergencyContact}</p>
              </div>

              <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100">
                <span className="text-[10px] font-bold text-rose-500 uppercase">Blood Group</span>
                <p className="font-mono font-bold text-slate-900 mt-0.5">{viewingUser.bloodGroup}</p>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Residential Address</span>
                <p className="font-bold text-slate-800 mt-0.5">{viewingUser.address}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingUser(null)}
                className="px-5 py-2 bg-royal-600 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
