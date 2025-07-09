import { NextResponse } from 'next/server'

// Generate auto-reply email content
function generateAutoReplyEmail(name: string, subject: string, ticketNumber: string) {
  return {
    subject: `Re: ${subject} - Thank you for contacting SavoryStack [${ticketNumber}]`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: 0; }
          .ticket-box { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .response-time { background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .contact-info { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍕 SavoryStack</h1>
            <p>Thank you for reaching out to us!</p>
          </div>
          
          <div class="content">
            <h2>Hi ${name}!</h2>
            
            <p>Thank you for contacting SavoryStack support. We've received your message and wanted to let you know that we're on it!</p>
            
            <div class="ticket-box">
              <h3>📋 Your Support Ticket</h3>
              <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="response-time">
              <h3>⏰ What's Next?</h3>
              <p>Our support team will review your message and respond within <strong>24 hours</strong> (usually much sooner!). For urgent order-related issues, please call us at <strong>+1 (555) 123-FOOD</strong>.</p>
            </div>
            
            <div class="contact-info">
              <h3>📞 Need Immediate Help?</h3>
              <p><strong>Phone:</strong> +1 (555) 123-FOOD (24/7)</p>
              <p><strong>Email:</strong> support@savorystack.com</p>
              <p><strong>Live Chat:</strong> Available on our website 9 AM - 11 PM</p>
            </div>
            
            <p>In the meantime, you might find answers to common questions in our <a href="#" style="color: #ff6b35;">FAQ section</a>.</p>
            
            <a href="#" class="button">Track Your Ticket</a>
            
            <p>Thanks for choosing SavoryStack!</p>
            <p>The SavoryStack Support Team</p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #666; font-size: 12px;">
              This is an automated message. Please do not reply to this email.<br>
              If you have additional questions, please contact us through our website or call our support line.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Generate admin notification email content
function generateAdminNotificationEmail(name: string, email: string, subject: string, message: string, messageId: string) {
  return {
    subject: `🚨 New Contact Form Submission: ${subject}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 20px; border: 1px solid #ddd; }
          .message-details { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
          .urgent { background: #fff3cd; padding: 10px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 New Contact Form Submission</h1>
          </div>
          
          <div class="content">
            <div class="urgent">
              <strong>⚠️ Action Required:</strong> A new contact form submission requires your attention.
            </div>
            
            <div class="message-details">
              <h3>📋 Message Details</h3>
              <p><strong>Message ID:</strong> ${messageId}</p>
              <p><strong>From:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <div class="message-details">
              <h3>💬 Message Content</h3>
              <p style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #ddd;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            
            <p><strong>Response Required:</strong> Please respond to this customer within 24 hours.</p>
            
            <a href="mailto:${email}?subject=Re: ${subject}&body=Hi ${name},%0A%0AThank you for contacting SavoryStack." 
               style="display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0;">
              Reply to Customer
            </a>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Auto-reply email function
export async function sendAutoReplyEmail({ name, email, subject, messageId, ticketNumber }: {
  name: string
  email: string
  subject: string
  messageId: string
  ticketNumber: string
}) {
  try {
    // Mock email service - replace with actual email service (SendGrid, Nodemailer, etc.)
    const autoReplyContent = generateAutoReplyEmail(name, subject, ticketNumber)
    
    // Simulate email sending
    console.log('📧 Sending auto-reply email to:', email)
    console.log('Subject:', autoReplyContent.subject)
    console.log('Content:', autoReplyContent.html)
    
    return { success: true, provider: 'mock' }
  } catch (error) {
    console.error('Auto-reply email error:', error)
    return { success: false, error: 'error.message' }
  }
}

// Admin notification email function
export async function sendAdminNotificationEmail({ name, email, subject, message, messageId }: {
  name: string
  email: string
  subject: string
  message: string
  messageId: string
}) {
  try {
    const adminContent = generateAdminNotificationEmail(name, email, subject, message, messageId)
    
    console.log('📧 Sending admin notification email')
    console.log('Subject:', adminContent.subject)
    console.log('Content:', adminContent.html)
    
    return { success: true, provider: 'mock' }
  } catch (error) {
    console.error('Admin notification email error:', error)
    return { success: false, error: 'error.message' }
  }
}
