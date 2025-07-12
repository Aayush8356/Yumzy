#!/usr/bin/env node

/**
 * Email Test Utility
 * 
 * This script helps test your email configuration without going through
 * the full application flow.
 * 
 * Usage:
 *   node scripts/test-email.js your-email@example.com
 * 
 * Make sure to set up your Gmail App Password in .env.local first:
 *   GMAIL_USER=your-email@gmail.com
 *   GMAIL_APP_PASSWORD=your-16-character-app-password
 */

import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testEmail(recipientEmail) {
  console.log('🧪 Testing email configuration...\n')

  // Check environment variables
  const gmailUser = process.env.GMAIL_USER
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD
  
  if (!gmailUser || !gmailAppPassword) {
    console.error('❌ Missing email configuration!')
    console.log('Please add these to your .env.local file:')
    console.log('GMAIL_USER=your-email@gmail.com')
    console.log('GMAIL_APP_PASSWORD=your-16-character-app-password')
    console.log('\nSee EMAIL_SETUP.md for detailed instructions.')
    process.exit(1)
  }

  console.log(`📧 Gmail User: ${gmailUser}`)
  console.log(`🔑 App Password: ${'*'.repeat(gmailAppPassword.length)} (${gmailAppPassword.length} characters)`)
  console.log(`📬 Recipient: ${recipientEmail}\n`)

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })

    // Verify connection
    console.log('🔄 Verifying SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection verified!')

    // Send test email
    console.log('📤 Sending test email...')
    const info = await transporter.sendMail({
      from: `Yumzy Test <${gmailUser}>`,
      to: recipientEmail,
      subject: '🧪 Yumzy Email Test - Configuration Working!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e11d48;">🍕 Yumzy Email Test</h1>
            <p style="color: #666;">Your email configuration is working perfectly!</p>
          </div>
          
          <div style="background-color: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #15803d; margin-top: 0;">✅ Configuration Status</h2>
            <ul style="color: #166534; margin: 15px 0; padding-left: 20px;">
              <li>Gmail App Password: Working</li>
              <li>SMTP Connection: Successful</li>
              <li>Email Delivery: Confirmed</li>
              <li>HTML Templates: Rendering correctly</li>
            </ul>
          </div>

          <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">📋 Test Details</h3>
            <p style="color: #6b7280; margin: 5px 0;"><strong>From:</strong> ${gmailUser}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>To:</strong> ${recipientEmail}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
            <p style="color: #6b7280; margin: 5px 0;"><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #9ca3af; font-size: 14px;">
              This is an automated test email from your Yumzy food delivery application.
            </p>
            <p style="color: #9ca3af; font-size: 14px;">
              You can now proceed with confidence that your email system is properly configured! 🚀
            </p>
          </div>
        </div>
      `,
      text: `
🍕 Yumzy Email Test

Your email configuration is working perfectly!

✅ Configuration Status:
- Gmail App Password: Working
- SMTP Connection: Successful  
- Email Delivery: Confirmed
- HTML Templates: Rendering correctly

📋 Test Details:
From: ${gmailUser}
To: ${recipientEmail}
Test Time: ${new Date().toLocaleString()}
Environment: ${process.env.NODE_ENV || 'development'}

This is an automated test email from your Yumzy food delivery application.
You can now proceed with confidence that your email system is properly configured! 🚀
      `.trim()
    })

    console.log('✅ Test email sent successfully!')
    console.log(`📬 Message ID: ${info.messageId}`)
    
    if (process.env.NODE_ENV === 'development' && info.preview) {
      console.log(`👀 Preview URL: ${info.preview}`)
    }
    
    console.log('\n🎉 Email configuration test completed successfully!')
    console.log('Your Yumzy application is now ready to send emails to users.')
    
  } catch (error) {
    console.error('❌ Email test failed:')
    console.error(error.message)
    
    if (error.code === 'EAUTH') {
      console.log('\n💡 Authentication failed. Please check:')
      console.log('1. Your Gmail credentials are correct')
      console.log('2. 2-Factor Authentication is enabled on your Gmail account')
      console.log('3. You\'re using an App Password, not your regular Gmail password')
      console.log('4. The App Password is the full 16-character code without spaces')
    } else if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Network connection failed. Please check your internet connection.')
    }
    
    console.log('\nSee EMAIL_SETUP.md for detailed troubleshooting steps.')
    process.exit(1)
  }
}

// Get recipient email from command line argument
const recipientEmail = process.argv[2]

if (!recipientEmail) {
  console.error('❌ Please provide a recipient email address.')
  console.log('Usage: node scripts/test-email.js your-email@example.com')
  process.exit(1)
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!emailRegex.test(recipientEmail)) {
  console.error('❌ Please provide a valid email address.')
  process.exit(1)
}

// Run the test
testEmail(recipientEmail).catch(console.error)