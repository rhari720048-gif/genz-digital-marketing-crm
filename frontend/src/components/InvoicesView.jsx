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
  Sparkles,
  MapPin
} from 'lucide-react';

import { formatDateDDMMYYYY } from '../utils/dateFormatter';
import { getApiUrl } from '../apiConfig';

// Helper to convert number to Indian Rupees words
function convertNumberToWords(amount) {
  const words = {
    0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine',
    10: 'Ten', 11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen', 16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen',
    20: 'Twenty', 30: 'Thirty', 40: 'Forty', 50: 'Fifty', 60: 'Sixty', 70: 'Seventy', 80: 'Eighty', 90: 'Ninety'
  };

  if (amount === 0) return 'Zero Rupees Only';

  let temp = Math.floor(amount);
  let wordStr = '';

  if (temp >= 100000) {
    wordStr += convertNumberToWords(Math.floor(temp / 100000)).replace(' Rupees Only', '') + ' Lakh ';
    temp %= 100000;
  }
  if (temp >= 1000) {
    wordStr += convertNumberToWords(Math.floor(temp / 1000)).replace(' Rupees Only', '') + ' Thousand ';
    temp %= 1000;
  }
  if (temp >= 100) {
    wordStr += convertNumberToWords(Math.floor(temp / 100)).replace(' Rupees Only', '') + ' Hundred ';
    temp %= 100;
  }
  if (temp > 0) {
    if (wordStr !== '') wordStr += 'and ';
    if (temp < 20) {
      wordStr += words[temp];
    } else {
      wordStr += words[Math.floor(temp / 10) * 10];
      if (temp % 10 > 0) {
        wordStr += ' ' + words[temp % 10];
      }
    }
  }
  return wordStr.trim() + ' Rupees Only';
}

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
  const [formClientAddress, setFormClientAddress] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  
  // Table item details
  const [formService, setFormService] = useState('Website Development');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formSellingPrice, setFormSellingPrice] = useState(10000);
  const [formDiscount, setFormDiscount] = useState(1000);

  const [formTerms, setFormTerms] = useState('1. If you wish to return/claim, you must do so within a month.');

  const billPreviewRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Sync settings and invoices on mount, and load fonts
  useEffect(() => {
    setFormInvoiceId(`IV-${Date.now().toString().slice(-4)}`);

    // Load premium Google fonts for the bill styling
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&family=Space+Mono:wght@400;700&display=swap';
    document.head.appendChild(link);

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

  // Save invoices to database
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
      clientAddress: formClientAddress.trim(),
      clientPhone: formClientPhone.trim(),
      email: formClientEmail.trim() || 'client@example.com',
      service: formService,
      quantity: Number(formQuantity) || 1,
      sellingPrice: Number(formSellingPrice) || 0,
      discount: Number(formDiscount) || 0,
      amount: calculatedTotal,
      paidAmount: calculatedTotal,
      status: 'Paid',
      dueDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      terms: formTerms
    };

    if (invoices.some(inv => inv.id === newInvoice.id)) {
      showToast('Error: Invoice Number already exists!');
      return;
    }

    setInvoices([newInvoice, ...invoices]);
    showToast(`Invoice ${newInvoice.id} generated and saved!`);
    setFormInvoiceId(`IV-${Date.now().toString().slice(-4)}`);
    setFormClientName('');
    setFormClientAddress('');
    setFormClientPhone('');
    setFormClientEmail('');
  };

  // PDF download handler
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

  // Vector Default logo path for watermark (clean, large size)
  const defaultWatermarkSvg = (
    <svg className="w-[320px] h-[320px] text-royal-600/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );

  const defaultLogoSvg = (
    <svg className="w-10 h-10 text-royal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );

  return (
    <div className="animate-fadeIn w-full mx-auto space-y-6 font-sans pb-8">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-royal-500/30 flex items-center space-x-2 text-xs font-bold font-sans">
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
              Invoices & Billing Panel
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Generate premium billing slips and download them as high-quality PDFs.</p>
          </div>
        </div>
      </div>

      {/* CREATION WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT COLUMN: BILL GENERATOR FORM */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 space-y-4 h-fit">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-4 h-4 text-royal-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Billing Form</h3>
          </div>

          <form onSubmit={handleCreateInvoice} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400">Invoice Number *</label>
                <input
                  required
                  type="text"
                  value={formInvoiceId}
                  onChange={(e) => setFormInvoiceId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold font-mono bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Client Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. THIYAGARAJA SCHOOL"
                  value={formClientName}
                  onChange={(e) => setFormClientName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Client Phone No</label>
                <input
                  type="text"
                  placeholder="9585549567"
                  value={formClientPhone}
                  onChange={(e) => setFormClientPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400">Client Billing Address</label>
                <textarea
                  rows={2}
                  placeholder="Street, City, State, Pin Code..."
                  value={formClientAddress}
                  onChange={(e) => setFormClientAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400">Client Email</label>
                <input
                  type="email"
                  placeholder="client@mail.com"
                  value={formClientEmail}
                  onChange={(e) => setFormClientEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400">Service / Particulars</label>
                <select
                  value={formService}
                  onChange={(e) => setFormService(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800"
                >
                  <option value="Website Development">Website Development</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                  <option value="Digital Marketing & SEO">Digital Marketing & SEO</option>
                  <option value="Cloud Hosting Infrastructure">Cloud Hosting Infrastructure</option>
                  <option value="Branding & Content Strategy">Branding & Content Strategy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Quantity (Qty)</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(Number(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold font-mono bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400">Rate / Price (₹)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formSellingPrice}
                  onChange={(e) => setFormSellingPrice(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold font-mono bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400">Discount (₹)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold font-mono text-rose-600 bg-white"
                />
              </div>

              <div className="space-y-1 col-span-2">
                <label className="text-[9px] font-black uppercase text-slate-400">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={formTerms}
                  onChange={(e) => setFormTerms(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-royal-600 hover:bg-royal-700 text-white font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 active:scale-98 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save Invoice Record</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-98 cursor-pointer"
                title="Download PDF"
              >
                <Printer className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: PREMIUM A4 PREVIEW WITH MOBILE responsiveness */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Live Bill Preview (A4 aspect-ratio scrollable on mobile)</span>
          </div>

          {/* HORIZONTAL SCROLL WRAPPER FOR MOBILE VIEWS */}
          <div className="overflow-x-auto w-full border border-slate-200/80 rounded-3xl bg-slate-50/50 p-2 sm:p-4 shadow-inner">
            <div 
              ref={billPreviewRef} 
              id="invoice-bill-container" 
              className="relative bg-white text-slate-800 p-8 w-full min-w-[700px] max-w-[760px] mx-auto min-h-[940px] flex flex-col justify-between border-2 border-slate-800 shadow-lg select-none"
              style={{ fontFamily: "'Outfit', sans-serif", colorScheme: 'light' }}
            >
              
              {/* WATERMARK BACKGROUND LOGO (Overlay with z-20, straight layout with 0 rotation) */}
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-20"
                style={{ opacity: 0.15 }}
              >
                {companySettings.companyLogo ? (
                  <img src={companySettings.companyLogo} className="w-[380px] h-[380px] object-contain" alt="watermark" />
                ) : (
                  <div className="w-[380px] h-[380px] flex items-center justify-center">
                    {defaultWatermarkSvg}
                  </div>
                )}
              </div>

              {/* 1. Header Box (Thick borders matching Dolphin style) */}
              <div className="relative z-10 space-y-4">
                <div className="border-2 border-slate-800 grid grid-cols-10">
                  {/* Left Side: Logo, Name & Address */}
                  <div className="col-span-6 p-4 border-r-2 border-slate-800 flex items-start space-x-3.5 bg-white/80">
                    {companySettings.companyLogo ? (
                      <img src={companySettings.companyLogo} className="h-12 w-12 object-contain" alt="Logo" />
                    ) : (
                      defaultLogoSvg
                    )}
                    <div className="space-y-1 text-slate-900">
                      <h2 className="text-sm font-black tracking-tight uppercase">
                        {companySettings.companyName}
                      </h2>
                      <p className="text-[9px] text-slate-700 font-semibold font-mono whitespace-pre-line leading-relaxed">
                        {companySettings.companyAddress}
                      </p>
                      {/* Company Contact Details */}
                      <p className="text-[9px] text-slate-800 font-extrabold font-mono border-t border-slate-200 pt-1 mt-1">
                        E-Mail: info@genzneuralx.com | Website: www.genzneuralx.com
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Bill Details (Ample row space, no overflow) */}
                  <div className="col-span-4 grid grid-rows-2 text-[10px] bg-white/80">
                    <div className="p-3 border-b-2 border-slate-800 flex justify-between items-center bg-slate-50/50">
                      <span className="font-extrabold text-slate-500 uppercase">Bill No:</span>
                      <span className="font-black text-slate-950 text-right" style={{ fontFamily: "'Space Mono', monospace" }}>{formInvoiceId}</span>
                    </div>
                    <div className="p-3 flex justify-between items-center bg-slate-50/50">
                      <span className="font-extrabold text-slate-500 uppercase">Date:</span>
                      <span className="font-black text-slate-955 text-right" style={{ fontFamily: "'Space Mono', monospace" }}>{formatDateDDMMYYYY(new Date().toISOString())}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Bill To (Client details) */}
                <div className="border-2 border-t-0 border-slate-800 p-4 mt-[-16px] space-y-1.5 text-[10px] bg-white/80">
                  <h3 className="font-black text-slate-500 uppercase tracking-wider">Bill To :</h3>
                  <div className="space-y-0.5">
                    <p className="font-black text-slate-955 text-xs uppercase">{formClientName || 'Client Name'}</p>
                    {formClientAddress && (
                      <p className="text-slate-700 font-medium whitespace-pre-line leading-normal max-w-xl">{formClientAddress}</p>
                    )}
                    {formClientPhone && (
                      <p className="text-slate-900 font-extrabold mt-0.5" style={{ fontFamily: "'Space Mono', monospace" }}>Phone No : {formClientPhone}</p>
                    )}
                  </div>
                </div>

                {/* 3. Main Itemized Box Table (Thick border-2, strict columns alignment, 100% connected lines) */}
                <div className="border-2 border-slate-800 overflow-hidden bg-white/80 mt-1">
                  <table className="w-full border-collapse text-left text-[11px]" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                      <col style={{ width: '55px' }} />
                      <col />
                      <col style={{ width: '120px' }} />
                      <col style={{ width: '60px' }} />
                      <col style={{ width: '100px' }} />
                      <col style={{ width: '120px' }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-slate-50 border-b-2 border-slate-800 text-[10px] font-black uppercase text-slate-500 font-mono">
                        <th className="px-3 py-2.5 border-r-2 border-slate-800 text-center">S.No</th>
                        <th className="px-3 py-2.5 border-r-2 border-slate-800">Particulars</th>
                        <th className="px-3 py-2.5 border-r-2 border-slate-800 text-right">Rate (₹)</th>
                        <th className="px-3 py-2.5 border-r-2 border-slate-800 text-center">Qty</th>
                        <th className="px-3 py-2.5 border-r-2 border-slate-800 text-right">Discount</th>
                        <th className="px-3 py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 border-slate-800 font-semibold text-slate-700">
                      <tr className="align-top">
                        <td className="px-3 py-3.5 border-r-2 border-slate-800 text-center font-mono" style={{ fontFamily: "'Space Mono', monospace" }}>1</td>
                        <td className="px-3 py-3.5 border-r-2 border-slate-800">
                          <p className="font-bold text-slate-955 uppercase">{formService}</p>
                        </td>
                        <td className="px-3 py-3.5 border-r-2 border-slate-800 text-right font-mono text-slate-900" style={{ fontFamily: "'Space Mono', monospace" }}>₹{formSellingPrice.toLocaleString('en-IN')}.00</td>
                        <td className="px-3 py-3.5 border-r-2 border-slate-800 text-center font-mono text-slate-900" style={{ fontFamily: "'Space Mono', monospace" }}>{formQuantity}</td>
                        <td className="px-3 py-3.5 border-r-2 border-slate-800 text-right font-mono text-rose-600" style={{ fontFamily: "'Space Mono', monospace" }}>₹{formDiscount.toLocaleString('en-IN')}.00</td>
                        <td className="px-3 py-3.5 text-right font-mono font-black text-slate-955" style={{ fontFamily: "'Space Mono', monospace" }}>₹{calculatedTotal.toLocaleString('en-IN')}.00</td>
                      </tr>
                      
                      {/* Empty padding rows (Dolphin publications style) using non-collapsing &nbsp; cells and explicit height on <tr> */}
                      <tr style={{ height: '140px' }}>
                        <td className="border-r-2 border-slate-800">&nbsp;</td>
                        <td className="border-r-2 border-slate-800">&nbsp;</td>
                        <td className="border-r-2 border-slate-800">&nbsp;</td>
                        <td className="border-r-2 border-slate-800">&nbsp;</td>
                        <td className="border-r-2 border-slate-800">&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>

                      {/* Total row aligned 100% using single matching columns with vertical dividers */}
                      <tr className="bg-slate-50/50 font-black text-slate-850 font-mono text-[10px]" style={{ fontFamily: "'Space Mono', monospace" }}>
                        <td className="px-3 py-2.5 border-r-2 border-slate-800">&nbsp;</td>
                        <td className="px-3 py-2.5 border-r-2 border-slate-800 text-right uppercase font-sans font-black text-slate-500">Total :</td>
                        <td className="px-3 py-2.5 border-r-2 border-slate-800">&nbsp;</td>
                        <td className="px-3 py-2.5 border-r-2 border-slate-800 text-center text-slate-950">{formQuantity}</td>
                        <td className="px-3 py-2.5 border-r-2 border-slate-800 text-right text-rose-600">₹{formDiscount.toLocaleString('en-IN')}.00</td>
                        <td className="px-3 py-2.5 text-right text-slate-950">₹{calculatedTotal.toLocaleString('en-IN')}.00</td>
                      </tr>

                      {/* Net Amount row with blank description box instead of GST text */}
                      <tr className="border-t-2 border-slate-800 bg-white font-extrabold">
                        {/* Spanning 5 columns cleanly so that it aligns directly with the total value cell */}
                        <td colSpan="5" className="px-3 py-3 border-r-2 border-slate-800">&nbsp;</td>
                        <td className="px-3 py-3 border-r-2 border-slate-800 text-right text-[10px] font-black uppercase text-slate-700 bg-slate-50/20">
                          Net Amount
                        </td>
                        <td className="px-3 py-3 text-right font-mono font-black text-royal-700 text-sm" style={{ fontFamily: "'Space Mono', monospace" }}>
                          ₹{calculatedTotal.toLocaleString('en-IN')}.00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Amount in words */}
                <div className="border-2 border-t-0 border-slate-800 p-3 mt-[-16px] text-[10px] font-mono bg-slate-50/20">
                  <span className="font-extrabold text-slate-500 uppercase font-sans">Amount (Words) : </span>
                  <span className="font-black text-slate-955 uppercase">
                    {convertNumberToWords(calculatedTotal)}
                  </span>
                </div>
              </div>

              {/* FOOTER & TERMS */}
              <div className="relative z-10 pt-4 mt-6 border-t-2 border-slate-800 text-[10px]">
                <div className="grid grid-cols-2 gap-4 bg-white/80 rounded-xl p-1">
                  {/* Terms box */}
                  <div className="space-y-1">
                    <p className="font-black text-slate-400 uppercase tracking-wider">Terms and Conditions</p>
                    <p className="text-slate-500 font-semibold leading-relaxed font-mono whitespace-pre-line">
                      {formTerms}
                    </p>
                  </div>

                  {/* Clean blank stamp/signing area with perfect height spacer */}
                  <div className="h-20"></div>
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
                    <td className="py-3 text-right font-mono">₹{(inv.sellingPrice * (inv.quantity || 1)).toLocaleString('en-IN')}.00</td>
                    <td className="py-3 text-right font-mono text-rose-500">-₹{(inv.discount || 0).toLocaleString('en-IN')}.00</td>
                    <td className="py-3 text-right font-mono font-extrabold text-slate-900">₹{(inv.amount || 0).toLocaleString('en-IN')}.00</td>
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
                          setFormClientAddress(inv.clientAddress || '');
                          setFormClientPhone(inv.clientPhone || '');
                          setFormClientEmail(inv.email);
                          setFormService(inv.service || 'Website Development');
                          setFormQuantity(inv.quantity || 1);
                          setFormSellingPrice(inv.sellingPrice || 0);
                          setFormDiscount(inv.discount || 0);
                          setFormTerms(inv.terms || '1. If you wish to return/claim, you must do so within a month.');
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
