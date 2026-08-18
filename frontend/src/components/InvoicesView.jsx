import React, { useState, useEffect, useRef } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Eye, 
  Download, 
  Send, 
  Building, 
  CreditCard, 
  X, 
  TrendingUp,
  FileCheck,
  Printer,
  Sparkles
} from 'lucide-react';

import { formatDateDDMMYYYY } from '../utils/dateFormatter';
import { getApiUrl } from '../apiConfig';

export default function InvoicesView({ stats }) {
  const [invoices, setInvoices] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Settings state (company name, logo, address)
  const [companySettings, setCompanySettings] = useState({
    companyName: 'Genz Neuralx',
    companyAddress: '123 Tech Corridor, Chennai Tech Park,\nChennai, Tamil Nadu - 600096',
    companyLogo: ''
  });

  // Invoice Form state
  const [formInvoiceId, setFormInvoiceId] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formService, setFormService] = useState('Website Development');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formSellingPrice, setFormSellingPrice] = useState(10000);
  const [formDiscount, setFormDiscount] = useState(5000);

  const billPreviewRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sync settings and invoices on mount
  useEffect(() => {
    // Generate initial unique Invoice ID
    setFormInvoiceId(`IV-${Date.now().toString().slice(-6)}`);

    // Fetch settings
    fetch(getApiUrl('/api/module/settings?_t=' + Date.now()))
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setCompanySettings({
            companyName: data.companyName || 'Genz Neuralx',
            companyAddress: data.companyAddress || '123 Tech Corridor, Chennai Tech Park,\nChennai, Tamil Nadu - 600096',
            companyLogo: data.companyLogo || ''
          });
        }
      })
      .catch(err => console.error('Error fetching settings:', err));

    // Fetch invoices
    fetch(getApiUrl('/api/module/invoices?_t=' + Date.now()))
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
  useEffect(() => {
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

  // Form calculation
  const calculatedTotal = Math.max(0, (formQuantity * formSellingPrice) - formDiscount);

  // Add Invoice handler
  const handleCreateInvoice = (e) => {
    e.preventDefault();

    if (!formClientName.trim()) {
      showToast('Error: Client Name is required!');
      return;
    }

    const newInvoice = {
      id: formInvoiceId.trim(),
      clientName: formClientName.trim(),
      email: formClientEmail.trim() || 'client@example.com',
      service: formService,
      quantity: Number(formQuantity) || 1,
      sellingPrice: Number(formSellingPrice) || 0,
      discount: Number(formDiscount) || 0,
      amount: calculatedTotal,
      paidAmount: calculatedTotal, // default fully paid
      status: 'Paid',
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Prevent duplicate IDs
    if (invoices.some(inv => inv.id === newInvoice.id)) {
      showToast('Error: Invoice Number already exists!');
      return;
    }

    setInvoices([newInvoice, ...invoices]);
    showToast(`Invoice ${newInvoice.id} generated and saved!`);
    
    // Reset ID and client
    setFormInvoiceId(`IV-${Date.now().toString().slice(-6)}`);
    setFormClientName('');
    setFormClientEmail('');
  };

  // PDF download handler using html2pdf.js dynamically loaded from cdnjs
  const handleDownloadPDF = () => {
    const element = billPreviewRef.current;
    if (!element) return;

    const opt = {
      margin: 10,
      filename: `Invoice_${formInvoiceId}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        window.html2pdf().from(element).set(opt).save();
        showToast('PDF Invoice downloaded successfully!');
      };
      document.body.appendChild(script);
    } else {
      window.html2pdf().from(element).set(opt).save();
      showToast('PDF Invoice downloaded successfully!');
    }
  };

  // Default svg fallback for logo
  const defaultLogoSvg = (
    <svg className="w-12 h-12 text-royal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );

  return (
    <div className="animate-fadeIn w-full mx-auto space-y-6 font-sans pb-8">
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
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-royal-600 text-white shadow-md shadow-royal-600/20 shrink-0">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
              Invoices & Billing
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Generate premium billing slips and download them as high-quality PDFs.</p>
          </div>
        </div>
      </div>

      {/* CREATION WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: BILL GENERATOR FORM */}
        <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 h-fit">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-royal-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Invoice Information</h3>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Invoice Number *</label>
                <input
                  required
                  type="text"
                  value={formInvoiceId}
                  onChange={(e) => setFormInvoiceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Client Company / Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Acme Corporation"
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Client Email</label>
                <input
                  type="email"
                  placeholder="client@acme.com"
                  value={formClientEmail}
                  onChange={(e) => setFormClientEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Service / Description</label>
                <select
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="Website Development">Website Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Digital Marketing & SEO">Digital Marketing & SEO</option>
                  <option value="Cloud Migration Hosting">Cloud Migration Hosting</option>
                  <option value="Brand Identity Design">Brand Identity Design</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Quantity</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Number(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Selling Price ($)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formSellingPrice}
                  onChange={(e) => setFormSellingPrice(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold font-mono"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400">Discount Amount ($)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold font-mono text-rose-600"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save Bill Record</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-98 cursor-pointer"
                title="Download PDF"
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: PREMIUM WHITE BILL PREVIEW */}
        <div className="xl:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Live Bill Preview (A4 Dimensions)</span>
          </div>

          {/* PRINT CONTAINER */}
          <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200 shadow-xs max-h-[700px] overflow-y-auto">
            <div 
              ref={billPreviewRef} 
              id="invoice-bill-container" 
              className="relative bg-white text-slate-800 p-8 shadow-md rounded-xl font-sans w-full max-w-[800px] mx-auto min-h-[850px] flex flex-col justify-between border border-slate-200 overflow-hidden"
              style={{ colorScheme: 'light' }}
            >
              
              {/* WATERMARK BACKGROUND LOGO */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.03] z-0 select-none">
                {companySettings.companyLogo ? (
                  <img src={companySettings.companyLogo} className="w-[380px] h-[380px] object-contain rotate-12" alt="watermark" />
                ) : (
                  <div className="w-[380px] h-[380px] flex items-center justify-center text-royal-600 scale-[8] rotate-12">
                    {defaultLogoSvg}
                  </div>
                )}
              </div>

              {/* TOP BRANDING ROW */}
              <div className="relative z-10 space-y-6">
                <div className="flex flex-col items-center text-center space-y-2 pb-6 border-b-2 border-slate-100">
                  {companySettings.companyLogo ? (
                    <img src={companySettings.companyLogo} className="h-16 max-w-[200px] object-contain" alt="Company Logo" />
                  ) : (
                    defaultLogoSvg
                  )}
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                      {companySettings.companyName}
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">Invoice Bill slip</p>
                  </div>
                  
                  {/* Address */}
                  <div className="text-center max-w-md">
                    <p className="text-[10px] text-slate-500 font-semibold whitespace-pre-line leading-relaxed font-mono">
                      {companySettings.companyAddress}
                    </p>
                  </div>
                </div>

                {/* BILL METADATA */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Billed To</p>
                    <p className="font-extrabold text-slate-900">{formClientName || 'Client Business Name'}</p>
                    <p className="font-semibold text-slate-500">{formClientEmail || 'client@email.com'}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-right space-y-1 font-mono">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Billing Details</p>
                    <p className="font-extrabold text-slate-900">Invoice No: {formInvoiceId}</p>
                    <p className="text-slate-500">Date: {formatDateDDMMYYYY(new Date().toISOString())}</p>
                  </div>
                </div>

                {/* THE CORE TABLE BOX */}
                <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-200 text-[10px] font-black uppercase text-slate-400 font-mono">
                        <th className="px-4 py-3 text-center w-12">S.No</th>
                        <th className="px-4 py-3">Invoice Number</th>
                        <th className="px-4 py-3">Service / Item</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Selling Price</th>
                        <th className="px-4 py-3 text-right">Discount</th>
                        <th className="px-4 py-3 text-right w-24">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="px-4 py-3 text-center font-mono">1</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{formInvoiceId}</td>
                        <td className="px-4 py-3 text-slate-900">{formService}</td>
                        <td className="px-4 py-3 text-center font-mono">{formQuantity}</td>
                        <td className="px-4 py-3 text-right font-mono">${formSellingPrice.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-rose-600">-${formDiscount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono font-extrabold text-slate-900">${calculatedTotal.toLocaleString()}</td>
                      </tr>
                      {/* Empty pad rows for professional print spacing */}
                      <tr className="h-16 bg-slate-50/10">
                        <td colSpan="7"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FOOTER & TOTALS */}
              <div className="relative z-10 pt-6 mt-8 border-t-2 border-slate-100">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Authorized Signature</p>
                    <p className="text-xs font-black font-heading text-slate-900">{companySettings.companyName}</p>
                    <p className="text-[9px] text-slate-400 font-semibold">Thank you for your business!</p>
                  </div>

                  {/* GRAND TOTAL SUM BOX */}
                  <div className="w-full sm:w-64 p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between font-mono">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Grand Total</span>
                    <span className="text-base font-black">${calculatedTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* PREVIOUS INVOICES HISTORY SLIP */}
      {invoices.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900">Generated Invoice Records</h3>
            <span className="px-2.5 py-0.5 bg-royal-50 text-royal-700 text-[10px] font-bold rounded-full">
              {invoices.length} Bills Saved
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 pb-2">
                  <th className="py-2">Invoice No</th>
                  <th className="py-2">Client Name</th>
                  <th className="py-2">Service</th>
                  <th className="py-2 text-center">Quantity</th>
                  <th className="py-2 text-right">Subtotal</th>
                  <th className="py-2 text-right">Discount</th>
                  <th className="py-2 text-right">Grand Total</th>
                  <th className="py-2 text-center">Status</th>
                  <th className="py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-royal-600">{inv.id}</td>
                    <td className="py-3 font-extrabold text-slate-900">{inv.clientName}</td>
                    <td className="py-3 text-slate-500">{inv.service || 'Service Work'}</td>
                    <td className="py-3 text-center font-mono">{inv.quantity || 1}</td>
                    <td className="py-3 text-right font-mono">${(inv.sellingPrice * (inv.quantity || 1)).toLocaleString()}</td>
                    <td className="py-3 text-right font-mono text-rose-500">-${(inv.discount || 0).toLocaleString()}</td>
                    <td className="py-3 text-right font-mono font-extrabold text-slate-900">${(inv.amount || 0).toLocaleString()}</td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[9px] font-extrabold">
                        {inv.status || 'Paid'}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => {
                          setFormInvoiceId(inv.id);
                          setFormClientName(inv.clientName);
                          setFormClientEmail(inv.email);
                          setFormService(inv.service || 'Website Development');
                          setFormQuantity(inv.quantity || 1);
                          setFormSellingPrice(inv.sellingPrice || 0);
                          setFormDiscount(inv.discount || 0);
                          showToast(`Invoice ${inv.id} loaded into preview!`);
                        }}
                        className="p-1 hover:bg-slate-100 rounded-lg text-royal-600 transition-colors cursor-pointer"
                        title="Load Preview & Edit"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
