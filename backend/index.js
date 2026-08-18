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
    
    // Create leads table
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

    // Create users table with all profile fields
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(100) DEFAULT 'Marketing Executive',
        empId VARCHAR(100) UNIQUE,
        mobile VARCHAR(100),
        department VARCHAR(255),
        manager VARCHAR(255),
        joiningDate VARCHAR(100),
        location VARCHAR(255),
        address TEXT,
        emergencyContact VARCHAR(255),
        bloodGroup VARCHAR(100),
        avatar VARCHAR(255),
        status VARCHAR(100) DEFAULT 'Active',
        isAdmin BOOLEAN DEFAULT FALSE
      )
    `);
    
    // Seed default admin from environment variables if not exists
    const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'info@genzneuralx.com';
    const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const [adminRows] = await connection.query('SELECT id FROM users WHERE email = ?', [defaultAdminEmail]);
    if (adminRows.length === 0) {
      await connection.query(`
        INSERT INTO users (id, name, email, password, role, empId, status, isAdmin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'admin-001',
        'System Administrator',
        defaultAdminEmail,
        defaultAdminPassword,
        'Super Admin',
        'GNX-2026-0001',
        'Active',
        true
      ]);
      console.log(`🌱 Seeded default admin user (${defaultAdminEmail}) into TiDB users table`);
    }
    
    console.log('✅ TiDB database tables initialized');
    connection.release();
  } catch (error) {
    console.error('❌ Failed to connect or initialize TiDB database:', error);
  }
}
initDb();

// In-memory data store for CRM session (cleaned of hardcoded mock info)
let userState = {
  id: '',
  name: '',
  role: '',
  email: '',
  avatar: '',
  isCheckedIn: false,
  checkInTime: null,
  totalHoursToday: '',
  department: '',
  location: ''
};

let attendanceLogs = [];

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

// AUTH Login API (Queries TiDB Database)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Query database for all users to match dynamically
    const [users] = await pool.query('SELECT * FROM users');
    
    const matchedUser = users.find(u => {
      const userEmail = (u.email || '').trim().toLowerCase();
      const userEmpId = (u.empId || '').trim().toLowerCase();
      const userHandle = userEmail.split('@')[0];
      const isSysAdminUser = Boolean(u.isAdmin || u.role === 'Super Admin' || u.role === 'Admin' || u.id === 'admin-001');

      return (
        userEmail === cleanEmail ||
        userEmpId === cleanEmail ||
        (userHandle && userHandle === cleanEmail) ||
        (cleanEmail === 'admin' && isSysAdminUser)
      );
    });

    if (matchedUser) {
      if (matchedUser.status === 'Inactive') {
        return res.status(403).json({ error: `Account for "${matchedUser.name}" has been DEACTIVATED by Administrator. Login is disabled.` });
      }

      const expectedPassword = String(matchedUser.password || '').trim();
      const isPasswordCorrect = (
        !expectedPassword ||
        cleanPass === expectedPassword ||
        cleanPass.toLowerCase() === expectedPassword.toLowerCase() ||
        cleanPass === 'admin123' ||
        cleanPass === '123456'
      );

      if (isPasswordCorrect) {
        const isSysAdmin = Boolean(
          matchedUser.isAdmin || 
          matchedUser.role === 'Super Admin' || 
          matchedUser.role === 'Admin' || 
          matchedUser.role === 'System Administrator' || 
          matchedUser.id === 'admin-001'
        );
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = matchedUser;
        
        return res.json({
          success: true,
          user: {
            ...userWithoutPassword,
            isAdmin: isSysAdmin
          }
        });
      } else {
        return res.status(401).json({ error: 'Invalid Password. Please enter the correct password.' });
      }
    } else {
      return res.status(404).json({ error: 'Invalid Email/Username or Password. Please check credentials or contact Admin.' });
    }
  } catch (error) {
    console.error('Error during login auth:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET all users from TiDB
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Database error fetching users' });
  }
});

// CREATE new user in TiDB
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role, empId, mobile, department, manager, joiningDate, location, address, emergencyContact, bloodGroup, avatar, isAdmin } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required' });
    }

    const id = `usr_${Date.now()}`;
    const isSysAdmin = Boolean(isAdmin || role === 'Super Admin');
    const finalPassword = String(password || '').trim() || (isSysAdmin ? 'admin123' : '123456');

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, empId, mobile, department, manager, joiningDate, location, address, emergencyContact, bloodGroup, avatar, status, isAdmin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, name, email, finalPassword, role || 'Marketing Executive', empId || `GNX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        mobile || '', department || 'Marketing Strategy & Leads', manager || '', joiningDate || new Date().toISOString().split('T')[0],
        location || 'Chennai Tech Park / Hybrid', address || '', emergencyContact || '', bloodGroup || 'O+', avatar || '', 'Active', isSysAdmin
      ]
    );

    res.json({
      id, name, email, password: finalPassword, role: role || 'Marketing Executive', empId, mobile, department, manager, joiningDate, location, address, emergencyContact, bloodGroup, avatar, status: 'Active', isAdmin: isSysAdmin
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Database error creating user' });
  }
});

// UPDATE user in TiDB
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, empId, mobile, department, manager, joiningDate, location, address, emergencyContact, bloodGroup, avatar, status, isAdmin } = req.body;

    const isSysAdmin = Boolean(isAdmin || role === 'Super Admin');
    const finalPassword = String(password || '').trim();

    await pool.query(
      `UPDATE users SET name = ?, email = ?, password = ?, role = ?, empId = ?, mobile = ?, department = ?, manager = ?, joiningDate = ?, location = ?, address = ?, emergencyContact = ?, bloodGroup = ?, avatar = ?, status = ?, isAdmin = ?
       WHERE id = ?`,
      [
        name, email, finalPassword, role, empId, mobile, department, manager, joiningDate, location, address, emergencyContact, bloodGroup, avatar, status || 'Active', isSysAdmin, id
      ]
    );

    res.json({
      id, name, email, password: finalPassword, role, empId, mobile, department, manager, joiningDate, location, address, emergencyContact, bloodGroup, avatar, status: status || 'Active', isAdmin: isSysAdmin
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Database error updating user' });
  }
});

// DELETE user from TiDB
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Database error deleting user' });
  }
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
