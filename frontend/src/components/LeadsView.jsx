import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../apiConfig';
import {
  Target,
  PhoneCall,
  XCircle,
  Briefcase,
  Users,
  Sparkles,
  BellRing,
  CheckCircle2,
  ListFilter,
  TrendingUp,
  Clock,
  UserX,
  UserCheck,
  UserPlus,
  Search,
  Plus,
  Filter,
  Calendar,
  IndianRupee,
  Building,
  AlertCircle,
  Mail,
  Phone,
  FileText,
  X,
  PlusCircle,
  Hash,
  Eye,
  Edit,
  Trash2,
  PhoneOff,
  CalendarDays,
  UserCheck2,
  Upload,
  FileSpreadsheet,
  Download,
  Loader2,
  MapPin
} from 'lucide-react';

import { formatDateDDMMYYYY, getNowFormattedDDMMYYYY } from '../utils/dateFormatter';

export default function LeadsView({ stats, refetchStats, activeSubTab = 'all', setActiveSubTab }) {
  const [leads, setLeads] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [loading, setLoading] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return false;
      }
    } catch (e) {}
    return true;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifiedTabs, setNotifiedTabs] = useState({});
  const [actionLoadingKey, setActionLoadingKey] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);

  const showActionToast = (text, type = 'info') => {
    setToastNotice({ text, type });
    setTimeout(() => {
      setToastNotice(null);
    }, 3500);
  };

  const triggerActionWithLoading = (actionKey, callback) => {
    setActionLoadingKey(actionKey);
    setTimeout(() => {
      callback();
      setTimeout(() => {
        setActionLoadingKey(null);
      }, 200);
    }, 250);
  };

  // Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [selectedLead, setSelectedLead] = useState(null);

  // Call Simulator States
  const [activeCall, setActiveCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallEnded, setIsCallEnded] = useState(false);

  // Add Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    requirement: '',
    value: '',
    source: 'Google Search',
    status: 'Contacted',
    notes: ''
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    requirement: '',
    value: '',
    source: 'Google Search',
    status: 'Contacted',
    notes: ''
  });

  // Follow-up Schedule Form State
  const [followupForm, setFollowupForm] = useState({
    date: '',
    time: '',
    notes: ''
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // CSV Parser Helper
  const parseCSV = (csvText) => {
    const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

    const getColIndex = (possibleNames) => {
      return headers.findIndex(h => possibleNames.some(name => h.includes(name)));
    };

    const nameIdx = getColIndex(['name', 'lead', 'client', 'person']);
    const companyIdx = getColIndex(['company', 'organization', 'org', 'business']);
    const emailIdx = getColIndex(['email', 'mail']);
    const phoneIdx = getColIndex(['phone', 'mobile', 'cell', 'contact', 'number']);
    const locIdx = getColIndex(['location', 'city', 'state', 'place', 'address']);
    const reqIdx = getColIndex(['requirement', 'service', 'scope', 'project', 'notes']);
    const valueIdx = getColIndex(['value', 'amount', 'price', 'budget']);
    const sourceIdx = getColIndex(['source', 'channel']);
    const statusIdx = getColIndex(['status', 'stage']);

    const parsedLeads = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const cleanCell = (idx) => {
        if (idx === -1 || !row[idx]) return '';
        return row[idx].trim().replace(/^["']|["']$/g, '');
      };

      const rawName = cleanCell(nameIdx);
      const company = cleanCell(companyIdx);
      const email = cleanCell(emailIdx);
      const phone = cleanCell(phoneIdx);
      const location = cleanCell(locIdx);
      const requirement = cleanCell(reqIdx);

      // Fallback name if Name field is empty
      const name = rawName || company || email || phone || `Lead-${i}`;

      // Skip row only if entirely empty
      if (!rawName && !company && !email && !phone && !location && !requirement) continue;

      const valRaw = cleanCell(valueIdx).replace(/[^0-9.]/g, '');

      parsedLeads.push({
        id: `ld_imp_${Date.now()}_${i}`,
        name: name,
        company: company || 'Individual',
        email: email || '',
        phone: phone || '',
        location: location || 'Not Specified',
        requirement: requirement || 'Imported Lead',
        value: valRaw ? Number(valRaw) : 0,
        source: cleanCell(sourceIdx) || 'CSV Import',
        status: cleanCell(statusIdx) || 'Contacted',
        dateAdded: new Date().toISOString().split('T')[0],
        notes: 'Imported via CSV file'
      });
    }

    return parsedLeads;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const importedData = parseCSV(text);
      if (importedData.length > 0) {
        const updatedLeads = [...importedData, ...leads];
        setLeads(updatedLeads);
        localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
        setImportCount(importedData.length);
        setImportSuccess(true);
        if (refetchStats) refetchStats();
        setTimeout(() => {
          setImportSuccess(false);
          setIsImportModalOpen(false);
        }, 2000);
      } else {
        alert('Could not parse valid leads from file. Make sure headers include Name, Company, Email, Phone.');
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Company,Email,Phone,Location,Requirement,Value,Source\nJohn Doe,Acme Corp,john@acme.com,+91 9876543210,Chennai TN,Digital Marketing,15000,Google Search\nSarah Smith,Nexus Ltd,sarah@nexus.io,+1 415 555 1234,Bangalore KA,SEO & PPC Campaign,22000,Referral\nMichael Brown,Vogue Store,michael@vogue.com,+91 9876512345,Mumbai MH,Social Media Management,8500,Website Form\nAlex Ray,Delta Tech,alex@delta.com,+91 99999 88888,Hyderabad TS,Lead Gen Funnel,5000,Cold Call";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_leads_import.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-open modal if active sub-tab is set to 'add' externally
  useEffect(() => {
    if (activeSubTab === 'add') {
      setActiveSubTab('all');
      setIsAddModalOpen(true);
    }
  }, [activeSubTab, setActiveSubTab]);

  // Call timer logic
  useEffect(() => {
    let timer;
    if (activeCall && !isCallEnded) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [activeCall, isCallEnded]);

  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch leads from Express backend, fallback to local storage
  const fetchLeads = async () => {
    try {
      if (leads.length === 0) {
        setLoading(true);
      }
      const res = await fetch(getApiUrl('/api/leads'));
      if (res.ok) {
        const data = await res.json();
        const isDummy = data.some(l => l.id === 'ld_01' || l.id === 'ld_07');
        if (isDummy) {
          setLeads([]);
          localStorage.setItem('crm_leads', JSON.stringify([]));
        } else {
          setLeads(data);
          localStorage.setItem('crm_leads', JSON.stringify(data));
        }
      } else {
        loadLocalFallback();
      }
    } catch (err) {
      console.warn('Backend API offline, loading from localStorage:', err);
      loadLocalFallback();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalFallback = () => {
    const localData = localStorage.getItem('crm_leads');
    if (localData) {
      // Check if localData contains old default sample leads and clean them up
      const parsed = JSON.parse(localData);
      const isDummy = parsed.some(l => l.id === 'ld_01' || l.id === 'ld_07');
      if (isDummy) {
        setLeads([]);
        localStorage.setItem('crm_leads', JSON.stringify([]));
      } else {
        setLeads(parsed);
      }
    } else {
      setLeads([]);
      localStorage.setItem('crm_leads', JSON.stringify([]));
    }
  };

  useEffect(() => {
    fetchLeads();

    // Poll backend every 10 seconds to sync leads and status updates between user and admin screens
    const interval = setInterval(() => {
      fetchLeads();
    }, 10000);

    // Instant tab synchronization via storage listener
    const handleStorageChange = (e) => {
      if (e.key === 'crm_leads') {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setLeads(parsed);
          }
        } catch (err) { }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFollowupInputChange = (e) => {
    const { name, value } = e.target;
    setFollowupForm(prev => ({ ...prev, [name]: value }));
  };

  const saveToLocalStorage = (newLead) => {
    const currentLeads = [newLead, ...leads];
    setLeads(currentLeads);
    localStorage.setItem('crm_leads', JSON.stringify(currentLeads));
    setSubmitSuccess(true);
  };

  const updateLocalLead = (updated) => {
    const updatedLeads = leads.map(l => l.id === updated.id ? updated : l);
    setLeads(updatedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
  };

  const deleteLocalLead = (id) => {
    const updatedLeads = leads.filter(l => l.id !== id);
    setLeads(updatedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
  };

  // Add Lead Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const leadName = formData.name.trim() || formData.company.trim() || formData.phone.trim() || formData.email.trim() || `Lead-${Math.floor(100 + Math.random() * 900)}`;

    setFormSubmitting(true);
    const newLeadObj = {
      id: `ld_${Date.now()}`,
      name: leadName,
      company: formData.company || 'Individual',
      email: formData.email || '',
      phone: formData.phone || '',
      requirement: formData.requirement || '',
      value: formData.value ? Number(formData.value) : 0,
      source: formData.source || 'Google Search',
      status: formData.status || 'Contacted',
      notes: formData.notes || '',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch(getApiUrl('/api/leads'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLeadObj)
      });

      if (res.ok) {
        setSubmitSuccess(true);
        await fetchLeads();
        if (refetchStats) refetchStats();
      } else {
        saveToLocalStorage(newLeadObj);
      }
    } catch (err) {
      saveToLocalStorage(newLeadObj);
    } finally {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        requirement: '',
        value: '',
        source: 'Google Search',
        status: 'Contacted',
        notes: ''
      });
      setFormSubmitting(false);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsAddModalOpen(false);
      }, 1500);
    }
  };

  // Edit Lead Submit
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !selectedLead) return;

    setFormSubmitting(true);
    const updatedLeadObj = {
      ...selectedLead,
      name: editFormData.name,
      company: editFormData.company || 'Individual',
      email: editFormData.email || '',
      phone: editFormData.phone || '',
      location: editFormData.location || '',
      requirement: editFormData.requirement || '',
      value: editFormData.value ? Number(editFormData.value) : 0,
      source: editFormData.source,
      status: editFormData.status,
      notes: editFormData.notes || ''
    };

    // Update local state and localStorage immediately
    updateLocalLead(updatedLeadObj);
    setSubmitSuccess(true);
    if (refetchStats) refetchStats();

    try {
      await fetch(getApiUrl(`/api/leads/${selectedLead.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedLeadObj)
      });
    } catch (err) {
      console.warn('Network issue during edit lead PUT:', err);
    } finally {
      setFormSubmitting(false);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsEditModalOpen(false);
        setSelectedLead(null);
        triggerSuccessModal('Lead Details Updated!', 'Changes saved to CRM records...', 'emerald');
      }, 1200);
    }
  };

  // Follow-up Form Submit
  const handleFollowupSubmit = async (e) => {
    e.preventDefault();
    if (!followupForm.date || !followupForm.time || !selectedLead) return;

    setFormSubmitting(true);
    const followupStamp = `${followupForm.date} ${followupForm.time}`;
    const updatedLeadObj = {
      ...selectedLead,
      status: 'Negotiation',
      nextFollowupAt: followupStamp,
      followupDate: followupStamp,
      followupGoal: followupForm.notes,
      notes: `${selectedLead.notes || ''}\n[Scheduled Follow-up for ${followupForm.date} at ${followupForm.time}]: ${followupForm.notes}`
    };

    try {
      const res = await fetch(getApiUrl(`/api/leads/${selectedLead.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedLeadObj)
      });

      if (res.ok) {
        setSubmitSuccess(true);
        await fetchLeads();
        if (refetchStats) refetchStats();
      } else {
        updateLocalLead(updatedLeadObj);
        setSubmitSuccess(true);
      }
    } catch (err) {
      updateLocalLead(updatedLeadObj);
      setSubmitSuccess(true);
    } finally {
      setFormSubmitting(false);
      setFollowupForm({ date: '', time: '', notes: '' });
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsFollowupModalOpen(false);
        setSelectedLead(null);
        triggerSuccessModal('Follow-up Scheduled!', 'Lead moved to Follow-ups queue...', 'amber', 'followups', 'Clock');
      }, 1200);
    }
  };

  // Delete Lead Handler
  const handleDeleteLead = async (id) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    deleteLocalLead(id);
    if (refetchStats) refetchStats();
    showActionToast('Lead Record Deleted Successfully!', 'canceled');

    try {
      await fetch(getApiUrl(`/api/leads/${id}`), { method: 'DELETE' });
    } catch (err) { }
  };

  // Initiate Call
  const handleStartCall = (lead) => {
    setActiveCall(lead);
    setIsCallEnded(false);
    setCallDuration(0);
    showActionToast(`Initiating Call Simulator with ${lead.name}...`, 'call');
  };

  // End Call & Trigger Outcome Choice
  const handleEndCall = () => {
    setIsCallEnded(true);
  };

  // Handle Call Outcome
  const handleCallOutcome = (outcomeType) => {
    if (!activeCall) return;

    if (outcomeType === 'followup') {
      setSelectedLead(activeCall);
      setActiveCall(null);
      setIsCallEnded(false);
      setIsFollowupModalOpen(true);
    } else if (outcomeType === 'client') {
      handleConvertStatus(activeCall.id, 'Closed Won');
      setActiveCall(null);
      setIsCallEnded(false);
    } else if (outcomeType === 'canceled') {
      handleConvertStatus(activeCall.id, 'Closed Lost');
      setActiveCall(null);
      setIsCallEnded(false);
    } else {
      setActiveCall(null);
      setIsCallEnded(false);
    }
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setIsViewModalOpen(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setEditFormData({
      name: lead.name,
      company: lead.company,
      email: lead.email,
      phone: lead.phone,
      location: lead.location || '',
      requirement: lead.requirement || '',
      value: lead.value || '',
      source: lead.source,
      status: lead.status,
      notes: lead.notes || ''
    });
    setIsEditModalOpen(true);
  };

  const [actionSuccessModal, setActionSuccessModal] = useState(null);

  const triggerSuccessModal = (title, subtitle, color = 'amber', targetTab = null, iconType = 'CheckCircle2') => {
    setActionSuccessModal({ title, subtitle, color, iconType });
    setTimeout(() => {
      setActionSuccessModal(null);
      if (targetTab && setActiveSubTab) {
        setActiveSubTab(targetTab);
      }
    }, 1600);
  };

  const getNowFormatted = () => {
    return getNowFormattedDDMMYYYY();
  };

  // Convert status handler (one-click conversion)
  const handleConvertStatus = async (id, newStatus) => {
    const leadToUpdate = leads.find(l => l.id === id);
    if (!leadToUpdate) return;

    // If converting to Follow-up (Negotiation), trigger Follow-up Schedule Form!
    if (newStatus === 'Negotiation') {
      setSelectedLead(leadToUpdate);
      setIsFollowupModalOpen(true);
      return;
    }

    const nowStamp = getNowFormatted();
    const updated = { ...leadToUpdate, status: newStatus };

    if (newStatus === 'Closed Won' || newStatus === 'Client') {
      updated.status = 'Closed Won';
      if (!updated.convertedClientAt || updated.convertedClientAt === '-') {
        updated.convertedClientAt = nowStamp;
      }
      triggerSuccessModal('Client Converted Successfully!', 'Lead moved to Clients directory...', 'indigo', 'client', 'Briefcase');
    } else if (newStatus === 'Customer') {
      updated.status = 'Customer';
      if (!updated.convertedCustomerAt || updated.convertedCustomerAt === '-') {
        updated.convertedCustomerAt = nowStamp;
      }
      triggerSuccessModal('Customer Converted Successfully!', 'Client moved to Customers directory...', 'emerald', 'customers', 'UserCheck');
    } else if (newStatus === 'Completed') {
      updated.status = 'Completed';
      updated.completedAt = nowStamp;
      triggerSuccessModal('Completed Customer Saved!', 'Account moved to Completed Customers audit log...', 'emerald', 'completed', 'CheckCircle2');
    } else if (newStatus === 'Closed Lost') {
      updated.status = 'Closed Lost';
      triggerSuccessModal('Lead Moved to Canceled List!', 'Record saved under Canceled / Lost leads queue...', 'rose', 'canceled', 'XCircle');
    }

    // Always update local state immediately so UI updates instantly!
    updateLocalLead(updated);
    if (refetchStats) refetchStats();

    try {
      await fetch(getApiUrl(`/api/leads/${id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updated)
      });
    } catch (err) {
      console.warn('Backend PUT network issue, local state saved:', err);
    }
  };

  // Export CSV Report for Completed Customers
  const exportCompletedReportCSV = () => {
    const completedLeads = leads.filter(l => l.status === 'Completed');
    if (completedLeads.length === 0) {
      alert('No completed customer records available to export.');
      return;
    }

    const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Location', 'Requirement', 'Value (₹)', 'Source', 'Lead Added Date&Time', 'Client Converted Date&Time', 'Customer Converted Date&Time', 'Completed Date&Time', 'Status'];
    const rows = completedLeads.map((l, idx) => [
      getCategoryFormattedId(l, idx, 'completed'),
      `"${l.name}"`,
      `"${l.company || ''}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.location || ''}"`,
      `"${(l.requirement || '').replace(/"/g, '""')}"`,
      l.value || 0,
      `"${l.source || ''}"`,
      `"${l.dateAdded || l.addedAt || '-'}"`,
      `"${l.convertedClientAt || '-'}"`,
      `"${l.convertedCustomerAt || '-'}"`,
      `"${l.completedAt || '-'}"`,
      `"${l.status || 'Completed'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Completed_Customers_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const DEFAULT_LEADS = [
    { id: 'ld_01', name: 'Rohan Sharma', company: 'Apex Solutions', email: 'rohan@apex.com', phone: '+91 98765 54321', source: 'Google Search', status: 'Negotiation', value: 12500, dateAdded: '10/08/2026 09:15 AM', convertedClientAt: '-', convertedCustomerAt: '-', completedAt: '-', notes: 'Interested in enterprise marketing tools.', requirement: 'SEO & Content Marketing' },
    { id: 'ld_02', name: 'Priya Patel', company: 'Vogue Media', email: 'priya@vogue.co', phone: '+91 98765 98765', source: 'Social Media', status: 'Proposal Sent', value: 8500, dateAdded: '09/08/2026 11:30 AM', convertedClientAt: '-', convertedCustomerAt: '-', completedAt: '-', notes: 'Sent quotation. Waiting for reply.', requirement: 'Social Media Management' },
    { id: 'ld_03', name: 'Michael Chang', company: 'Nova Tech', email: 'michael@novatech.io', phone: '+1 415 555 2671', source: 'Referral', status: 'Closed Won', value: 24000, dateAdded: '08/08/2026 10:00 AM', convertedClientAt: '11/08/2026 02:15 PM', convertedCustomerAt: '-', completedAt: '-', notes: 'Deal signed. Ready for onboarding.', requirement: 'Full-Scale Brand Campaign' },
    { id: 'ld_04', name: 'Vikram Malhotra', company: 'Alpha Group', email: 'vikram@alpha.in', phone: '+91 88888 77777', source: 'Cold Call', status: 'Contacted', value: 4500, dateAdded: '07/08/2026 04:45 PM', convertedClientAt: '-', convertedCustomerAt: '-', completedAt: '-', notes: 'First touch completed. Follow up next Monday.', requirement: 'Lead Gen Campaigns' },
    { id: 'ld_05', name: 'Sarah Jenkins', company: 'Bloom Retail', email: 'sarah@bloom.com', phone: '+44 20 7946 0958', source: 'Website Form', status: 'Closed Lost', value: 9200, dateAdded: '06/08/2026 01:20 PM', convertedClientAt: '-', convertedCustomerAt: '-', completedAt: '-', notes: 'No response. Marked as lost.', requirement: 'PPC & Google Ads' },
    { id: 'ld_06', name: 'Ananya Roy', company: 'Zenith Retails', email: 'ananya@zenith.com', phone: '+91 99000 11223', source: 'Referral', status: 'Customer', value: 31000, dateAdded: '05/08/2026 09:30 AM', convertedClientAt: '07/08/2026 11:00 AM', convertedCustomerAt: '10/08/2026 03:20 PM', completedAt: '-', notes: 'Active paying enterprise customer.', requirement: 'Omnichannel CRM Setup' },
    { id: 'ld_07', name: 'Karthik Raja', company: 'Apex Digital Hub', email: 'karthik@apexdigital.in', phone: '+91 97890 44556', source: 'Social Media', status: 'Completed', value: 42000, dateAdded: '01/08/2026 10:15 AM', convertedClientAt: '04/08/2026 01:45 PM', convertedCustomerAt: '08/08/2026 04:30 PM', completedAt: '14/08/2026 06:10 PM', notes: 'Successfully delivered and project contract completed.', requirement: 'End-to-End Growth Suite' }
  ];

  // Dynamic filter based on sub-tab
  const getSubTabFilteredLeads = () => {
    switch (activeSubTab) {
      case 'followups':
        return leads.filter(l => l.status === 'Negotiation' || l.status === 'Proposal Sent');
      case 'canceled':
        return leads.filter(l => l.status === 'Closed Lost');
      case 'client':
        return leads.filter(l => l.status === 'Closed Won' || l.status === 'Client');
      case 'completed':
        return leads.filter(l => l.status === 'Completed');
      case 'all':
      default:
        return leads.filter(l => !l.status || l.status === 'Contacted' || l.status === 'New');
    }
  };

  // Category & Index based 001 ID Formatter (LED-001, FOL-001, CAN-001, CLI-001, COM-001)
  const getCategoryFormattedId = (lead, index, subTab) => {
    if (!lead) return 'LED-001';

    let itemIndex = index;
    if (itemIndex === undefined || itemIndex < 0) {
      const currentCategoryList = getSubTabFilteredLeads();
      const foundIdx = currentCategoryList.findIndex(l => l.id === lead.id);
      itemIndex = foundIdx !== -1 ? foundIdx : 0;
    }

    const numStr = String(itemIndex + 1).padStart(3, '0');
    const targetTab = subTab || activeSubTab;

    switch (targetTab) {
      case 'followups':
        return `FOL-${numStr}`;
      case 'canceled':
        return `CAN-${numStr}`;
      case 'client':
        return `CLI-${numStr}`;
      case 'completed':
        return `COM-${numStr}`;
      case 'all':
      default:
        return `LED-${numStr}`;
    }
  };

  const leadsToDisplay = getSubTabFilteredLeads();

  // Search filter
  const filteredLeads = leadsToDisplay.filter(lead => {
    const nameMatch = lead.name.toLowerCase().includes(searchQuery.toLowerCase());
    const companyMatch = (lead.company || '').toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (lead.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const reqMatch = (lead.requirement || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = nameMatch || companyMatch || emailMatch || reqMatch;
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalLeadsCount = leads.length;
  const pendingFollowupsCount = leads.filter(l => l.status === 'Proposal Sent' || l.status === 'Negotiation').length;
  const convertedClientsCount = leads.filter(l => l.status === 'Closed Won').length;

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-extrabold';
      case 'Customer': return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Closed Won': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'Negotiation': return 'bg-blue-50 text-blue-700 border-blue-200/60';
      case 'Proposal Sent': return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
      case 'Contacted': return 'bg-slate-50 text-slate-700 border-slate-200/60';
      case 'Closed Lost': return 'bg-rose-50 text-rose-700 border-rose-200/60';
      default: return 'bg-slate-50 text-slate-700 border-slate-200/60';
    }
  };

  const getStatusDotStyle = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-600';
      case 'Customer': return 'bg-emerald-500';
      case 'Closed Won': return 'bg-emerald-500';
      case 'Negotiation': return 'bg-blue-500';
      case 'Proposal Sent': return 'bg-indigo-500';
      case 'Contacted': return 'bg-slate-400';
      case 'Closed Lost': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'Closed Won':
      case 'Client':
        return 'Client';
      case 'Closed Lost':
      case 'Canceled':
        return 'Canceled';
      case 'Negotiation':
        return 'Follow-up';
      case 'Proposal Sent':
        return 'Proposal Sent';
      case 'Contacted':
        return 'Contacted';
      case 'Customer':
        return 'Customer';
      case 'Completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getPageHeaderDetails = () => {
    switch (activeSubTab) {
      case 'followups':
        return {
          title: 'Follow-ups',
          icon: PhoneCall
        };
      case 'canceled':
        return {
          title: 'Canceled Leads',
          icon: XCircle
        };
      case 'client':
        return {
          title: 'Clients',
          icon: Briefcase
        };
      case 'completed':
        return {
          title: 'Completed Customers',
          icon: CheckCircle2
        };
      case 'all':
      default:
        return {
          title: 'All Leads',
          icon: Target
        };
    }
  };

  const headerDetails = getPageHeaderDetails();
  const HeaderIcon = headerDetails.icon || Target;

  return (
    <div className="animate-fadeIn w-full mx-auto space-y-5 font-sans pb-8">

      {/* Floating Action Toast Notification Banner */}
      {toastNotice && (
        <div className="fixed top-20 right-6 z-[100] animate-bounce transition-all duration-300">
          <div className="px-4.5 py-3 rounded-2xl shadow-2xl bg-white border border-slate-200 text-slate-900 flex items-center space-x-3 text-xs font-black font-sans">
            <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <span className="text-slate-900">{toastNotice.text}</span>
          </div>
        </div>
      )}

      {/* 1. PAGE HEADER & QUICK STATS */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5 mt-1">
          <div className="p-3 rounded-2xl bg-royal-600 text-white shadow-md shadow-royal-600/20 shrink-0">
            <HeaderIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 tracking-tight">
              {headerDetails.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/50 flex items-center space-x-3 min-w-[120px]">
            <div className="p-2 rounded-xl bg-royal-100 text-royal-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Total Leads</p>
              <p className="text-sm font-black font-heading text-royal-950 mt-0.5">{totalLeadsCount}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/50 flex items-center space-x-3 min-w-[120px]">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Follow-ups</p>
              <p className="text-sm font-black font-heading text-royal-950 mt-0.5">{pendingFollowupsCount}</p>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/50 flex items-center space-x-3 min-w-[120px]">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Converted</p>
              <p className="text-sm font-black font-heading text-royal-950 mt-0.5">{convertedClientsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LEADS TABLE VIEWPORT */}
      <div className="space-y-4">

        {/* Table Actions: Search and Filtering */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, company, requirement, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-royal-500 focus:bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">


            {activeSubTab === 'all' && (
              <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:items-center sm:w-auto">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="w-full sm:w-auto px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 active:scale-95 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="truncate">Import CSV</span>
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-royal-600 hover:bg-royal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="truncate">Add Lead</span>
                </button>
              </div>
            )}

            {activeSubTab === 'completed' && (
              <button
                onClick={exportCompletedReportCSV}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 active:scale-95 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Audit Report (CSV)</span>
              </button>
            )}
          </div>
        </div>

        {/* Premium Leads Table Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Clock className="w-8 h-8 text-royal-500 animate-spin mx-auto" />
              <p className="text-sm font-semibold">Loading sales pipeline...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">No Records Found</h3>
                <p className="text-xs text-slate-400 mt-0.5">Try altering your search filters or add a new record.</p>
              </div>
              {activeSubTab === 'all' && (
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 border border-royal-200 text-royal-600 hover:bg-royal-50 rounded-xl text-sm font-bold transition-all"
                >
                  Add Record
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-500 font-sans">
                    <th className="px-6 py-4 w-32">Lead ID</th>
                    <th className="px-6 py-4">Lead / Company</th>
                    <th className="px-6 py-4">Requirement</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Value</th>
                    <th className="px-6 py-4">Source</th>
                    {activeSubTab === 'completed' ? (
                      <th className="px-6 py-4 min-w-[260px]">Lifecycle Timeline</th>
                    ) : activeSubTab === 'followups' ? (
                      <th className="px-6 py-4 min-w-[220px]">Scheduled Follow-up Date & Time</th>
                    ) : (
                      <th className="px-6 py-4">Date Added</th>
                    )}
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredLeads.map((lead, index) => (
                    <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4.5 font-mono font-bold text-royal-600 bg-royal-50/30 font-mono text-xs">{getCategoryFormattedId(lead, index, activeSubTab)}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900">{lead.name}</span>
                          <span className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                            <Building className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                            <span>{lead.company}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="max-w-[180px] truncate font-semibold text-slate-800" title={lead.requirement}>
                          {lead.requirement || <span className="text-slate-300 italic font-normal">No requirement specified</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col space-y-1">
                          {lead.email && (
                            <span className="flex items-center space-x-1.5 text-slate-600 font-medium">
                              <Mail className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              <span>{lead.email}</span>
                            </span>
                          )}
                          {lead.phone && (
                            <span className="flex items-center space-x-1.5 text-slate-600">
                              <Phone className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                              <span className="font-mono">{lead.phone}</span>
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_call`, () => handleStartCall(lead))}
                                className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors ml-1.5 inline-flex items-center shadow-2xs border border-emerald-100"
                                title="Call Lead"
                              >
                                {actionLoadingKey === `${lead.id}_call` ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                                ) : (
                                  <PhoneCall className="w-3 h-3" />
                                )}
                              </button>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center space-x-1.5 text-slate-700 font-semibold text-xs">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{lead.location || <span className="text-slate-300 italic font-normal">N/A</span>}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 font-mono font-extrabold text-royal-700">
                        ₹{lead.value ? lead.value.toLocaleString('en-IN') : '0'}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
                          {lead.source}
                        </span>
                      </td>
                      {activeSubTab === 'completed' ? (
                        <td className="px-6 py-4 min-w-[260px]">
                          <div className="space-y-1.5 font-sans">
                            {/* 1. Added */}
                            <div className="flex items-center justify-between text-[11px] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                              <span className="font-bold text-slate-500 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                <span>Lead Added</span>
                              </span>
                              <span className="font-mono font-semibold text-slate-700">{formatDateDDMMYYYY(lead.dateAdded || lead.addedAt)}</span>
                            </div>

                            {/* 2. Client */}
                            <div className="flex items-center justify-between text-[11px] bg-indigo-50/60 px-2.5 py-1 rounded-lg border border-indigo-100">
                              <span className="font-bold text-indigo-700 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                <span>Client Converted</span>
                              </span>
                              <span className="font-mono font-semibold text-indigo-900">{formatDateDDMMYYYY(lead.convertedClientAt)}</span>
                            </div>



                            {/* 4. Completed */}
                            <div className="flex items-center justify-between text-[11px] bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs">
                              <span className="font-extrabold text-emerald-900 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                <span>Completed</span>
                              </span>
                              <span className="font-mono font-extrabold text-emerald-950">{formatDateDDMMYYYY(lead.completedAt)}</span>
                            </div>
                          </div>
                        </td>
                      ) : activeSubTab === 'followups' ? (
                        <td className="px-6 py-4 min-w-[220px]">
                          <div className="flex flex-col space-y-1.5 font-sans">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 shadow-2xs">
                              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="font-mono">{formatDateDDMMYYYY(lead.nextFollowupAt || lead.followupDate) || 'Pending'}</span>
                            </div>

                            {lead.followupGoal && (
                              <div className="flex items-start space-x-1.5 text-[11px] text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200/60 font-semibold" title={lead.followupGoal}>
                                <FileText className="w-3.5 h-3.5 text-royal-600 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">Goal: {lead.followupGoal}</span>
                              </div>
                            )}

                            <span className="text-[10px] text-slate-400 font-mono pl-0.5">Added: {formatDateDDMMYYYY(lead.dateAdded)}</span>
                          </div>
                        </td>
                      ) : (
                        <td className="px-6 py-4.5 text-slate-500 font-mono">{formatDateDDMMYYYY(lead.dateAdded)}</td>
                      )}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center justify-center space-x-1">

                          {/* View Details - Available on all tabs */}
                          <button
                            onClick={() => triggerActionWithLoading(`${lead.id}_view`, () => handleViewLead(lead))}
                            className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-royal-50 hover:text-royal-600 transition-colors border border-slate-200/40"
                            title="View Details"
                          >
                            {actionLoadingKey === `${lead.id}_view` ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-royal-600" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Tab-Specific Action Buttons */}
                          {activeSubTab === 'canceled' ? (
                            /* Canceled Leads table: View, Convert to Follow-up, Convert to Client, Delete */
                            <>
                              {/* 1. Convert to Follow-up */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_followup`, () => handleConvertStatus(lead.id, 'Negotiation'))}
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 transition-colors border border-amber-200/30"
                                title="Re-activate as Follow-up"
                              >
                                {actionLoadingKey === `${lead.id}_followup` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* 2. Convert to Client */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_client`, () => handleConvertStatus(lead.id, 'Closed Won'))}
                                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors border border-indigo-200/30"
                                title="Re-activate as Client"
                              >
                                {actionLoadingKey === `${lead.id}_client` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                                ) : (
                                  <Briefcase className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* 3. Delete Lead */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_delete`, () => handleDeleteLead(lead.id))}
                                className="p-1.5 rounded-lg bg-rose-50/50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-200/35"
                                title="Delete Lead"
                              >
                                {actionLoadingKey === `${lead.id}_delete` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          ) : activeSubTab === 'client' ? (
                            /* Clients table: View, Edit, Cancel Lead, Mark Completed Customer (moves data to Completed Customers page!), Delete */
                            <>
                              {/* Edit */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_edit`, () => handleEditLead(lead))}
                                className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-royal-50 hover:text-royal-600 transition-colors border border-slate-200/40"
                                title="Edit Client"
                              >
                                {actionLoadingKey === `${lead.id}_edit` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-royal-600" />
                                ) : (
                                  <Edit className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Cancel Lead */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_cancel`, () => handleConvertStatus(lead.id, 'Closed Lost'))}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-200/35"
                                title="Cancel Lead"
                              >
                                {actionLoadingKey === `${lead.id}_cancel` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Complete Customer - Moves data directly to Completed Customers page! */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_complete`, () => handleConvertStatus(lead.id, 'Completed'))}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors border border-emerald-200/30"
                                title="Mark as Completed Customer"
                              >
                                {actionLoadingKey === `${lead.id}_complete` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Delete Client */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_delete`, () => handleDeleteLead(lead.id))}
                                className="p-1.5 rounded-lg bg-rose-50/50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-200/35"
                                title="Delete Client"
                              >
                                {actionLoadingKey === `${lead.id}_delete` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          ) : activeSubTab === 'completed' ? (
                            /* Completed Customers table: View, Delete, Completed text badge */
                            <>
                              {/* Delete Record */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_delete`, () => handleDeleteLead(lead.id))}
                                className="p-1.5 rounded-lg bg-rose-50/50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-200/35"
                                title="Delete Record"
                              >
                                {actionLoadingKey === `${lead.id}_delete` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Completed text badge */}
                              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-[10px] uppercase font-mono flex items-center space-x-1 shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Completed</span>
                              </span>
                            </>
                          ) : (
                            /* All Leads & Follow-ups table: View -> Edit -> Cancel -> Follow-up -> Client -> Delete */
                            <>
                              {/* Edit Lead */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_edit`, () => handleEditLead(lead))}
                                className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-royal-50 hover:text-royal-600 transition-colors border border-slate-200/40"
                                title="Edit Lead"
                              >
                                {actionLoadingKey === `${lead.id}_edit` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-royal-600" />
                                ) : (
                                  <Edit className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* 1. Cancel */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_cancel`, () => handleConvertStatus(lead.id, 'Closed Lost'))}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-200/35"
                                title="Convert to Cancel"
                              >
                                {actionLoadingKey === `${lead.id}_cancel` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                                ) : (
                                  <XCircle className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* 2. Follow-up */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_followup`, () => handleConvertStatus(lead.id, 'Negotiation'))}
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 transition-colors border border-amber-200/30"
                                title="Convert to Follow-up"
                              >
                                {actionLoadingKey === `${lead.id}_followup` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* 3. Client */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_client`, () => handleConvertStatus(lead.id, 'Closed Won'))}
                                className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors border border-indigo-200/30"
                                title="Convert to Client"
                              >
                                {actionLoadingKey === `${lead.id}_client` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                                ) : (
                                  <Briefcase className="w-3.5 h-3.5" />
                                )}
                              </button>

                              {/* Delete Lead */}
                              <button
                                onClick={() => triggerActionWithLoading(`${lead.id}_delete`, () => handleDeleteLead(lead.id))}
                                className="p-1.5 rounded-lg bg-rose-50/50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors border border-rose-200/35"
                                title="Delete Lead"
                              >
                                {actionLoadingKey === `${lead.id}_delete` ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL: ADD LEAD FORM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-fadeInScale">

            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <PlusCircle className="w-5 h-5 text-royal-400" />
                <h3 className="text-sm font-black font-heading tracking-wide">Add New Sales Lead</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[85vh] overflow-y-auto">
              {submitSuccess ? (
                <div className="p-8 text-center bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2 animate-fadeIn">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Lead Saved Successfully!</h3>
                  <p className="text-xs text-slate-500">Updating CRM pipelines...</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name (Optional)</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. John Doe (Optional)"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Company Name</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Requirement *</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        name="requirement"
                        required
                        rows={2}
                        value={formData.requirement}
                        onChange={handleInputChange}
                        placeholder="What is the customer requirement? (e.g. Need CRM Integration, Social Ads...)"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mobile Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="e.g. +91 98765 12345"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-mono font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address (Mail)</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="e.g. john@acme.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Location / City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="e.g. Chennai, Tamil Nadu"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Deal Value (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="number"
                          name="value"
                          value={formData.value}
                          onChange={handleInputChange}
                          placeholder="15000"
                          className="w-full pl-9 pr-2.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-mono font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lead Source</label>
                      <input
                        type="text"
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        placeholder="e.g. Google Search, Instagram, Referral..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-5 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold shadow-md flex items-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {formSubmitting ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Add Lead</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 5. MODAL: VIEW LEAD DETAILS */}
      {isViewModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-fadeInScale">

            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Target className="w-5 h-5 text-royal-400" />
                <h3 className="text-sm font-black font-heading tracking-wide">Lead Overview - {selectedLead.id}</h3>
              </div>
              <button
                onClick={() => {
                  setIsViewModalOpen(false);
                  setSelectedLead(null);
                }}
                className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-black font-heading text-slate-900 leading-snug">{selectedLead.name}</h2>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase font-mono bg-royal-50 text-royal-700 border border-royal-200">
                      {getCategoryFormattedId(selectedLead)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold flex items-center mt-0.5">
                    <Building className="w-3.5 h-3.5 text-slate-300 mr-1 shrink-0" />
                    <span>{selectedLead.company}</span>
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center space-x-1.5 ${getStatusBadgeStyle(selectedLead.status)}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotStyle(selectedLead.status)}`}></span>
                  <span>{getStatusLabel(selectedLead.status)}</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-black uppercase text-royal-600 tracking-wider font-mono">Customer Requirement</span>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {selectedLead.requirement || <span className="text-slate-400 italic font-normal">No requirement entered.</span>}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-[9px] font-bold uppercase text-slate-400">Contact Information</span>
                  <div className="space-y-1">
                    {selectedLead.phone && (
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono font-semibold">{selectedLead.phone}</span>
                        <button
                          onClick={() => {
                            setIsViewModalOpen(false);
                            handleStartCall(selectedLead);
                          }}
                          className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                        >
                          <PhoneCall className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {selectedLead.email && (
                      <div className="flex items-center space-x-1.5 text-slate-700">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-semibold">{selectedLead.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1.5 text-slate-700 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-semibold">{selectedLead.location || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-[9px] font-bold uppercase text-slate-400">Deal Metadata</span>
                  <div className="space-y-0.5 font-semibold text-slate-700">
                    <p>Value: <span className="font-mono text-royal-700">₹{(selectedLead.value || 0).toLocaleString('en-IN')}</span></p>
                    <p>Source: <span>{selectedLead.source}</span></p>
                    <p className="font-mono text-[10px] text-slate-400 mt-1">Added: {formatDateDDMMYYYY(selectedLead.dateAdded)}</p>
                  </div>
                </div>

              </div>

              {selectedLead.notes && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Internal Notes</span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-medium">
                    {selectedLead.notes}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">Quick Conversions:</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleConvertStatus(selectedLead.id, 'Negotiation');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold border border-amber-200/50 flex items-center space-x-1 transition-colors animate-pulse"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>To Follow-up</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleConvertStatus(selectedLead.id, 'Closed Won');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200/50 flex items-center space-x-1 transition-colors"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>To Client</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 6. MODAL: EDIT LEAD DETAILS */}
      {isEditModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-fadeInScale">

            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Edit className="w-5 h-5 text-royal-400" />
                <h3 className="text-sm font-black font-heading tracking-wide">Edit Lead - {selectedLead.id}</h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedLead(null);
                }}
                className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-[85vh] overflow-y-auto">
              {submitSuccess ? (
                <div className="p-8 text-center bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2 animate-fadeIn">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Lead Updated Successfully!</h3>
                  <p className="text-xs text-slate-500">Updating CRM records...</p>
                </div>
              ) : (
                <form onSubmit={handleEditFormSubmit} className="space-y-4">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                        placeholder="e.g. John Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Company Name</label>
                      <input
                        type="text"
                        name="company"
                        value={editFormData.company}
                        onChange={handleEditInputChange}
                        placeholder="e.g. Acme Corp"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Requirement *</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        name="requirement"
                        required
                        rows={2}
                        value={editFormData.requirement}
                        onChange={handleEditInputChange}
                        placeholder="What is the customer requirement?"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mobile Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="phone"
                          required
                          value={editFormData.phone}
                          onChange={handleEditInputChange}
                          placeholder="e.g. +91 98765 12345"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-mono font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Email Address (Mail)</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditInputChange}
                          placeholder="e.g. john@acme.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Location / City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                      <input
                        type="text"
                        name="location"
                        value={editFormData.location}
                        onChange={handleEditInputChange}
                        placeholder="e.g. Chennai, Tamil Nadu"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Deal Value (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="number"
                          name="value"
                          value={editFormData.value}
                          onChange={handleEditInputChange}
                          placeholder="15000"
                          className="w-full pl-9 pr-2.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-mono font-semibold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lead Source</label>
                      <input
                        type="text"
                        name="source"
                        value={editFormData.source}
                        onChange={handleEditInputChange}
                        placeholder="e.g. Google Search, Instagram, Referral..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Lead Status</label>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditInputChange}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-700"
                      >
                        <option value="Contacted">Contacted</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Follow-up</option>
                        <option value="Closed Won">Client</option>
                        <option value="Closed Lost">Canceled</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Deal Notes & Description</label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        name="notes"
                        rows={2}
                        value={editFormData.notes}
                        onChange={handleEditInputChange}
                        placeholder="Internal details..."
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3.5 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setSelectedLead(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-5 py-2 rounded-xl bg-royal-600 hover:bg-royal-700 text-white text-xs font-bold shadow-md flex items-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {formSubmitting ? (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Update Lead</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 7. MODAL: FOLLOW-UP SCHEDULING FORM */}
      {isFollowupModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-fadeInScale">

            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <CalendarDays className="w-5 h-5 text-royal-400" />
                <h3 className="text-sm font-black font-heading tracking-wide">Schedule Follow-up</h3>
              </div>
              <button
                onClick={() => {
                  setIsFollowupModalOpen(false);
                  setSelectedLead(null);
                }}
                className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {submitSuccess ? (
                <div className="p-6 text-center bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2 animate-fadeIn">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/20 mx-auto animate-bounce">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">Follow-up Scheduled!</h3>
                  <p className="text-xs text-slate-500">Lead moved to Follow-ups queue...</p>
                </div>
              ) : (
                <form onSubmit={handleFollowupSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 leading-normal">
                    Please specify the **Date** and **Time** you plan to callback <strong>{selectedLead.name}</strong>.
                  </p>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Date *</label>
                      <input
                        type="date"
                        name="date"
                        required
                        value={followupForm.date}
                        onChange={handleFollowupInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Time *</label>
                      <input
                        type="time"
                        name="time"
                        required
                        value={followupForm.time}
                        onChange={handleFollowupInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Follow-up Notes / Goal *</label>
                    <textarea
                      name="notes"
                      required
                      rows={3}
                      value={followupForm.notes}
                      onChange={handleFollowupInputChange}
                      placeholder="e.g. Call back to discuss custom proposal modifications..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-royal-500 bg-white font-semibold text-slate-800"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFollowupModalOpen(false);
                        setSelectedLead(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md flex items-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {formSubmitting ? (
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Schedule & Move</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 8. MODAL: CALL SIMULATOR PANEL */}
      {activeCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xs w-full border border-slate-200 shadow-2xl p-5 text-center space-y-3.5 relative overflow-hidden animate-fadeInScale">

            {/* Soft Ambient Glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl"></div>

            {/* Call State Header */}
            <div className="space-y-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200/80 uppercase tracking-widest font-mono animate-pulse">
                {isCallEnded ? 'CALL ENDED' : 'ONGOING CALL'}
              </span>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Neural-X VoIP Sim v1.0</p>
            </div>

            {/* Calling animation / Avatar */}
            <div className="relative w-16 h-16 mx-auto my-1">
              {!isCallEnded && (
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
              )}
              <div className="relative w-16 h-16 rounded-full bg-slate-50 border-2 border-emerald-500/60 flex items-center justify-center shadow-md">
                <Users className="w-7 h-7 text-emerald-600" />
              </div>
            </div>

            {/* Lead Name / Info */}
            <div className="space-y-0.5">
              <h3 className="text-base font-black text-slate-900 font-heading tracking-tight">{activeCall.name}</h3>
              <p className="text-xs text-slate-500 font-mono font-semibold">{activeCall.phone}</p>
              <p className="text-xs text-royal-600 font-bold">{activeCall.company}</p>
            </div>

            {/* Call timer */}
            <div className="text-xl font-mono font-black text-emerald-600 py-1.5 bg-emerald-50/70 rounded-xl border border-emerald-200/60 max-w-[160px] mx-auto shadow-2xs">
              {isCallEnded ? 'Call Summary' : formatCallTime(callDuration)}
            </div>

            {/* Call Actions */}
            {!isCallEnded ? (
              <button
                onClick={handleEndCall}
                className="w-12 h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 transition-all mx-auto active:scale-90 cursor-pointer"
                title="Hang up"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            ) : (
              <div className="space-y-2 pt-3 border-t border-slate-100 animate-fadeIn">
                <p className="text-[11px] text-slate-500 font-bold">Select call outcome to categorize lead:</p>

                <div className="grid grid-cols-1 gap-2 text-xs">
                  {/* Convert to Follow-up */}
                  <button
                    onClick={() => handleCallOutcome('followup')}
                    className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-left px-3.5 font-bold flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>1. Convert to Follow-up</span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </button>

                  {/* Convert to Client */}
                  <button
                    onClick={() => handleCallOutcome('client')}
                    className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-left px-3.5 font-bold flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>2. Convert to Client</span>
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                  </button>

                  {/* Mark Canceled */}
                  <button
                    onClick={() => handleCallOutcome('canceled')}
                    className="w-full py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 text-left px-3.5 font-bold flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>3. Mark Canceled / Lost</span>
                    <UserX className="w-4 h-4 text-rose-600" />
                  </button>

                  {/* Close without change */}
                  <button
                    onClick={() => handleCallOutcome('none')}
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-bold transition-colors cursor-pointer"
                  >
                    Close Call Panel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MODAL: IMPORT CSV / EXCEL FILE */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">

            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black font-heading">Import Leads from CSV / Excel</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {importSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 animate-fadeIn">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-900">Import Successful!</p>
                  <p className="text-xs text-emerald-700 font-bold">{importCount} leads imported into sales pipeline.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Upload a <strong>.CSV</strong> or <strong>.XLSX</strong> file to import leads in bulk. The columns should include:
                    <span className="font-mono text-royal-700 font-bold block mt-1">Name, Company, Email, Phone, Requirement, Value, Source</span>
                  </p>

                  {/* Drop zone / File Input */}
                  <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-colors group">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition-colors mb-2" />
                    <span className="text-xs font-bold text-slate-700">Click to Select CSV / Excel File</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Supports .csv, .txt, .xlsx</span>
                    <input
                      type="file"
                      accept=".csv, .txt, .xlsx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Sample CSV Download */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Need sample format?</span>
                    <button
                      onClick={downloadSampleCSV}
                      className="text-royal-600 font-bold hover:underline flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Sample CSV</span>
                    </button>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 9. ACTION SUCCESS CENTER ANIMATION POPUP MODAL */}
      {actionSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden relative animate-fadeInScale">

            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className={`w-4 h-4 ${actionSuccessModal.color === 'indigo' ? 'text-indigo-400' :
                    actionSuccessModal.color === 'emerald' ? 'text-emerald-400' :
                      actionSuccessModal.color === 'rose' ? 'text-rose-400' :
                        'text-amber-400'
                  }`} />
                <h3 className="text-sm font-black font-heading tracking-wide">Status Converted</h3>
              </div>
              <button
                onClick={() => setActionSuccessModal(null)}
                className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-7 text-center space-y-3 ${actionSuccessModal.color === 'indigo' ? 'bg-indigo-50/40' :
                actionSuccessModal.color === 'emerald' ? 'bg-emerald-50/40' :
                  actionSuccessModal.color === 'rose' ? 'bg-rose-50/40' :
                    'bg-amber-50/40'
              }`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg mx-auto animate-bounce ${actionSuccessModal.color === 'indigo' ? 'bg-indigo-600 text-white shadow-indigo-600/30' :
                  actionSuccessModal.color === 'emerald' ? 'bg-emerald-500 text-white shadow-emerald-500/30' :
                    actionSuccessModal.color === 'rose' ? 'bg-rose-500 text-white shadow-rose-500/30' :
                      'bg-amber-500 text-white shadow-amber-500/30'
                }`}>
                {actionSuccessModal.iconType === 'Briefcase' ? (
                  <Briefcase className="w-7 h-7" />
                ) : actionSuccessModal.iconType === 'UserCheck' ? (
                  <UserCheck className="w-7 h-7" />
                ) : actionSuccessModal.iconType === 'XCircle' ? (
                  <XCircle className="w-7 h-7" />
                ) : actionSuccessModal.iconType === 'Clock' ? (
                  <Clock className="w-7 h-7" />
                ) : (
                  <CheckCircle2 className="w-7 h-7" />
                )}
              </div>
              <h3 className="text-base font-black text-slate-900 font-heading tracking-tight">{actionSuccessModal.title}</h3>
              <p className="text-xs text-slate-500 font-medium">{actionSuccessModal.subtitle}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
