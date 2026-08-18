import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// TiDB Database Connection Pool configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.DB_PORT || '4000', 10),
  user: process.env.DB_USER || '2NZ98TsqYW9Ftow.root',
  password: process.env.DB_PASSWORD || 'IbLVkvv6WzgJB8k8',
  database: process.env.DB_DATABASE || 'dmcrm',
  ssl: {
    minVersion: 'TLSv1.2',
    rejectUnauthorized: false
  },
  connectionLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection & Auto-initialize tables on startup
async function initDb() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to TiDB Cloud Database');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(100),
        location VARCHAR(255),
        source VARCHAR(255),
        status VARCHAR(100),
        value DECIMAL(15, 2) DEFAULT 0.00,
        notes TEXT,
        requirement TEXT,
        dateAdded VARCHAR(100)
      )
    `);
    
    console.log('✅ TiDB database tables initialized');
    connection.release();
  } catch (error) {
    console.error('❌ Failed to connect or initialize TiDB database:', error);
  }
}
initDb();

// In-memory data store for CRM session (Attendance logs kept in-memory for live demo/backup)
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

let stats = {
  leads: { count: 0, change: '+14% this week', active: 0 },
  quotations: { count: 34, pendingValue: '₹1,42,500', approved: 26 },
  invoices: { count: 89, totalRevenue: '₹0', unpaid: 5 },
  userNotes: { count: 56, pinned: 12 },
  meetings: { today: 4, upcoming: 12 }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'connected', message: 'CRM Backend API Server Running' });
});

// GET all leads from TiDB
app.get('/api/leads', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM leads ORDER BY dateAdded DESC, id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Database error fetching leads' });
  }
});

// CREATE new lead in TiDB
app.post('/api/leads', async (req, res) => {
  try {
    const { name, company, email, phone, location, source, status, value, notes, requirement } = req.body;
    const leadName = (name && name.trim()) || (company && company.trim()) || (phone && phone.trim()) || (email && email.trim()) || `Lead-${Math.floor(100 + Math.random() * 900)}`;
    const id = `ld_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const dateAdded = new Date().toISOString().split('T')[0];
    const leadVal = Number(value) || 0;

    await pool.query(
      `INSERT INTO leads (id, name, company, email, phone, location, source, status, value, notes, requirement, dateAdded)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, leadName, company || 'Individual', email || '', phone || '', location || '', source || 'Google Search', status || 'Contacted', leadVal, notes || '', requirement || '', dateAdded]
    );

    res.json({
      id, name: leadName, company: company || 'Individual', email: email || '', phone: phone || '', location: location || '', source: source || 'Google Search', status: status || 'Contacted', value: leadVal, notes: notes || '', requirement: requirement || '', dateAdded
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Database error creating lead' });
  }
});

// UPDATE lead in TiDB
app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, company, email, phone, location, source, status, value, notes, requirement } = req.body;
    const leadVal = Number(value) || 0;

    // Check if exists
    const [exists] = await pool.query('SELECT id FROM leads WHERE id = ?', [id]);
    if (exists.length === 0) {
      const dateAdded = new Date().toISOString().split('T')[0];
      await pool.query(
        `INSERT INTO leads (id, name, company, email, phone, location, source, status, value, notes, requirement, dateAdded)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name || 'Lead', company || 'Individual', email || '', phone || '', location || '', source || 'Google Search', status || 'Contacted', leadVal, notes || '', requirement || '', dateAdded]
      );
      return res.json({ id, name, company, email, phone, location, source, status, value: leadVal, notes, requirement, dateAdded });
    }

    // Update existing
    await pool.query(
      `UPDATE leads SET name = ?, company = ?, email = ?, phone = ?, location = ?, source = ?, status = ?, value = ?, notes = ?, requirement = ?
       WHERE id = ?`,
      [name, company, email, phone, location, source, status, leadVal, notes, requirement, id]
    );

    res.json({ id, name, company, email, phone, location, source, status, value: leadVal, notes, requirement });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Database error updating lead' });
  }
});

// DELETE lead in TiDB
app.delete('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [exists] = await pool.query('SELECT * FROM leads WHERE id = ?', [id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    await pool.query('DELETE FROM leads WHERE id = ?', [id]);
    res.json({ success: true, deleted: exists[0] });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Database error deleting lead' });
  }
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

// GET stats combining TiDB data
app.get('/api/stats', async (req, res) => {
  try {
    const [allLeads] = await pool.query('SELECT * FROM leads');
    const [wonLeads] = await pool.query("SELECT SUM(value) as totalVal FROM leads WHERE status = 'Closed Won'");
    const totalWonValue = wonLeads[0]?.totalVal || 0;

    const dynamicStats = {
      leads: { count: allLeads.length, change: '+14% this week', active: allLeads.filter(l => l.status === 'Closed Won').length },
      quotations: { count: 34, pendingValue: '₹1,42,500', approved: 26 },
      invoices: { count: 89, totalRevenue: `₹${Number(totalWonValue).toLocaleString('en-IN')}`, unpaid: 5 },
      userNotes: { count: 56, pinned: 12 },
      meetings: { today: 4, upcoming: 12 }
    };
    res.json(dynamicStats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Database error fetching stats' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CRM Backend API Server running on port ${PORT}`);
});

export default app;
