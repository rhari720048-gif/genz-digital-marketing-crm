import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory data store for CRM session
let userState = {
  id: 'usr_01',
  name: 'Alex Morgan',
  role: 'Head of Growth Marketing',
  email: 'alex.m@genzneuralx.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  isCheckedIn: false,
  checkInTime: null,
  totalHoursToday: '3h 45m',
  department: 'Marketing Strategy & Leads',
  location: 'Chennai Tech Park / Hybrid'
};

let attendanceLogs = [
  { id: 1, date: 'Today', checkIn: '09:15 AM', checkOut: 'In Progress', hours: 'Calculating...', status: 'Active' },
  { id: 2, date: 'Yesterday', checkIn: '09:00 AM', checkOut: '06:30 PM', hours: '9h 30m', status: 'Completed' },
  { id: 3, date: '09 Aug 2026', checkIn: '09:05 AM', checkOut: '06:15 PM', hours: '9h 10m', status: 'Completed' },
  { id: 4, date: '08 Aug 2026', checkIn: '08:55 AM', checkOut: '05:45 PM', hours: '8h 50m', status: 'Completed' },
];

let leadsList = [];

let stats = {
  leads: { count: 5, change: '+14% this week', active: 1 },
  quotations: { count: 34, pendingValue: '₹1,42,500', approved: 26 },
  invoices: { count: 89, totalRevenue: '₹3,84,200', unpaid: 5 },
  userNotes: { count: 56, pinned: 12 },
  meetings: { today: 4, upcoming: 12 }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CRM Backend API Server Running' });
});

app.get('/api/leads', (req, res) => {
  res.json(leadsList);
});

app.post('/api/leads', (req, res) => {
  const { name, company, email, phone, location, source, status, value, notes, requirement } = req.body;
  const leadName = (name && name.trim()) || (company && company.trim()) || (phone && phone.trim()) || (email && email.trim()) || `Lead-${Math.floor(100 + Math.random() * 900)}`;

  const newLead = {
    id: `ld_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: leadName,
    company: company || 'Individual',
    email: email || '',
    phone: phone || '',
    location: location || '',
    source: source || 'Google Search',
    status: status || 'Contacted',
    value: Number(value) || 0,
    notes: notes || '',
    requirement: requirement || '',
    dateAdded: new Date().toISOString().split('T')[0]
  };

  leadsList.unshift(newLead);
  res.json(newLead);
});

app.put('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const index = leadsList.findIndex(l => l.id === id);
  if (index === -1) {
    const newEntry = { ...req.body, id };
    leadsList.unshift(newEntry);
    return res.json(newEntry);
  }

  leadsList[index] = {
    ...leadsList[index],
    ...req.body,
    id
  };

  res.json(leadsList[index]);
});

app.delete('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const index = leadsList.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Lead not found' });
  }

  const deleted = leadsList.splice(index, 1);
  res.json({ success: true, deleted: deleted[0] });
});

app.get('/api/user', (req, res) => {
  const hour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon';
  else if (hour >= 17) timeGreeting = 'Good Evening';

  res.json({
    ...userState,
    greeting: `${timeGreeting}, ${userState.name.split(' ')[0]}`
  });
});

app.post('/api/attendance/toggle', (req, res) => {
  userState.isCheckedIn = !userState.isCheckedIn;
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (userState.isCheckedIn) {
    userState.checkInTime = nowStr;
    attendanceLogs.unshift({
      id: Date.now(),
      date: 'Today',
      checkIn: nowStr,
      checkOut: 'In Progress',
      hours: 'Counting...',
      status: 'Active'
    });
  } else {
    if (attendanceLogs.length > 0 && attendanceLogs[0].status === 'Active') {
      attendanceLogs[0].checkOut = nowStr;
      attendanceLogs[0].hours = '7h 15m';
      attendanceLogs[0].status = 'Completed';
    }
    userState.checkInTime = null;
  }

  res.json({
    success: true,
    isCheckedIn: userState.isCheckedIn,
    checkInTime: userState.checkInTime,
    message: userState.isCheckedIn ? `Successfully checked in at ${nowStr}!` : `Checked out at ${nowStr}. Have a great rest of the day!`
  });
});

app.get('/api/attendance/logs', (req, res) => {
  res.json({
    isCheckedIn: userState.isCheckedIn,
    checkInTime: userState.checkInTime,
    logs: attendanceLogs
  });
});

app.get('/api/stats', (req, res) => {
  stats.leads.count = leadsList.length;
  stats.leads.active = leadsList.filter(l => l.status === 'Closed Won').length;
  res.json(stats);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CRM Backend API Server running on port ${PORT}`);
});

export default app;
