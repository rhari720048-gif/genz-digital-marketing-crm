import React, { useState, useEffect } from 'react';
import { ShieldCheck, UploadCloud, Building, FileText, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { getApiUrl } from '../apiConfig';

export default function SettingsView({ user }) {
  const [companyName, setCompanyName] = useState('Genz Neuralx');
  const [companyAddress, setCompanyAddress] = useState('123 Tech Corridor, Chennai Tech Park,\nChennai, Tamil Nadu - 600096');
  const [companyLogo, setCompanyLogo] = useState(''); // Base64 data URL
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    fetch(getApiUrl('/api/module/settings?_t=' + Date.now()))
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          if (data.companyName) setCompanyName(data.companyName);
          if (data.companyAddress) setCompanyAddress(data.companyAddress);
          if (data.companyLogo) setCompanyLogo(data.companyLogo);
        }
      })
      .catch(err => console.error('Error fetching settings from DB:', err));
  }, []);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('Error: Please upload a valid image file!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCompanyLogo(event.target.result);
      showToast('Logo image loaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      companyName: companyName.trim(),
      companyAddress: companyAddress.trim(),
      companyLogo
    };

    fetch(getApiUrl('/api/module/settings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: payload })
    })
      .then(res => res.json())
      .then(() => {
        showToast('Settings saved and synchronized with database!');
      })
      .catch(err => {
        console.error('Error saving settings to DB:', err);
        showToast('Error: Failed to save settings to database.');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
              CRM Settings & Branding
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Configure global billing settings, custom logos, and company metadata.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left branding card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Branding Configuration</h3>
          
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Company Name *</label>
              <input
                required
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800"
                placeholder="e.g. Genz Neuralx"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Company Billing Address *</label>
              <textarea
                required
                rows={4}
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800 font-mono"
                placeholder="Enter complete company address for invoice bills"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-royal-600 hover:bg-royal-700 disabled:bg-slate-300 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5"
              >
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right logo preview card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col items-center justify-between min-h-[300px]">
          <div className="w-full space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2 w-full text-left">Company Logo</h3>
            
            <div className="w-full border-2 border-dashed border-slate-200 rounded-3xl p-5 flex flex-col items-center justify-center min-h-[180px] bg-slate-50/50">
              {companyLogo ? (
                <div className="relative group w-full flex items-center justify-center">
                  <img src={companyLogo} className="max-h-36 max-w-full object-contain rounded-2xl" alt="Preview Logo" />
                  <button 
                    onClick={() => setCompanyLogo('')} 
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200 cursor-pointer transition-colors"
                    title="Remove Logo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-700">No Logo Uploaded</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">JPEG, PNG formats accepted</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <label className="w-full mt-4 flex items-center justify-center space-x-1.5 px-5 py-2.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors active:scale-98">
            <UploadCloud className="w-4 h-4 shrink-0" />
            <span>Upload New Logo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

// Simple close icon fallback inside SettingsView
function X({ className, ...props }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
      {...props}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
