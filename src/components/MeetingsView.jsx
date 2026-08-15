import React, { useState } from 'react';
import { formatDateDDMMYYYY } from '../utils/dateFormatter';
import { 
  Calendar, 
  Plus, 
  Search, 
  Clock, 
  Video, 
  Users, 
  CheckCircle2, 
  Building, 
  X, 
  Sparkles,
  PhoneCall,
  Link2,
  CalendarDays,
  Edit,
  Trash2
} from 'lucide-react';

export default function MeetingsView({ stats }) {
  const [meetings, setMeetings] = useState([
    {
      id: 1,
      title: 'Apex Solutions - Contract Review & Demo',
      client: 'Apex Solutions (Rohan Sharma)',
      date: '14/08/2026',
      time: '02:30 PM',
      duration: '45 mins',
      type: 'Client Demo',
      link: 'https://meet.google.com/gnx-apex-demo',
      status: 'Scheduled'
    },
    {
      id: 2,
      title: 'Vogue Media - Social Campaign Strategy',
      client: 'Vogue Media (Priya Patel)',
      date: '14/08/2026',
      time: '04:00 PM',
      duration: '30 mins',
      type: 'Strategy Call',
      link: 'https://meet.google.com/gnx-vogue-strat',
      status: 'Scheduled'
    },
    {
      id: 3,
      title: 'Nova Tech - API Integration Technical Alignment',
      client: 'Nova Tech Ltd (Michael Chang)',
      date: '15/08/2026',
      time: '11:00 AM',
      duration: '60 mins',
      type: 'Technical Alignment',
      link: 'https://meet.google.com/gnx-novatech-sync',
      status: 'Upcoming'
    },
    {
      id: 4,
      title: 'Alpha Group - Initial Discovery Pitch',
      client: 'Alpha Group (Vikram Malhotra)',
      date: '13/08/2026',
      time: '10:30 AM',
      duration: '30 mins',
      type: 'Discovery Call',
      link: 'https://meet.google.com/gnx-alpha-pitch',
      status: 'Completed'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLink, setNewLink] = useState('');

  // Edit Meeting form state
  const [editTitle, setEditTitle] = useState('');
  const [editClient, setEditClient] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLink, setEditLink] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddMeeting = (e) => {
    e.preventDefault();
    if (!newLink.trim()) {
      showToast('Error: Google Meet Link is required!');
      return;
    }

    const finalLink = newLink.trim();
    
    // Format date string from picker (e.g. 2026-08-15) to DD/MM/YYYY
    const formattedDate = newDate ? formatDateDDMMYYYY(newDate) : 'Today';
    
    // Format 24h time string (e.g. 14:30) to 12h AM/PM format (e.g. 02:30 PM)
    let formattedTime = newTime || '03:00 PM';
    if (newTime && newTime.includes(':')) {
      const [h, m] = newTime.split(':');
      let hours = parseInt(h, 10);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      formattedTime = `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
    }

    const newM = {
      id: Date.now(),
      title: newTitle,
      client: newClient,
      date: formattedDate,
      time: formattedTime,
      duration: '30 mins',
      link: finalLink
    };

    setMeetings([newM, ...meetings]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewClient('');
    setNewDate('');
    setNewTime('');
    setNewLink('');
    showToast(`Meeting scheduled with ${newClient}!`);
  };

  const handleOpenEditMeeting = (m) => {
    setSelectedMeeting(m);
    setEditTitle(m.title || '');
    setEditClient(m.client || '');
    setEditDate('');
    setEditTime('');
    setEditLink(m.link || '');
    setIsEditModalOpen(true);
  };

  const handleEditMeetingSubmit = (e) => {
    e.preventDefault();
    if (!selectedMeeting) return;
    if (!editLink.trim()) {
      showToast('Error: Google Meet Link is required!');
      return;
    }

    const formattedDate = editDate ? formatDateDDMMYYYY(editDate) : selectedMeeting.date;
    
    let formattedTime = selectedMeeting.time;
    if (editTime && editTime.includes(':')) {
      const [h, m] = editTime.split(':');
      let hours = parseInt(h, 10);
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      formattedTime = `${hours.toString().padStart(2, '0')}:${m} ${ampm}`;
    }

    const updatedM = {
      ...selectedMeeting,
      title: editTitle,
      client: editClient,
      date: formattedDate,
      time: formattedTime,
      link: editLink.trim()
    };

    setMeetings(meetings.map(m => m.id === selectedMeeting.id ? updatedM : m));
    setIsEditModalOpen(false);
    setSelectedMeeting(null);
    showToast(`Meeting details updated successfully!`);
  };

  const handleDeleteMeeting = (id) => {
    setMeetings(meetings.filter(m => m.id !== id));
    showToast('Meeting removed from schedule.');
  };

  const handleJoinVideoCall = (m) => {
    const rawUrl = m.link && m.link.trim();
    let validUrl = rawUrl;
    if (validUrl && !validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }
    if (!validUrl) {
      validUrl = 'https://meet.google.com/new';
    }
    window.open(validUrl, '_blank', 'noopener,noreferrer');
    showToast(`Joining Google Meet call...`);
  };

  const filteredMeetings = meetings.filter(m => {
    return m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           m.client.toLowerCase().includes(searchQuery.toLowerCase());
  });

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

      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            Meetings & Client Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule sales demos, discovery calls, and virtual video meetings.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full md:w-85">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search meeting title or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-royal-500 focus:bg-white"
          />
        </div>
      </div>

      {/* MEETINGS CARDS LIST */}
      <div className="space-y-3">
        {filteredMeetings.map((m) => (
          <div 
            key={m.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold bg-gradient-to-tr from-royal-600 to-indigo-700 shadow-md">
                <Video className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 mt-0.5">{m.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  <strong>Client:</strong> {m.client}
                </p>
                <p className="text-xs text-royal-600 font-mono mt-1 font-bold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{m.date} • {m.time} ({m.duration})</span>
                </p>
                {m.link && (
                  <a 
                    href={m.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-600 font-mono mt-1 font-semibold flex items-center space-x-1 hover:underline truncate max-w-xs"
                  >
                    <Link2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{m.link}</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start md:self-center">
              <button
                onClick={() => handleOpenEditMeeting(m)}
                className="p-2.5 rounded-2xl bg-slate-50 text-slate-600 hover:bg-royal-50 hover:text-royal-600 transition-colors border border-slate-200/60 cursor-pointer shadow-2xs"
                title="Edit Meeting"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteMeeting(m.id)}
                className="p-2.5 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-200/60 cursor-pointer shadow-2xs"
                title="Delete Meeting"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleJoinVideoCall(m)}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center space-x-1.5 active:scale-95 cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Join Video Call</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SCHEDULE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-royal-400" />
                <h3 className="text-sm font-black font-heading">Schedule Client Meeting</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMeeting} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Meeting Topic / Title *</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Contract Signing & CRM Demo"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Client / Company Name *</label>
                <input
                  required
                  type="text"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  placeholder="e.g. Apex Solutions"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Date *</label>
                  <input
                    required
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Time *</label>
                  <input
                    required
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Google Meet Link *</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="url"
                    value={newLink}
                    onChange={(e) => setNewLink(e.target.value)}
                    placeholder="Paste link: https://meet.google.com/abc-defg-hij"
                    className="w-full pl-9 pr-2.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold shadow-xs"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MEETING MODAL */}
      {isEditModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit className="w-4 h-4 text-royal-400" />
                <h3 className="text-sm font-black font-heading">Edit Client Meeting</h3>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedMeeting(null);
                }} 
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditMeetingSubmit} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Meeting Topic / Title *</label>
                <input
                  required
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Contract Signing & CRM Demo"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Client / Company Name *</label>
                <input
                  required
                  type="text"
                  value={editClient}
                  onChange={(e) => setEditClient(e.target.value)}
                  placeholder="e.g. Apex Solutions"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Date</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  />
                  <p className="text-[9px] text-slate-400 font-mono">Current: {selectedMeeting.date}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Time</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  />
                  <p className="text-[9px] text-slate-400 font-mono">Current: {selectedMeeting.time}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Google Meet Link *</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    required
                    type="url"
                    value={editLink}
                    onChange={(e) => setEditLink(e.target.value)}
                    placeholder="Paste link: https://meet.google.com/abc-defg-hij"
                    className="w-full pl-9 pr-2.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedMeeting(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIDEO CALL SIMULATOR MODAL */}
      {activeVideoCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-800 text-white shadow-2xl overflow-hidden text-center p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 uppercase tracking-widest font-mono animate-pulse">
                LIVE VIDEO ROOM
              </span>
              <button onClick={() => setActiveVideoCall(null)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-20 h-20 rounded-full bg-royal-600/30 border-2 border-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-pulse">
              <Video className="w-10 h-10 text-emerald-400" />
            </div>

            <div>
              <h3 className="text-base font-black font-heading">{activeVideoCall.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeVideoCall.client}</p>
            </div>

            <p className="text-xs text-emerald-400 font-mono font-bold">Room Active • Encryption Enabled</p>

            <button
              onClick={() => {
                showToast('Video Call Ended');
                setActiveVideoCall(null);
              }}
              className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-all mx-auto"
            >
              End Call
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
