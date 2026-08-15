import React, { useState } from 'react';
import { 
  StickyNote, 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit, 
  CheckCircle2, 
  Tag, 
  X, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

export default function NotesView({ stats }) {
  const [notes, setNotes] = useState([
    {
      id: 1,
      title: 'Apex Solutions Campaign Brief',
      category: 'Deal Strategy',
      content: 'Client requested 20% increase in lead volume for Q3. Focus on LinkedIn InMail targeting and Google PPC keywords.',
      pinned: true,
      date: 'Aug 12, 2026',
      color: 'bg-amber-50 border-amber-200 text-amber-900'
    },
    {
      id: 2,
      title: 'Vogue Media Call Key Action Items',
      category: 'Client Requirements',
      content: '1. Send updated proposal by Friday.\n2. Include Instagram reel production pricing.\n3. Schedule follow-up call with Priya.',
      pinned: true,
      date: 'Aug 11, 2026',
      color: 'bg-purple-50 border-purple-200 text-purple-900'
    },
    {
      id: 3,
      title: 'Nova Tech Onboarding Checklist',
      category: 'Meeting Call Notes',
      content: 'Contract signed ($24k). Need domain access for Google Analytics setup and CRM API integration keys.',
      pinned: false,
      date: 'Aug 10, 2026',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-900'
    },
    {
      id: 4,
      title: 'Q3 Growth Marketing Ideas',
      category: 'Marketing Ideas',
      content: 'Test AI automated email sequences for cold leads. Create 3 short video demos for landing page conversion.',
      pinned: false,
      date: 'Aug 08, 2026',
      color: 'bg-blue-50 border-blue-200 text-blue-900'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPinned, setNewPinned] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    const colors = [
      'bg-amber-50 border-amber-200 text-amber-900',
      'bg-blue-50 border-blue-200 text-blue-900',
      'bg-purple-50 border-purple-200 text-purple-900',
      'bg-emerald-50 border-emerald-200 text-emerald-900'
    ];
    const newN = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      pinned: newPinned,
      date: 'Today',
      color: colors[Math.floor(Math.random() * colors.length)]
    };

    setNotes([newN, ...notes]);
    setIsAddModalOpen(false);
    setNewTitle('');
    setNewContent('');
    showToast('Note created successfully!');
  };

  const togglePin = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    showToast('Note deleted');
  };

  const copyNoteText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredNotes = notes.filter(n => {
    return n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
           n.content.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-gradient-to-r from-royal-600 via-royal-700 to-royal-800 p-5 sm:p-6 rounded-3xl border border-royal-500/30 shadow-xl text-white">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-white tracking-tight">
            User Notes & Strategic Workspace
          </h1>
          <p className="text-xs sm:text-sm text-royal-100 mt-1 font-medium">
            Save call reminders, client briefs, and marketing strategy notes.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-white hover:bg-royal-50 text-royal-700 rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center space-x-1.5 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-royal-700" />
          <span>Create Note</span>
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full md:w-85">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-royal-500 focus:bg-white"
          />
        </div>
      </div>

      {/* NOTES KANBAN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNotes.map((note) => (
          <div 
            key={note.id}
            className={`p-5 rounded-3xl border ${note.color} shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between space-y-3 group`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <span className="text-[10px] font-bold text-slate-500 font-mono flex items-center space-x-1">
                  <StickyNote className="w-3 h-3 text-amber-600" />
                  <span>Note #{note.id}</span>
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => togglePin(note.id)}
                    className={`p-1 rounded-lg transition-colors ${note.pinned ? 'text-amber-600 bg-amber-200/50' : 'text-slate-400 hover:text-slate-700'}`}
                    title={note.pinned ? 'Unpin' : 'Pin Note'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-black text-slate-900 mt-2">{note.title}</h3>
              <p className="text-xs leading-relaxed mt-1 whitespace-pre-line text-slate-700 font-medium">{note.content}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-black/5 text-[10px] text-slate-500 font-mono">
              <span>{note.date}</span>
              <button
                onClick={() => copyNoteText(note.content, note.id)}
                className="flex items-center space-x-1 hover:text-slate-900 font-bold"
              >
                {copiedId === note.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === note.id ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE NOTE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <StickyNote className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black font-heading">Add New Workspace Note</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="p-5 space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Note Title *</label>
                <input
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Client Requirements Notes"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Note Content / Action Points *</label>
                <textarea
                  required
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your note details here..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium"
                />
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
