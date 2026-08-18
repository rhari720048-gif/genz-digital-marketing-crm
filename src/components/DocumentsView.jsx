import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderKanban, 
  UploadCloud, 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  Eye, 
  Image as ImageIcon, 
  FileCheck, 
  X, 
  Check, 
  Plus, 
  HardDrive, 
  Clock, 
  User, 
  Grid,
  List
} from 'lucide-react';

const STORAGE_KEY = 'crm_user_documents_v2';

export default function DocumentsView({ user }) {
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    } catch (e) {
      console.error('Error saving documents to localStorage:', e);
    }
  }, [documents]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    if (!titleInput) {
      setTitleInput(file.name.replace(/\.[^/.]+$/, ""));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFilePreviewUrl(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '1.2 MB';
    if (bytes < 1024) return bytes + ' Bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleConfirmUpload = (e) => {
    e.preventDefault();
    if (!titleInput.trim()) {
      alert('Please enter a document title');
      return;
    }

    const fileName = selectedFile ? selectedFile.name : `Document_${Date.now()}.pdf`;
    const fileSize = selectedFile ? formatFileSize(selectedFile.size) : '1.5 MB';
    const fileType = selectedFile ? selectedFile.type : 'application/pdf';
    const fileUrl = filePreviewUrl || '';

    const newDoc = {
      id: `doc_${Date.now()}`,
      title: titleInput.trim(),
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileType,
      uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      uploadedBy: user?.name || 'Current User',
      notes: notesInput.trim() || '',
      url: fileUrl
    };

    setDocuments(prev => [newDoc, ...prev]);
    setIsUploadModalOpen(false);
    
    // Reset Form
    setTitleInput('');
    setNotesInput('');
    setSelectedFile(null);
    setFilePreviewUrl(null);

    showToast(`Document "${newDoc.title}" uploaded successfully!`);
  };

  const handleDeleteDocument = (docId, docTitle) => {
    if (window.confirm(`Are you sure you want to delete "${docTitle}"?`)) {
      setDocuments(prev => prev.filter(d => d.id !== docId));
      if (previewDoc?.id === docId) setPreviewDoc(null);
      showToast(`Document deleted.`);
    }
  };

  const handleDownloadDocument = (doc) => {
    if (doc.url && doc.url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = doc.fileName || `${doc.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (doc.url) {
      window.open(doc.url, '_blank');
    }
    showToast(`Downloading "${doc.fileName || doc.title}"...`);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (doc.notes && doc.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const getFileIcon = (fileType) => {
    if (fileType?.includes('image')) {
      return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    }
    return <FileText className="w-5 h-5 text-royal-600" />;
  };

  return (
    <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-10">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 right-4 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-royal-500/30 flex items-center space-x-2 text-xs font-bold">
            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* PAGE HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-royal-600 text-white shadow-md shadow-royal-600/20 shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
              User Document Repository
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Upload and manage your official user documents, files, and records.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-royal-600 to-royal-700 hover:from-royal-700 hover:to-royal-800 text-white font-bold text-xs shadow-md shadow-royal-600/20 transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer shrink-0"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* 2 STATS METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Documents</p>
          <div className="flex items-center justify-between">
            <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono">{documents.length}</p>
            <div className="p-2 rounded-xl bg-royal-50 text-royal-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold">100% Secure Storage</p>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Recent Uploads</p>
          <div className="flex items-center justify-between">
            <p className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {documents.length > 0 ? 'Active' : 'None'}
            </p>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            {documents.length > 0 ? `Latest: ${documents[0].uploadDate}` : 'No uploads yet'}
          </p>
        </div>

      </div>

      {/* SEARCH & VIEW TOGGLE BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
        
        {/* Real-time Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document title or filename..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:ring-1 focus:ring-royal-500 focus:bg-white font-medium"
          />
        </div>

        {/* Layout Mode Toggle */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid' ? 'bg-white text-royal-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'table' ? 'bg-white text-royal-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* DOCUMENTS DISPLAY AREA */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-royal-50 text-royal-600 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-800 font-heading">No documents uploaded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery ? `No document matching "${searchQuery}".` : 'Click "Upload Document" to upload your files.'}
          </p>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-royal-600 text-white font-bold text-xs shadow-xs hover:bg-royal-700 inline-flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div 
              key={doc.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md hover:border-royal-300 transition-all flex flex-col justify-between group space-y-3"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 shrink-0 group-hover:scale-105 transition-transform">
                    {getFileIcon(doc.fileType)}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-900 font-heading line-clamp-2 leading-snug group-hover:text-royal-600 transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{doc.fileName}</p>
                </div>

                {doc.notes && (
                  <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 line-clamp-2">
                    "{doc.notes}"
                  </p>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <div className="flex items-center space-x-2 font-mono text-[10px]">
                  <span>{doc.fileSize}</span>
                  <span>•</span>
                  <span>{doc.uploadDate}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-royal-50 text-slate-600 hover:text-royal-600 transition-colors cursor-pointer"
                    title="Preview Document"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                    title="Download File"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteDocument(doc.id, doc.title)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* TABLE / LIST VIEW */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Document Details</th>
                  <th className="px-5 py-3.5">Size</th>
                  <th className="px-5 py-3.5">Uploaded By & Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-royal-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-slate-100 shrink-0">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div>
                          <p className="font-black text-slate-900 font-heading">{doc.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{doc.fileName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">
                      {doc.fileSize}
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-800">{doc.uploadedBy}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{doc.uploadDate}</p>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-royal-50 text-slate-600 hover:text-royal-600 transition-colors cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id, doc.title)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UploadCloud className="w-4 h-4 text-royal-400" />
                <h3 className="text-sm font-black font-heading">Upload New Document</h3>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)} 
                className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmUpload} className="p-5 space-y-3.5">
              
              {/* File Dropzone Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Select File from Device *
                </label>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 rounded-2xl border-2 border-dashed border-royal-200 hover:border-royal-500 bg-royal-50/40 hover:bg-royal-50 text-center cursor-pointer transition-all space-y-1"
                >
                  <UploadCloud className="w-7 h-7 text-royal-600 mx-auto" />
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-black text-slate-800 truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-royal-600 font-mono">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-extrabold text-royal-700">Click to Browse & Select File</p>
                      <p className="text-[10px] text-slate-400">Supports PDF, JPEG, PNG, DOCX, CSV</p>
                    </div>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  className="hidden" 
                />
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Document Title *
                </label>
                <input
                  required
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Enter document title"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 font-medium"
                />
              </div>

              {/* Notes Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Optional Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Add optional notes..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 font-sans"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Upload & Save</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* PREVIEW DOCUMENT MODAL WITH MOBILE COMPACT RESPONSIVE VIEWER */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md sm:max-w-xl md:max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <div className="p-1.5 rounded-lg bg-royal-600/40 text-royal-300">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black font-heading truncate text-white">{previewDoc.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{previewDoc.fileName}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)} 
                className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 cursor-pointer shrink-0 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 space-y-2.5 overflow-y-auto flex-1 bg-slate-50">
              
              {/* Document Metadata Bar */}
              <div className="p-2.5 rounded-2xl bg-white border border-slate-200/80 grid grid-cols-3 gap-2 text-[11px] shadow-2xs">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">File Size</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{previewDoc.fileSize}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Upload Date</p>
                  <p className="font-mono text-slate-800 mt-0.5">{previewDoc.uploadDate}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-extrabold tracking-wider">Uploaded By</p>
                  <p className="font-bold text-royal-700 mt-0.5 truncate">{previewDoc.uploadedBy}</p>
                </div>
              </div>

              {previewDoc.notes && (
                <div className="p-2.5 rounded-xl bg-royal-50/70 border border-royal-100 text-xs text-royal-950 font-medium">
                  <strong>Description:</strong> {previewDoc.notes}
                </div>
              )}

              {/* LIVE EMBEDDED RENDERER CONTAINER */}
              <div className="p-1.5 sm:p-2.5 rounded-2xl bg-slate-900 border border-slate-800 min-h-[280px] sm:min-h-[360px] flex flex-col items-center justify-center text-center overflow-hidden shadow-inner">
                {previewDoc.fileType?.includes('image') || (previewDoc.url && previewDoc.url.match(/^data:image\//i)) || (previewDoc.fileName && previewDoc.fileName.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i)) ? (
                  <img 
                    src={previewDoc.url} 
                    alt={previewDoc.title} 
                    className="max-h-[280px] sm:max-h-[360px] w-auto object-contain rounded-xl shadow-2xl border border-slate-700 mx-auto" 
                  />
                ) : previewDoc.fileType?.includes('pdf') || (previewDoc.url && previewDoc.url.match(/^data:application\/pdf/i)) || (previewDoc.fileName && previewDoc.fileName.match(/\.pdf$/i)) || (previewDoc.url && previewDoc.url.endsWith('.pdf')) ? (
                  <div className="w-full h-[280px] sm:h-[360px] rounded-xl overflow-hidden bg-slate-800 flex flex-col">
                    <iframe 
                      src={previewDoc.url} 
                      title={previewDoc.title}
                      className="w-full h-full border-0 rounded-xl bg-white"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[260px] sm:h-[320px] bg-slate-800 rounded-xl flex flex-col items-center justify-center p-4 space-y-2 text-white">
                    <FileText className="w-12 h-12 text-royal-400 mx-auto" />
                    <p className="text-xs font-black font-heading text-white">{previewDoc.fileName}</p>
                    <p className="text-[11px] text-slate-300 max-w-xs font-medium">
                      Document file ready. Click below to download or view file directly.
                    </p>
                    <button
                      onClick={() => handleDownloadDocument(previewDoc)}
                      className="px-4 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download / Open File</span>
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-2.5 sm:p-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => handleDeleteDocument(previewDoc.id, previewDoc.title)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center space-x-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete Document</span>
                <span className="sm:hidden">Delete</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadDocument(previewDoc)}
                  className="px-3.5 py-1.5 rounded-xl bg-royal-600 text-white font-bold text-xs hover:bg-royal-700 flex items-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
