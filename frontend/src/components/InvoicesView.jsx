import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Download, 
  Send, 
  Building, 
  CreditCard, 
  X, 
  TrendingUp,
  FileCheck
} from 'lucide-react';

import { formatDateDDMMYYYY } from '../utils/dateFormatter';

import { getApiUrl } from '../apiConfig';

export default function InvoicesView({ stats }) {
  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_invoices_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasDummy = parsed.some(i => i.id === 'INV-2026-881' || i.id === 'INV-2026-882');
        if (!hasDummy) return parsed;
      }
    } catch (e) {}
    return [];
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Sync invoices from TiDB database on mount
  React.useEffect(() => {
    fetch(getApiUrl('/api/module/invoices'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setInvoices(data);
        }
        setIsInitialized(true);
      })
      .catch(err => {
        console.error('Failed to sync invoices from database:', err);
        setIsInitialized(true);
      });
  }, []);

  // Save invoices to TiDB database when state changes
  React.useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem('crm_invoices_v2', JSON.stringify(invoices));
    } catch (e) {}

    fetch(getApiUrl('/api/module/invoices'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: invoices })
    }).catch(err => console.error('Error saving invoices to DB:', err));
  }, [invoices, isInitialized]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentModeInput, setPaymentModeInput] = useState('Bank Transfer');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenPaymentModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentAmountInput((inv.amount - inv.paidAmount).toString());
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const payVal = Number(paymentAmountInput) || 0;
    const newPaid = selectedInvoice.paidAmount + payVal;
    const newStatus = newPaid >= selectedInvoice.amount ? 'Paid' : 'Partial';

    setInvoices(invoices.map(i => i.id === selectedInvoice.id ? {
      ...i,
      paidAmount: newPaid,
      status: newStatus,
      paymentMode: paymentModeInput
    } : i));

    setIsPaymentModalOpen(false);
    showToast(`Payment of $${payVal} recorded for Invoice ${selectedInvoice.id}!`);
  };

  const filteredInvoices = invoices.filter(i => {
    const matchSearch = i.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        i.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        i.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalCollected = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalPending = invoices.reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);

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

      {/* HEADER & METRICS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
            Invoices
          </h1>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/50 flex items-center space-x-3 min-w-[130px]">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase">Collected Revenue</p>
              <p className="text-sm font-black font-heading text-emerald-600">₹{totalCollected.toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/50 flex items-center space-x-3 min-w-[130px]">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase">Outstanding Due</p>
              <p className="text-sm font-black font-heading text-amber-600">₹{totalPending.toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-85">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice ID, client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-royal-500 focus:bg-white"
          />
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center justify-between sm:justify-start space-x-1.5 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200/60 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-600 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Total Billed</th>
                <th className="px-6 py-4">Paid Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4.5 font-mono font-bold text-royal-700">{inv.id}</td>
                  <td className="px-6 py-4.5">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-slate-900">{inv.clientName}</span>
                      <span className="text-xs text-slate-400">{inv.contactPerson}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4.5 font-mono font-extrabold text-slate-900">₹{inv.amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4.5 font-mono font-extrabold text-emerald-600">₹{inv.paidAmount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      inv.status === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      inv.status === 'Overdue' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 font-mono text-slate-500">{formatDateDDMMYYYY(inv.dueDate)}</td>
                  <td className="px-6 py-4.5 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => handleOpenPaymentModal(inv)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors flex items-center space-x-1"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Record Pay</span>
                        </button>
                      )}
                      {inv.status === 'Paid' && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Paid Full</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black font-heading">Record Payment - {selectedInvoice.id}</h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 rounded-lg bg-white/10 hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-5 space-y-3.5">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                <p className="text-slate-500">Client: <strong>{selectedInvoice.clientName}</strong></p>
                <p className="text-slate-500">Total Billed: <strong className="font-mono">₹{selectedInvoice.amount.toLocaleString('en-IN')}</strong></p>
                <p className="text-slate-500">Remaining Balance: <strong className="font-mono text-rose-600">₹{(selectedInvoice.amount - selectedInvoice.paidAmount).toLocaleString('en-IN')}</strong></p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Payment Amount Received (₹) *</label>
                <input
                  required
                  type="number"
                  value={paymentAmountInput}
                  onChange={(e) => setPaymentAmountInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Payment Channel / Mode</label>
                <select
                  value={paymentModeInput}
                  onChange={(e) => setPaymentModeInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="Stripe / Card">Credit / Debit Card</option>
                  <option value="UPI / GPay">UPI / Razorpay</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
