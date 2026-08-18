import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Download, 
  Send, 
  Building, 
  Mail, 
  Phone, 
  FileCheck, 
  X, 
  Sparkles,
  TrendingUp,
  Receipt
} from 'lucide-react';

import { formatDateDDMMYYYY } from '../utils/dateFormatter';

import { getApiUrl } from '../apiConfig';

export default function QuotationsView({ stats, refetchStats }) {
  const [quotations, setQuotations] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_quotations_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasDummy = parsed.some(q => q.id === 'QT-2026-001' || q.id === 'QT-2026-002');
        if (!hasDummy) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Sync quotations from TiDB database on mount
  useEffect(() => {
    fetch(getApiUrl('/api/module/quotations'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setQuotations(data);
        }
        setIsInitialized(true);
      })
      .catch(err => {
        console.error('Failed to sync quotations from database:', err);
        setIsInitialized(true);
      });
  }, []);

  // Save quotations to TiDB database when state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('crm_quotations_v2', JSON.stringify(quotations));
    } catch (e) {}

    fetch(getApiUrl('/api/module/quotations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: quotations })
    }).catch(err => console.error('Error saving quotations to DB:', err));
  }, [quotations, isInitialized]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);

  // New Quote Form
  const [formData, setFormData] = useState({
    clientName: '',
    contactPerson: '',
    email: '',
    title: '',
    value: '',
    expiryDate: '',
    itemsDesc: '',
    itemsPrice: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddQuote = (e) => {
    e.preventDefault();
    const val = Number(formData.value) || 0;
    const tax = Math.round(val * 0.18);
    const newQ = {
      id: `QT-2026-00${quotations.length + 1}`,
      clientName: formData.clientName,
      contactPerson: formData.contactPerson,
      email: formData.email,
      title: formData.title,
      value: val,
      tax: tax,
      total: val + tax,
      status: 'Sent',
      date: new Date().toISOString().split('T')[0],
      expiryDate: formData.expiryDate || '2026-08-30',
      items: [
        { desc: formData.itemsDesc || formData.title, qty: 1, price: val }
      ]
    };

    setQuotations([newQ, ...quotations]);
    setIsAddModalOpen(false);
    showToast(`Quotation ${newQ.id} created & sent to ${newQ.clientName}!`);
  };

  const showToast = (msg) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleViewPreview = (quote) => {
    setSelectedQuote(quote);
    setIsPreviewModalOpen(true);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setQuotations(quotations.map(q => q.id === id ? { ...q, status: newStatus } : q));
    showToast(`Quotation ${id} status updated to ${newStatus}`);
  };

  // Filtered Quotations
  const filteredQuotes = quotations.filter(q => {
    const matchSearch = q.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        q.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalQuotesVal = quotations.reduce((sum, q) => sum + q.total, 0);
  const approvedQuotesVal = quotations.filter(q => q.status === 'Approved').reduce((sum, q) => sum + q.total, 0);

  return (
    <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-8">
      
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-royal-500/30 flex items-center space-x-2 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* PAGE HEADER & QUICK METRICS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-royal-600 text-white shadow-md shadow-royal-600/20 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
              Quotations
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/50 flex items-center space-x-3 min-w-[130px]">
            <div className="p-2 rounded-xl bg-royal-100 text-royal-700">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase">Total Quotes</p>
              <p className="text-sm font-black font-heading text-slate-900">{quotations.length}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/50 flex items-center space-x-3 min-w-[140px]">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase">Approved Value</p>
              <p className="text-sm font-black font-heading text-emerald-600">${approvedQuotesVal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE ACTIONS */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search quote ID, client, project title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-royal-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="flex items-center justify-between sm:justify-start space-x-1.5 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200/60 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-600 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quotation</span>
          </button>
        </div>
      </div>

      {/* QUOTATIONS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Quote ID</th>
                <th className="px-6 py-4">Client & Contact</th>
                <th className="px-6 py-4">Proposal Title</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4.5 font-mono font-bold text-royal-700">{q.id}</td>
                  <td className="px-6 py-4.5">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-900">{q.clientName}</span>
                      <span className="text-xs text-slate-400">{q.contactPerson} • {q.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 font-semibold text-slate-800">{q.title}</td>
                  <td className="px-6 py-4.5 font-mono font-extrabold text-slate-900">${q.total.toLocaleString()}</td>
                  <td className="px-6 py-4.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      q.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      q.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      q.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 font-mono text-slate-500">{formatDateDDMMYYYY(q.expiryDate)}</td>
                  <td className="px-6 py-4.5 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => handleViewPreview(q)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-royal-50 hover:text-royal-600 border border-slate-200"
                        title="View PDF Quotation"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {q.status !== 'Approved' && (
                        <button
                          onClick={() => handleUpdateStatus(q.id, 'Approved')}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200"
                          title="Mark Approved"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE QUOTE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-royal-400" />
                <h3 className="text-sm font-black font-heading">Create New Quotation</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuote} className="p-5 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Client / Company Name *</label>
                  <input
                    required
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    placeholder="e.g. Apex Solutions"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="e.g. Rohan Sharma"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Client Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. rohan@apex.com"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Proposal Title *</label>
                <input
                  required
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Full-Scale Marketing Automation Suite"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Net Amount ($) *</label>
                  <input
                    required
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    placeholder="12500"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400">Valid Until Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-semibold"
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
                  className="px-5 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold"
                >
                  Generate & Send Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {isPreviewModalOpen && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black font-heading">PDF Quotation Document - {selectedQuote.id}</h3>
              </div>
              <button onClick={() => setIsPreviewModalOpen(false)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
              {/* Document Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-black text-slate-900">GENZ NEURAL-X CRM</h2>
                  <p className="text-xs text-slate-500">Suite 402, Neural Tower, OMR Tech Corridor, Chennai</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-royal-100 text-royal-700 font-mono text-xs font-bold">{selectedQuote.id}</span>
                  <p className="text-[11px] text-slate-400 mt-1">Date: {selectedQuote.date}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1 text-xs">
                <p className="text-[10px] uppercase font-bold text-slate-400">Prepared For:</p>
                <p className="font-bold text-slate-900">{selectedQuote.clientName} ({selectedQuote.contactPerson})</p>
                <p className="text-slate-500">{selectedQuote.email}</p>
              </div>

              {/* Proposal Title & Items */}
              <div>
                <p className="text-xs font-black text-slate-800 mb-2">Proposal: {selectedQuote.title}</p>
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200">
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right">Price ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedQuote.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium text-slate-800">{item.desc}</td>
                        <td className="p-2 text-right font-mono font-bold">${item.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-3 text-xs space-y-1.5 text-right font-mono">
                <p className="text-slate-600">Subtotal: ${selectedQuote.value.toLocaleString()}</p>
                <p className="text-slate-600">GST Tax (18%): ${selectedQuote.tax.toLocaleString()}</p>
                <p className="text-sm font-black text-royal-700">Grand Total: ${selectedQuote.total.toLocaleString()}</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    showToast(`Quotation PDF downloaded for ${selectedQuote.id}`);
                    setIsPreviewModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-royal-600 text-white text-xs font-bold flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
