import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
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
  Pencil, 
  CheckCircle2, 
  X, 
  BadgeCheck, 
  KeyRound, 
  Power,
  PowerOff,
  UserX,
  UserCheck2
} from 'lucide-react';

export default function UsersView({ users, onAddUser, onDeleteUser, onUpdateUser, onToggleUserStatus, onLoginAsUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  // Form State for Add User Modal
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
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    status: 'Active'
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
      status: 'Active',
      joiningDate: formData.joiningDate ? new Date(formData.joiningDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '15 March 2024'
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
    showToast(`User ${newUser.name} registered successfully! Enabled for instant login.`);
    
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
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      status: 'Active'
    });
  };

  const handleEditUserSubmit = (e) => {
    e.preventDefault();
    if (!editingUser.name.trim() || !editingUser.email.trim()) {
      showToast('Error: Name and Email cannot be empty!');
      return;
    }

    onUpdateUser(editingUser);
    showToast(`User ${editingUser.name} details updated!`);
    setEditingUser(null);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.empId && u.empId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.mobile && u.mobile.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDept = deptFilter === 'all' || u.department === deptFilter;
    const userStatus = u.status || 'Active';
    const matchesStatus = statusFilter === 'all' || userStatus === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const departmentsList = Array.from(new Set(users.map(u => u.department).filter(Boolean)));

  return (
    <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-8">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-5 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-royal-500/40 flex items-center space-x-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gradient-to-r from-royal-600 via-royal-700 to-indigo-800 p-5 sm:p-6 rounded-3xl border border-royal-500/30 shadow-xl text-white">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
            Team & Employee Management
          </h1>
          <p className="text-xs sm:text-sm text-royal-100 mt-1 font-medium">
            Manage users, view profile details, edit credentials, and enable/disable login access.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-white text-royal-700 hover:bg-royal-50 font-black text-xs flex items-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-royal-600" />
            <span>+ Add New Employee</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, emp ID, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-royal-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Dept Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 shrink-0">
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

          {/* Status Filter */}
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/60 shrink-0">
            <span className="text-xs text-slate-600 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">🟢 Active Only</option>
              <option value="Inactive">🔴 Inactive (Disabled)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ALL USERS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black font-heading text-slate-900">
            Registered CRM Employees ({filteredUsers.length})
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Actions: View • Edit • Delete • Active/Inactive Switch
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">User Details</th>
                <th className="px-5 py-3.5">Emp ID & Role</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Login Credentials</th>
                <th className="px-5 py-3.5 text-center">Account Status</th>
                <th className="px-5 py-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredUsers.map((u) => {
                const isUserActive = (u.status || 'Active') === 'Active';

                return (
                  <tr key={u.id || u.empId} className="hover:bg-slate-50/50 transition-colors">
                    
                    {/* User Details */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'} 
                          alt={u.name} 
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-royal-500/20 shadow-2xs shrink-0" 
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
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs font-extrabold text-royal-700">{u.empId}</span>
                        <span className="text-xs font-bold text-slate-800">{u.role}</span>
                      </div>
                    </td>

                    {/* Dept */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">{u.department}</span>
                        <span className="text-[11px] text-slate-500">{u.location}</span>
                      </div>
                    </td>

                    {/* Credentials */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center space-x-1 text-xs font-mono font-bold text-slate-800">
                          <Mail className="w-3 h-3 text-royal-600 shrink-0" />
                          <span className="truncate max-w-[160px]">{u.email}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[11px] font-mono text-emerald-600 font-bold">
                          <KeyRound className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>Pass: {u.password || '••••••••'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Account Status Badge */}
                    <td className="px-5 py-4 text-center">
                      {isUserActive ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center space-x-1">
                          <UserCheck2 className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center space-x-1">
                          <UserX className="w-3 h-3 text-rose-600" />
                          <span>Inactive (Blocked)</span>
                        </span>
                      )}
                    </td>

                    {/* Actions Column (View, Edit, Delete, Active/Inactive Toggle) */}
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        
                        {/* VIEW */}
                        <button
                          onClick={() => setViewingUser(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-royal-600 hover:bg-royal-50 transition-colors"
                          title="View Full User Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* EDIT */}
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Edit User Info"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* ACTIVE / INACTIVE TOGGLE BUTTON */}
                        {onToggleUserStatus && (
                          <button
                            onClick={() => onToggleUserStatus(u.id || u.empId)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border transition-all flex items-center space-x-1 cursor-pointer active:scale-95 ${
                              isUserActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                            }`}
                            title={isUserActive ? "Click to Deactivate Login" : "Click to Activate Login"}
                          >
                            {isUserActive ? (
                              <>
                                <Power className="w-3 h-3 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <PowerOff className="w-3 h-3 text-rose-600" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        )}

                        {/* DELETE */}
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
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-bold text-slate-600">No matching team users found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-fadeIn space-y-4 max-h-[90vh] flex flex-col my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-royal-100 text-royal-700">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading text-slate-900">Add New CRM Employee</h3>
                  <p className="text-[11px] text-slate-500">Create login credentials and digital profile for team member.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Work Email (Login ID) *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="rahul@genzneuralx.io"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Password *
                  </label>
                  <input
                    type="text"
                    name="password"
                    required
                    placeholder="Set Login Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Job Role / Designation
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-royal-500"
                  />
                </div>
              </div>

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

      {/* EDIT USER MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-fadeIn space-y-4 max-h-[90vh] flex flex-col my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black font-heading text-slate-900">Edit User: {editingUser.name}</h3>
                  <p className="text-[11px] text-slate-500">Update employee details and login password.</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="space-y-3 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Work Email (Login ID)
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Password
                  </label>
                  <input
                    type="text"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Mobile Phone
                  </label>
                  <input
                    type="text"
                    value={editingUser.mobile || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, mobile: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Role / Designation
                  </label>
                  <input
                    type="text"
                    value={editingUser.role || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editingUser.department || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 flex items-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* VIEW USER FULL PROFILE MODAL */}
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
                <span className="text-[10px] font-bold text-slate-400 uppercase">Account Status</span>
                <p className={`font-extrabold mt-0.5 ${(viewingUser.status || 'Active') === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {viewingUser.status || 'Active'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingUser(null)}
                className="px-5 py-2 bg-royal-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
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
