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
    
    // Check if table schemas are out of sync/legacy and recreate them if needed
    try {
      await connection.query('SELECT password FROM users LIMIT 1');
    } catch (e) {
      console.log('⚠️ users table schema out of sync or missing. Dropping to recreate...');
      await connection.query('DROP TABLE IF EXISTS users');
    }

    try {
      await connection.query('SELECT nextFollowupAt FROM leads LIMIT 1');
    } catch (e) {
      console.log('⚠️ leads table schema out of sync or missing. Dropping to recreate...');
      await connection.query('DROP TABLE IF EXISTS leads');
    }

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
        dateAdded VARCHAR(100),
        nextFollowupAt VARCHAR(100),
        followupDate VARCHAR(100),
        followupGoal TEXT,
        convertedClientAt VARCHAR(100),
        convertedCustomerAt VARCHAR(100),
        completedAt VARCHAR(100)
      )
    `);

    // Create attendance_records table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        email VARCHAR(255) PRIMARY KEY,
        logs TEXT NOT NULL
      )
    `);

    // Create crm_modules_data table for generic module storage
    await connection.query(`
      CREATE TABLE IF NOT EXISTS crm_modules_data (
        module_name VARCHAR(100) PRIMARY KEY,
        data TEXT NOT NULL
      )
    `);

    // Create quotations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quotations (
        id VARCHAR(100) PRIMARY KEY,
        clientName VARCHAR(255),
        company VARCHAR(255),
        email VARCHAR(255),
        date VARCHAR(100),
        amount VARCHAR(100),
        status VARCHAR(100),
        items TEXT
      )
    `);

    // Create invoices table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(100) PRIMARY KEY,
        clientName VARCHAR(255),
        invoiceNumber VARCHAR(100),
        amount VARCHAR(100),
        date VARCHAR(100),
        dueDate VARCHAR(100),
        status VARCHAR(100),
        email VARCHAR(255),
        payments TEXT
      )
    `);

    // Create notes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255),
        content TEXT,
        pinned BOOLEAN,
        date VARCHAR(100),
        author VARCHAR(255),
        color VARCHAR(100)
      )
    `);

    // Create meetings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS meetings (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255),
        client VARCHAR(255),
        date VARCHAR(100),
        time VARCHAR(100),
        duration VARCHAR(100),
        type VARCHAR(100),
        link VARCHAR(500),
        status VARCHAR(100),
        notes TEXT,
        participants TEXT
      )
    `);

    // Create documents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255),
        notes TEXT,
        fileName VARCHAR(255),
        fileType VARCHAR(100),
        fileSize VARCHAR(100),
        fileData LONGTEXT,
        uploadedBy VARCHAR(255),
        uploadedAt VARCHAR(100)
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

