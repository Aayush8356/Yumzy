// Production-ready email service
import nodemailer from 'nodemailer'
import { auditLogger } from './audit-logger'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface SendEmailOptions {
  to: string
  template: EmailTemplate
  variables?: Record<string, string>
}

export class EmailService {
  private static instance: EmailService
  private transporter: nodemailer.Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  private initializeTransporter(): void {
    try {
      // Use different transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production: Priority order - Gmail App Password > Custom SMTP > SendGrid
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
          // Gmail with App Password (Most common production setup)
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER, // your-email@gmail.com
              pass: process.env.GMAIL_APP_PASSWORD, // 16-character app password
            },
          })
          console.log('✅ Gmail App Password email service configured')
        } else if (process.env.SMTP_HOST) {
          // Custom SMTP service
          this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          })
          console.log('✅ Custom SMTP email service configured')
        } else if (process.env.SENDGRID_API_KEY) {
          // SendGrid configuration
          this.transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
              user: 'apikey',
              pass: process.env.SENDGRID_API_KEY,
            },
          })
          console.log('✅ SendGrid email service configured')
        }
      } else {
        // Development: Check for Gmail credentials first, then fallback to Ethereal
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
          // Use Gmail even in development if credentials are provided
          this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.GMAIL_USER,
              pass: process.env.GMAIL_APP_PASSWORD,
            },
          })
          console.log('🔧 Development mode: Using Gmail App Password for testing')
        } else {
          // Fallback: Use Ethereal Email for testing
          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
              user: 'ethereal.user@ethereal.email',
              pass: 'ethereal.pass'
            }
          })
          console.log('🔧 Development mode: Using Ethereal Email (fake SMTP)')
        }
      }

      if (this.transporter) {
        console.log('✅ Email service initialized')
      } else {
        console.warn('⚠️ Email service not configured - emails will be logged only')
      }
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error)
    }
  }

  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    try {
      const { to, template, variables = {} } = options

      // Replace variables in template
      let { subject, html, text } = template
      
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        subject = subject.replace(new RegExp(placeholder, 'g'), value)
        html = html.replace(new RegExp(placeholder, 'g'), value)
        text = text.replace(new RegExp(placeholder, 'g'), value)
      })

      if (this.transporter) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.GMAIL_USER || 'noreply@yumzy.com',
          to,
          subject,
          html,
          text,
        }

        const result = await this.transporter.sendMail(mailOptions)
        console.log(`📧 Email sent to ${to}: ${subject}`)
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result))
        }

        // Log email activity
        await auditLogger.log({
          action: 'email_sent',
          resource: 'email_service',
          resourceId: to,
          method: 'POST',
          endpoint: '/api/email',
          ipAddress: 'system',
          userAgent: 'email-service',
          success: true,
          severity: 'low',
          category: 'system',
          metadata: { subject, recipient: to }
        })

        return true
      } else {
        // Fallback: Log email instead of sending
        console.log(`📧 [EMAIL LOG] To: ${to}`)
        console.log(`📧 [EMAIL LOG] Subject: ${subject}`)
        console.log(`📧 [EMAIL LOG] Content:\n${text}`)
        
        return true // Return true for development/testing
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      
      // Log email failure
      await auditLogger.log({
        action: 'email_failed',
        resource: 'email_service',
        resourceId: options.to,
        method: 'POST',
        endpoint: '/api/email',
        ipAddress: 'system',
        userAgent: 'email-service',
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        severity: 'medium',
        category: 'system'
      })

      return false
    }
  }

  // Email verification
  async sendEmailVerification(email: string, token: string, name: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`
    
    const template: EmailTemplate = {
      subject: 'Verify Your Email - Yumzy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e11d48; margin: 0;">🍕 Yumzy</h1>
              <p style="color: #666; margin: 5px 0;">Delicious Food Delivered</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Welcome {{name}}!</h2>
            
            <p style="color: #555; margin-bottom: 25px;">
              Thank you for registering with Yumzy! To complete your registration and start ordering delicious food, please verify your email address by clicking the button below.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{verificationUrl}}" style="background-color: #e11d48; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #555; margin-bottom: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #e11d48; word-break: break-all; margin-bottom: 25px;">
              {{verificationUrl}}
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p><strong>Why verify your email?</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Secure your account</li>
                <li>Receive order confirmations</li>
                <li>Get exclusive offers and updates</li>
                <li>Reset your password if needed</li>
              </ul>
              
              <p style="margin-top: 20px;">
                This verification link will expire in 24 hours for security reasons.
              </p>
              
              <p style="margin-top: 20px;">
                If you didn't create an account with Yumzy, please ignore this email.
              </p>
              
              <p style="margin-top: 20px; text-align: center; color: #999;">
                © 2024 Yumzy. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome {{name}}!

Thank you for registering with Yumzy! To complete your registration, please verify your email address by visiting:

{{verificationUrl}}

This verification link will expire in 24 hours.

If you didn't create an account with Yumzy, please ignore this email.

© 2024 Yumzy. All rights reserved.
      `.trim()
    }

    return this.sendEmail({
      to: email,
      template,
      variables: { name, verificationUrl }
    })
  }

  // Password reset
  async sendPasswordReset(email: string, token: string, name: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`
    
    const template: EmailTemplate = {
      subject: 'Reset Your Password - Yumzy',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e11d48; margin: 0;">🍕 Yumzy</h1>
              <p style="color: #666; margin: 5px 0;">Delicious Food Delivered</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #555; margin-bottom: 25px;">
              Hi {{name}}, we received a request to reset your password for your Yumzy account. Click the button below to reset your password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resetUrl}}" style="background-color: #e11d48; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #555; margin-bottom: 20px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #e11d48; word-break: break-all; margin-bottom: 25px;">
              {{resetUrl}}
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p><strong>Security Notice:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This reset link will expire in 1 hour</li>
                <li>Only use this link if you requested a password reset</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password won't change until you complete the reset</li>
              </ul>
              
              <p style="margin-top: 20px; text-align: center; color: #999;">
                © 2024 Yumzy. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Password Reset Request

Hi {{name}}, we received a request to reset your password for your Yumzy account.

To reset your password, visit: {{resetUrl}}

This reset link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email. Your password won't change until you complete the reset process.

© 2024 Yumzy. All rights reserved.
      `.trim()
    }

    return this.sendEmail({
      to: email,
      template,
      variables: { name, resetUrl }
    })
  }

  // Auto-reply email for contact form
  async sendAutoReplyEmail(email: string, name: string, subject: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Thank you for contacting Yumzy - We received your message',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank you for contacting us</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e11d48; margin: 0;">🍕 Yumzy</h1>
              <p style="color: #666; margin: 5px 0;">Delicious Food Delivered</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Thank you for contacting us, {{name}}!</h2>
            
            <p style="color: #555; margin-bottom: 25px;">
              We have received your message regarding: <strong>{{subject}}</strong>
            </p>
            
            <p style="color: #555; margin-bottom: 25px;">
              Our customer support team will review your message and get back to you within 24 hours.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0;">What happens next?</h3>
              <ul style="color: #555; margin: 15px 0; padding-left: 20px;">
                <li>We'll review your message within 2-4 hours</li>
                <li>A support representative will respond to you</li>
                <li>If urgent, please call us at (555) 123-FOOD</li>
              </ul>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p style="margin-top: 20px; text-align: center;">
                Need immediate help? Contact us at <a href="mailto:support@yumzy.com" style="color: #e11d48;">support@yumzy.com</a>
              </p>
              
              <p style="margin-top: 20px; text-align: center; color: #999;">
                © 2024 Yumzy. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Thank you for contacting Yumzy, {{name}}!

We have received your message regarding: {{subject}}

Our customer support team will review your message and get back to you within 24 hours.

What happens next?
- We'll review your message within 2-4 hours
- A support representative will respond to you
- If urgent, please call us at (555) 123-FOOD

Need immediate help? Contact us at support@yumzy.com

© 2024 Yumzy. All rights reserved.
      `.trim()
    }

    return this.sendEmail({
      to: email,
      template,
      variables: { name, subject }
    })
  }

  // Admin notification email for new contact form submission
  async sendAdminNotificationEmail(contactData: {
    name: string
    email: string
    subject: string
    message: string
  }): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `New Contact Form Submission - ${contactData.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Form Submission</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e11d48; margin: 0;">🍕 Yumzy Admin</h1>
              <p style="color: #666; margin: 5px 0;">New Contact Form Submission</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">New Message from {{name}}</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p><strong>From:</strong> {{name}} ({{email}})</p>
              <p><strong>Subject:</strong> {{subject}}</p>
              <p><strong>Message:</strong></p>
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
                {{message}}
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/contact-messages" style="background-color: #e11d48; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View in Admin Panel
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p style="margin-top: 20px; text-align: center; color: #999;">
                © 2024 Yumzy Admin Notifications
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Contact Form Submission

From: {{name}} ({{email}})
Subject: {{subject}}

Message:
{{message}}

View in admin panel: ${process.env.NEXT_PUBLIC_APP_URL}/admin/contact-messages

© 2024 Yumzy Admin Notifications
      `.trim()
    }

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL || 'admin@yumzy.com',
      template,
      variables: {
        name: contactData.name,
        email: contactData.email,
        subject: contactData.subject,
        message: contactData.message
      }
    })
  }

  // Welcome email after verification
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Welcome to Yumzy! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Yumzy</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e11d48; margin: 0;">🍕 Yumzy</h1>
              <p style="color: #666; margin: 5px 0;">Delicious Food Delivered</p>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Yumzy, {{name}}! 🎉</h2>
            
            <p style="color: #555; margin-bottom: 25px;">
              Your account has been verified and you're all set! Get ready to explore amazing food and have it delivered right to your doorstep.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
              <ul style="color: #555; margin: 15px 0; padding-left: 20px;">
                <li>Browse our delicious menu</li>
                <li>Add your favorite items to cart</li>
                <li>Set up your delivery address</li>
                <li>Place your first order</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/menu" style="background-color: #e11d48; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Browse Menu
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p style="margin-top: 20px; text-align: center;">
                Need help? Contact us at <a href="mailto:support@yumzy.com" style="color: #e11d48;">support@yumzy.com</a>
              </p>
              
              <p style="margin-top: 20px; text-align: center; color: #999;">
                © 2024 Yumzy. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to Yumzy, {{name}}! 🎉

Your account has been verified and you're all set! Get ready to explore amazing food and have it delivered right to your doorstep.

What's Next?
- Browse our delicious menu
- Add your favorite items to cart  
- Set up your delivery address
- Place your first order

Visit: ${process.env.NEXT_PUBLIC_APP_URL}/menu

Need help? Contact us at support@yumzy.com

© 2024 Yumzy. All rights reserved.
      `.trim()
    }

    return this.sendEmail({
      to: email,
      template,
      variables: { name }
    })
  }
}

// Global email service instance
export const emailService = EmailService.getInstance()

// Export convenience functions
export const sendAutoReplyEmail = (email: string, name: string, subject: string) =>
  emailService.sendAutoReplyEmail(email, name, subject)

export const sendAdminNotificationEmail = (contactData: {
  name: string
  email: string
  subject: string
  message: string
}) => emailService.sendAdminNotificationEmail(contactData)