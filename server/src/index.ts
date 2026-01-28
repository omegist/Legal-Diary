import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import { startReminderService } from './reminderService.js';
import { initializeDatabase } from './initDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-netlify-app.netlify.app', 'https://legal-diary.netlify.app', /\.netlify\.app$/] 
    : '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Start reminder service
startReminderService();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Database initialization endpoint (run once after deployment)
app.post('/api/init-database', async (req, res) => {
  try {
    const result = await initializeDatabase();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Users
app.post('/api/users', async (req, res) => {
  try {
    const user = req.body;
    const result = await pool.query(
      `INSERT INTO users (id, role, name, email, phone, profile_photo, enrollment_number, bar_council, 
       practice_areas, years_of_experience, court_preferences, practice_details, organization, designation, bio) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [user.id, user.role, user.name, user.email, user.phone, user.profilePhoto, user.enrollmentNumber,
       user.barCouncil, user.practiceAreas, user.yearsOfExperience, user.courtPreferences, 
       user.practiceDetails, user.organization, user.designation, user.bio]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/email/:email', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [req.params.email]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const user = req.body;
    const result = await pool.query(
      `UPDATE users SET name=$1, email=$2, phone=$3, profile_photo=$4, enrollment_number=$5, 
       bar_council=$6, practice_areas=$7, years_of_experience=$8, court_preferences=$9, 
       practice_details=$10, organization=$11, designation=$12, bio=$13 WHERE id=$14 RETURNING *`,
      [user.name, user.email, user.phone, user.profilePhoto, user.enrollmentNumber, user.barCouncil,
       user.practiceAreas, user.yearsOfExperience, user.courtPreferences, user.practiceDetails,
       user.organization, user.designation, user.bio, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Diaries
app.post('/api/diaries', async (req, res) => {
  try {
    const diary = req.body;
    console.log('Received diary data:', diary);
    const result = await pool.query(
      `INSERT INTO diaries (id, lawyer_id, matter_date, court_name, case_type, case_number, 
       party_names, opponent_advocate, stage_of_case, purpose_of_hearing, notes, is_private,
       reminder_enabled, reminder_date, reminder_time) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [diary.id, diary.lawyer_id, diary.matter_date, diary.court_name, diary.case_type, diary.case_number,
       diary.party_names, diary.opponent_advocate, diary.stage_of_case, diary.purpose_of_hearing, diary.notes, 
       diary.is_private, diary.reminder_enabled, diary.reminder_date, diary.reminder_time]
    );
    console.log('Diary created:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating diary:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/diaries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM diaries ORDER BY matter_date DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/diaries/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM diaries WHERE id = $1', [req.params.id]);
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/diaries/lawyer/:lawyerId', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM diaries WHERE lawyer_id = $1 ORDER BY matter_date DESC', [req.params.lawyerId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/diaries/:id', async (req, res) => {
  try {
    const diary = req.body;
    console.log('Updating diary:', diary);
    const result = await pool.query(
      `UPDATE diaries SET matter_date=$1, court_name=$2, case_type=$3, case_number=$4, 
       party_names=$5, opponent_advocate=$6, stage_of_case=$7, purpose_of_hearing=$8, notes=$9, is_private=$10,
       reminder_enabled=$11, reminder_date=$12, reminder_time=$13, updated_at=NOW() 
       WHERE id=$14 RETURNING *`,
      [diary.matter_date, diary.court_name, diary.case_type, diary.case_number, diary.party_names,
       diary.opponent_advocate, diary.stage_of_case, diary.purpose_of_hearing, diary.notes, diary.is_private,
       diary.reminder_enabled, diary.reminder_date, diary.reminder_time, req.params.id]
    );
    console.log('Diary updated:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating diary:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/diaries/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM diaries WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Partner Relationships
app.post('/api/partner-relationships', async (req, res) => {
  try {
    const rel = req.body;
    console.log('Creating partner relationship:', rel);
    const result = await pool.query(
      'INSERT INTO partner_relationships (id, lawyer_id, partner_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [rel.id, rel.lawyer_id, rel.partner_id, rel.status]
    );
    console.log('Partner relationship created:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating partner relationship:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/partner-relationships', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM partner_relationships');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/partner-relationships/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE partner_relationships SET status = $1 WHERE id = $2 RETURNING *',
      [req.body.status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Requests
app.post('/api/requests', async (req, res) => {
  try {
    const request = req.body;
    console.log('Creating request:', request);
    const result = await pool.query(
      'INSERT INTO requests (id, type, sender_id, receiver_id, diary_id, status, message) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [request.id, request.type, request.sender_id, request.receiver_id, request.diary_id, request.status, request.message]
    );
    console.log('Request created:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/requests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM requests ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/requests/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE requests SET status = $1 WHERE id = $2 RETURNING *',
      [req.body.status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit Permissions
app.post('/api/edit-permissions', async (req, res) => {
  try {
    const perm = req.body;
    console.log('Creating edit permission:', perm);
    const result = await pool.query(
      'INSERT INTO diary_edit_permissions (id, diary_id, partner_id, can_edit, granted_by) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (diary_id, partner_id) DO UPDATE SET can_edit = $4 RETURNING *',
      [perm.id, perm.diary_id, perm.partner_id, perm.can_edit, perm.granted_by]
    );
    console.log('Edit permission created:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating edit permission:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/edit-permissions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM diary_edit_permissions');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/edit-permissions/:diaryId/:partnerId', async (req, res) => {
  try {
    console.log('Revoking edit permission for diary:', req.params.diaryId, 'partner:', req.params.partnerId);
    // Instead of deleting, set can_edit to false to keep history
    const result = await pool.query(
      'UPDATE diary_edit_permissions SET can_edit = false WHERE diary_id = $1 AND partner_id = $2 RETURNING *',
      [req.params.diaryId, req.params.partnerId]
    );
    console.log('Permission revoked:', result.rows[0]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error revoking permission:', error);
    res.status(500).json({ error: error.message });
  }
});

// Audit Logs
app.post('/api/audit-logs', async (req, res) => {
  try {
    const log = req.body;
    const result = await pool.query(
      'INSERT INTO audit_logs (id, action_type, performed_by, target_entity, target_id, details) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [log.id, log.action_type, log.performed_by, log.target_entity, log.target_id, log.details]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/audit-logs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME || 'legal_diary'}`);
});
