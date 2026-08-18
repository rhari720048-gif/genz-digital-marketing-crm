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
      
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-royal-600 text-white shadow-md shadow-royal-600/20 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
              Invoices
            </h1>
          </div>
        </div>
      </div>

      {/* WHITE CLEAN CONTAINER */}
      <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-xs min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
          <Receipt className="w-8 h-8" />
        </div>
        <p className="text-sm font-black text-slate-400">Invoice Manager</p>
        <p className="text-xs text-slate-400/80 max-w-xs mt-1">This module is currently empty.</p>
      </div>

    </div>
  );
}
