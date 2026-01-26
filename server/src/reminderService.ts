import pool from './db.js';
// import twilio from 'twilio';  // Uncomment when ready to use SMS/WhatsApp
import dotenv from 'dotenv';

dotenv.config();

// SMS/WhatsApp integration disabled for now
// Will be enabled with paid WhatsApp API in future
const smsEnabled = false;

// Check for pending reminders every minute
export function startReminderService() {
  console.log('📢 Reminder service started (Console mode - SMS disabled)');
  
  setInterval(async () => {
    try {
      await checkAndSendReminders();
    } catch (error) {
      console.error('Error in reminder service:', error);
    }
  }, 60000); // Check every 1 minute
}

async function checkAndSendReminders() {
  try {
    // Get all diaries with reminders enabled
    const result = await pool.query(`
      SELECT d.*, u.name, u.phone 
      FROM diaries d
      JOIN users u ON d.lawyer_id = u.id
      WHERE d.reminder_enabled = true 
        AND d.reminder_date IS NOT NULL 
        AND d.reminder_time IS NOT NULL
    `);

    const now = new Date();
    
    for (const diary of result.rows) {
      const reminderDateTime = new Date(`${diary.reminder_date}T${diary.reminder_time}`);
      
      // Check if reminder time is within the next 5 minutes
      const timeDiff = reminderDateTime.getTime() - now.getTime();
      const minutesDiff = Math.floor(timeDiff / 60000);
      
      if (minutesDiff >= 0 && minutesDiff <= 5) {
        await sendReminder(diary);
        
        // Disable reminder after sending
        await pool.query(
          'UPDATE diaries SET reminder_enabled = false WHERE id = $1',
          [diary.id]
        );
        
        console.log(`✅ Reminder processed for diary ${diary.case_number}`);
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

async function sendReminder(diary: any) {
  const message = `Legal Diary Reminder\n\nCase: ${diary.case_number}\nParty: ${diary.party_names}\nCourt: ${diary.court_name}\nPurpose: ${diary.purpose_of_hearing}\nDate: ${new Date(diary.matter_date).toLocaleDateString('en-IN')}\n\nGood luck with your hearing!`;
  
  console.log('\n📱 Reminder Notification:');
  console.log(`Lawyer: ${diary.name}`);
  console.log(`Phone: ${diary.phone}`);
  console.log(`Message: ${message}`);
  console.log('ℹ️  SMS/WhatsApp integration will be enabled in future\n');
  
  // TODO: Enable when WhatsApp Business API is integrated
  // if (smsEnabled) {
  //   await sendWhatsAppMessage(diary.phone, message);
  // }
}