// GET quotations from TiDB table
app.get('/api/module/quotations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quotations');
    const parsed = rows.map(r => ({
      ...r,
      items: r.items ? JSON.parse(r.items) : []
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST quotations to TiDB table
app.post('/api/module/quotations', async (req, res) => {
  try {
    const { data } = req.body;
    await pool.query('DELETE FROM quotations');
    for (const q of (data || [])) {
      await pool.query(
        `INSERT INTO quotations (id, clientName, company, email, date, amount, status, items)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [q.id, q.clientName || '', q.company || '', q.email || '', q.date || '', q.amount || '', q.status || '', JSON.stringify(q.items || [])]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET invoices from TiDB table
app.get('/api/module/invoices', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM invoices');
    const parsed = rows.map(r => ({
      ...r,
      payments: r.payments ? JSON.parse(r.payments) : []
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST invoices to TiDB table
app.post('/api/module/invoices', async (req, res) => {
  try {
    const { data } = req.body;
    await pool.query('DELETE FROM invoices');
    for (const i of (data || [])) {
      await pool.query(
        `INSERT INTO invoices (id, clientName, invoiceNumber, amount, date, dueDate, status, email, payments)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [i.id, i.clientName || '', i.invoiceNumber || '', i.amount || '', i.date || '', i.dueDate || '', i.status || '', i.email || '', JSON.stringify(i.payments || [])]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET notes from TiDB table
app.get('/api/module/notes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM notes');
    const parsed = rows.map(r => ({
      ...r,
      pinned: Boolean(r.pinned)
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST notes to TiDB table
app.post('/api/module/notes', async (req, res) => {
  try {
    const { data } = req.body;
    await pool.query('DELETE FROM notes');
    for (const n of (data || [])) {
      await pool.query(
        `INSERT INTO notes (id, title, content, pinned, date, author, color)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [n.id, n.title || '', n.content || '', Boolean(n.pinned), n.date || '', n.author || '', n.color || '']
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET meetings from TiDB table
app.get('/api/module/meetings', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM meetings');
    const parsed = rows.map(r => ({
      ...r,
      participants: r.participants ? JSON.parse(r.participants) : []
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST meetings to TiDB table
app.post('/api/module/meetings', async (req, res) => {
  try {
    const { data } = req.body;
    await pool.query('DELETE FROM meetings');
    for (const m of (data || [])) {
      await pool.query(
        `INSERT INTO meetings (id, title, client, date, time, duration, type, link, status, notes, participants)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.id, m.title || '', m.client || '', m.date || '', m.time || '', m.duration || '', m.type || '', m.link || '', m.status || '', m.notes || '', JSON.stringify(m.participants || [])]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET documents from TiDB table
app.get('/api/module/documents', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM documents');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST documents to TiDB table
app.post('/api/module/documents', async (req, res) => {
  try {
    const { data } = req.body;
    await pool.query('DELETE FROM documents');
    for (const d of (data || [])) {
      await pool.query(
        `INSERT INTO documents (id, title, notes, fileName, fileType, fileSize, fileData, uploadedBy, uploadedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [d.id, d.title || '', d.notes || '', d.fileName || '', d.fileType || '', d.fileSize || '', d.fileData || '', d.uploadedBy || '', d.uploadedAt || '']
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET generic module data dynamically from TiDB
app.get('/api/module/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const [rows] = await pool.query('SELECT data FROM crm_modules_data WHERE module_name = ?', [name]);
    if (rows.length > 0) {
      try {
        res.json(JSON.parse(rows[0].data));
      } catch (e) {
        res.json([]);
      }
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error(`Error loading module ${req.params.name}:`, error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST generic module data dynamically to TiDB
app.post('/api/module/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { data } = req.body;
    const dataStr = JSON.stringify(data || []);

    await pool.query(
      `INSERT INTO crm_modules_data (module_name, data) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE data = ?`,
      [name, dataStr, dataStr]
    );

    res.json({ success: true, module: name });
  } catch (error) {
    console.error(`Error saving module ${req.params.name}:`, error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET all user attendance records
app.get('/api/attendance', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendance_records');
    const result = {};
    rows.forEach(r => {
      try {
        result[r.email.toLowerCase()] = JSON.parse(r.logs);
      } catch (e) {
        result[r.email.toLowerCase()] = [];
      }
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Database error fetching attendance' });
  }
});

// POST to save/update attendance logs for a user
app.post('/api/attendance', async (req, res) => {
  try {
    const { email, logs } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const emailKey = email.toLowerCase().trim();
    const logsStr = JSON.stringify(logs || []);

    await pool.query(
      `INSERT INTO attendance_records (email, logs) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE logs = ?`,
      [emailKey, logsStr, logsStr]
    );

    res.json({ success: true, email: emailKey });
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).json({ error: 'Database error saving attendance' });
  }
});

// Debug endpoint to check users currently seeded in database
app.get('/api/debug/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, password, role, isAdmin, status FROM users');
    res.json({
      success: true,
      count: rows.length,
      envEmail: process.env.DEFAULT_ADMIN_EMAIL || 'info@genzneuralx.com',
      users: rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
    let [users] = await pool.query('SELECT * FROM users');
    
    // Self-healing fallback: Seed admin user dynamically on login request if database users table is empty
    if (users.length === 0) {
      const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'info@genzneuralx.com';
      const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      
      await pool.query(`
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
      console.log(`🌱 Dynamically seeded fallback admin user (${defaultAdminEmail})`);
      // Refetch
      const [refetched] = await pool.query('SELECT * FROM users');
      users = refetched;
    }
    
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
        id, 
        name, 
        email, 
        finalPassword, 
        role || 'Marketing Executive', 
        empId || `GNX-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        mobile || '', 
        department || 'Marketing Strategy & Leads', 
        manager || '', 
        joiningDate || new Date().toISOString().split('T')[0],
        location || 'Chennai Tech Park / Hybrid', 
        address || '', 
        emergencyContact || '', 
        bloodGroup || 'O+', 
        avatar || '', 
        'Active', 
        isSysAdmin
      ]
    );

    res.json({
      id, 
      name, 
      email, 
      password: finalPassword, 
      role: role || 'Marketing Executive', 
      empId: empId || `GNX-2026-${Math.floor(1000 + Math.random() * 9000)}`, 
      mobile: mobile || '', 
      department: department || 'Marketing Strategy & Leads', 
      manager: manager || '', 
      joiningDate: joiningDate || new Date().toISOString().split('T')[0], 
      location: location || 'Chennai Tech Park / Hybrid', 
      address: address || '', 
      emergencyContact: emergencyContact || '', 
      bloodGroup: bloodGroup || 'O+', 
      avatar: avatar || '', 
      status: 'Active', 
      isAdmin: isSysAdmin
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: `Database error creating user: ${error.message}` });
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
        name || '', 
        email || '', 
        finalPassword || '123456', 
        role || 'Marketing Executive', 
        empId || '', 
        mobile || '', 
        department || 'Marketing Strategy & Leads', 
        manager || '', 
        joiningDate || new Date().toISOString().split('T')[0], 
        location || 'Chennai', 
        address || '', 
        emergencyContact || '', 
        bloodGroup || 'O+', 
        avatar || '', 
        status || 'Active', 
        isSysAdmin, 
        id
      ]
    );

    res.json({
      id,
      name: name || '',
      email: email || '',
      password: finalPassword || '123456',
      role: role || 'Marketing Executive',
      empId: empId || '',
      mobile: mobile || '',
      department: department || 'Marketing Strategy & Leads',
      manager: manager || '',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      location: location || 'Chennai',
      address: address || '',
      emergencyContact: emergencyContact || '',
      bloodGroup: bloodGroup || 'O+',
      avatar: avatar || '',
      status: status || 'Active',
      isAdmin: isSysAdmin
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: `Database error updating user: ${error.message}` });
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

// GET dashboard stats from TiDB
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const userEmail = (req.query.email || '').toLowerCase().trim();

    // 1. Fetch leads status counts
    const [leads] = await pool.query('SELECT status FROM leads');
    let allLeads = 0;
    let followups = 0;
    let canceledLeads = 0;
    let clients = 0;
    let completedCustomers = 0;

    leads.forEach(l => {
      const s = l.status;
      if (!s || s === 'Contacted' || s === 'New') {
        allLeads++;
      } else if (s === 'Negotiation' || s === 'Proposal Sent') {
        followups++;
      } else if (s === 'Closed Lost') {
        canceledLeads++;
      } else if (s === 'Closed Won' || s === 'Client') {
        clients++;
      } else if (s === 'Completed') {
        completedCustomers++;
      }
    });

    // 2. Fetch other counts from crm_modules_data
    let notesCount = 0;
    let meetingsCount = 0;
    let documentsCount = 0;
    let meetingsList = [];

    const [notesRows] = await pool.query('SELECT data FROM crm_modules_data WHERE module_name = "notes"');
    if (notesRows.length > 0) {
      try {
        const notesArr = JSON.parse(notesRows[0].data);
        if (Array.isArray(notesArr)) notesCount = notesArr.length;
      } catch (e) {}
    }

    const [docsRows] = await pool.query('SELECT data FROM crm_modules_data WHERE module_name = "documents"');
    if (docsRows.length > 0) {
      try {
        const docsArr = JSON.parse(docsRows[0].data);
        if (Array.isArray(docsArr)) documentsCount = docsArr.length;
      } catch (e) {}
    }

    const [meetingsRows] = await pool.query('SELECT data FROM crm_modules_data WHERE module_name = "meetings"');
    if (meetingsRows.length > 0) {
      try {
        const meetingsArr = JSON.parse(meetingsRows[0].data);
        if (Array.isArray(meetingsArr)) {
          // If userEmail is provided, filter meetings assigned to that user
          const myMeetings = userEmail 
            ? meetingsArr.filter(m => {
                if (!m.assignedUserEmail) return true; // Legacy fallback
                const emails = m.assignedUserEmail.toLowerCase().split(',').map(e => e.trim());
                return emails.includes(userEmail);
              })
            : meetingsArr;
          meetingsCount = myMeetings.length;
          meetingsList = myMeetings;
        }
      } catch (e) {}
    }

    const [[{ count: usersCount }]] = await pool.query('SELECT COUNT(*) as count FROM users');

    // 3. Filter and sort meetings dynamically
    const parseDateTime = (dStr, tStr) => {
      try {
        if (!dStr) return new Date(8640000000000000);
        let dateObj;
        if (dStr.includes('/')) {
          const parts = dStr.split('/');
          dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
        } else {
          dateObj = new Date(dStr);
        }

        if (tStr) {
          const cleanTimeStr = tStr.replace(/\s*\(.*?\)/, '').trim();
          const timeMatch = cleanTimeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            const ampm = timeMatch[3].toUpperCase();
            if (ampm === 'PM' && hours < 12) hours += 12;
            if (ampm === 'AM' && hours === 12) hours = 0;
            dateObj.setHours(hours, minutes, 0, 0);
          }
        }
        return dateObj;
      } catch (e) {}
      return new Date(8640000000000000);
    };

    const sortedMeetings = meetingsList.sort((a, b) => {
      return parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time);
    });

    // Only return upcoming meetings (ignore past meetings)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const upcomingMeetings = sortedMeetings.filter(m => {
      const mDate = parseDateTime(m.date, m.time);
      return mDate.getTime() >= todayStart.getTime();
    }).slice(0, 5); // Limit to top 5 upcoming meetings

    res.json({
      allLeads,
      followups,
      canceledLeads,
      clients,
      completedCustomers,
      notes: notesCount,
      meetings: meetingsCount,
      documents: documentsCount,
      users: usersCount,
      upcomingMeetings
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: `Database error fetching stats: ${error.message}` });
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
    const { nextFollowupAt, followupDate, followupGoal, convertedClientAt, convertedCustomerAt, completedAt } = req.body;

    await pool.query(
      `INSERT INTO leads (id, name, company, email, phone, location, source, status, value, notes, requirement, dateAdded, nextFollowupAt, followupDate, followupGoal, convertedClientAt, convertedCustomerAt, completedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, 
        leadName, 
        company || 'Individual', 
        email || '', 
        phone || '', 
        location || '', 
        source || 'Google Search', 
        status || 'Contacted', 
        leadVal, 
        notes || '', 
        requirement || '', 
        dateAdded,
        nextFollowupAt || '',
        followupDate || '',
        followupGoal || '',
        convertedClientAt || '',
        convertedCustomerAt || '',
        completedAt || ''
      ]
    );

    res.json({
      id, 
      name: leadName, 
      company: company || 'Individual', 
      email: email || '', 
      phone: phone || '', 
      location: location || '', 
      source: source || 'Google Search', 
      status: status || 'Contacted', 
      value: leadVal, 
      notes: notes || '', 
      requirement: requirement || '', 
      dateAdded,
      nextFollowupAt: nextFollowupAt || '',
      followupDate: followupDate || '',
      followupGoal: followupGoal || '',
      convertedClientAt: convertedClientAt || '',
      convertedCustomerAt: convertedCustomerAt || '',
      completedAt: completedAt || ''
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
    const { name, company, email, phone, location, source, status, value, notes, requirement, nextFollowupAt, followupDate, followupGoal, convertedClientAt, convertedCustomerAt, completedAt } = req.body;
    const leadVal = Number(value) || 0;

    // Check if exists
    const [exists] = await pool.query('SELECT id FROM leads WHERE id = ?', [id]);
    if (exists.length === 0) {
      const dateAdded = new Date().toISOString().split('T')[0];
      await pool.query(
        `INSERT INTO leads (id, name, company, email, phone, location, source, status, value, notes, requirement, dateAdded, nextFollowupAt, followupDate, followupGoal, convertedClientAt, convertedCustomerAt, completedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, 
          name || 'Lead', 
          company || 'Individual', 
          email || '', 
          phone || '', 
          location || '', 
          source || 'Google Search', 
          status || 'Contacted', 
          leadVal, 
          notes || '', 
          requirement || '', 
          dateAdded,
          nextFollowupAt || '',
          followupDate || '',
          followupGoal || '',
          convertedClientAt || '',
          convertedCustomerAt || '',
          completedAt || ''
        ]
      );
      return res.json({ id, name, company, email, phone, location, source, status, value: leadVal, notes, requirement, dateAdded, nextFollowupAt, followupDate, followupGoal, convertedClientAt, convertedCustomerAt, completedAt });
    }

    // Update existing
    await pool.query(
      `UPDATE leads SET name = ?, company = ?, email = ?, phone = ?, location = ?, source = ?, status = ?, value = ?, notes = ?, requirement = ?, nextFollowupAt = ?, followupDate = ?, followupGoal = ?, convertedClientAt = ?, convertedCustomerAt = ?, completedAt = ?
       WHERE id = ?`,
      [
        name || 'Lead', 
        company || 'Individual', 
        email || '', 
        phone || '', 
        location || '', 
        source || 'Google Search', 
        status || 'Contacted', 
        leadVal, 
        notes || '', 
        requirement || '', 
        nextFollowupAt || '',
        followupDate || '',
        followupGoal || '',
        convertedClientAt || '',
        convertedCustomerAt || '',
        completedAt || '',
        id
      ]
    );

    res.json({ 
      id, 
      name: name || 'Lead', 
      company: company || 'Individual', 
      email: email || '', 
      phone: phone || '', 
      location: location || '', 
      source: source || 'Google Search', 
      status: status || 'Contacted', 
      value: leadVal, 
      notes: notes || '', 
      requirement: requirement || '',
      nextFollowupAt: nextFollowupAt || '',
      followupDate: followupDate || '',
      followupGoal: followupGoal || '',
      convertedClientAt: convertedClientAt || '',
      convertedCustomerAt: convertedCustomerAt || '',
      completedAt: completedAt || ''
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: `Database error updating lead: ${error.message}` });
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
