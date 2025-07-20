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

  // Order confirmation email
  async sendOrderConfirmation(
    email: string, 
    name: string, 
    orderData: {
      orderId: string
      items: Array<{ name: string; quantity: number; price: string }>
      total: string
      estimatedDelivery: string
      address: string
    }
  ): Promise<boolean> {
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${orderData.orderId}`
    const itemsList = orderData.items.map(item => 
      `${item.quantity}x ${item.name} - ${item.price}`
    ).join('\n')
    
    const template: EmailTemplate = {
      subject: `Order Confirmed #${orderData.orderId.slice(0, 8)} - Yumzy`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e11d48; margin: 0;">🍕 Yumzy</h1>
              <p style="color: #666; margin: 5px 0;">Delicious Food Delivered</p>
            </div>
            
            <div style="background-color: #dcfce7; border: 1px solid #16a34a; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
              <h2 style="color: #15803d; margin: 0 0 10px 0;">✅ Order Confirmed!</h2>
              <p style="color: #15803d; margin: 0;">Your delicious meal is being prepared</p>
            </div>
            
            <h3 style="color: #333; margin-bottom: 15px;">Hi {{name}},</h3>
            
            <p style="color: #555; margin-bottom: 25px;">
              Thank you for your order! We've received your payment and our kitchen is already preparing your delicious meal.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0;">Order Details</h3>
              <p><strong>Order ID:</strong> #{{orderId}}</p>
              <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
              <p><strong>Delivery Address:</strong> {{address}}</p>
              
              <div style="margin: 20px 0;">
                <h4 style="color: #333; margin-bottom: 10px;">Items Ordered:</h4>
                <div style="background-color: white; padding: 15px; border-radius: 5px; font-family: monospace;">
                  {{itemsList}}
                </div>
              </div>
              
              <p style="font-size: 18px; color: #e11d48; font-weight: bold; text-align: right; margin: 20px 0 0 0;">
                Total: {{total}}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{trackingUrl}}" style="background-color: #e11d48; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Track Your Order
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p><strong>What happens next?</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Our chefs are preparing your meal with fresh ingredients</li>
                <li>You'll get an update when your order is out for delivery</li>
                <li>Track your order in real-time using the link above</li>
                <li>Enjoy your delicious meal!</li>
              </ul>
              
              <p style="margin-top: 20px;">
                Questions? Contact us at <a href="mailto:support@yumzy.com" style="color: #e11d48;">support@yumzy.com</a>
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
Order Confirmed #{{orderId}} - Yumzy

Hi {{name}},

Thank you for your order! We've received your payment and our kitchen is already preparing your delicious meal.

Order Details:
Order ID: #{{orderId}}
Estimated Delivery: {{estimatedDelivery}}
Delivery Address: {{address}}

Items Ordered:
{{itemsList}}

Total: {{total}}

Track your order: {{trackingUrl}}

What happens next?
- Our chefs are preparing your meal with fresh ingredients
- You'll get an update when your order is out for delivery
- Track your order in real-time using the link above
- Enjoy your delicious meal!

Questions? Contact us at support@yumzy.com

© 2024 Yumzy. All rights reserved.
      `.trim()
    }

    return this.sendEmail({
      to: email,
      template,
      variables: { 
        name, 
        orderId: orderData.orderId.slice(0, 8),
        estimatedDelivery: orderData.estimatedDelivery,
        address: orderData.address,
        itemsList,
        total: orderData.total,
        trackingUrl
      }
    })
  }

  // Out for delivery email (HIGH PRIORITY)
  async sendOutForDelivery(
    email: string, 
    name: string, 
    orderData: {
      orderId: string
      estimatedArrival: string
      driverName?: string
      driverPhone?: string
    }
  ): Promise<boolean> {
    console.log(`🚀 PRIORITY EMAIL: Sending out-for-delivery notification to ${email}`)
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/track/${orderData.orderId}`
    
    const template: EmailTemplate = {
      subject: `Your order is on the way! #${orderData.orderId.slice(0, 8)} - Yumzy`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Out for Delivery</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e11d48; margin: 0;">🍕 Yumzy</h1>
              <p style="color: #666; margin: 5px 0;">Delicious Food Delivered</p>
            </div>
            
            <div style="background-color: #dbeafe; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
              <h2 style="color: #1d4ed8; margin: 0 0 10px 0;">🚗 On the Way!</h2>
              <p style="color: #1d4ed8; margin: 0;">Your order is out for delivery</p>
            </div>
            
            <h3 style="color: #333; margin-bottom: 15px;">Hi {{name}},</h3>
            
            <p style="color: #555; margin-bottom: 25px;">
              Great news! Your delicious meal has been prepared and is now on its way to you. Get ready to enjoy your food!
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0;">Delivery Information</h3>
              <p><strong>Order ID:</strong> #{{orderId}}</p>
              <p><strong>Estimated Arrival:</strong> {{estimatedArrival}}</p>
              ${orderData.driverName ? `<p><strong>Driver:</strong> {{driverName}}</p>` : ''}
              ${orderData.driverPhone ? `<p><strong>Driver Contact:</strong> {{driverPhone}}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{trackingUrl}}" style="background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Track Live Location
              </a>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 25px 0;">
              <p style="margin: 0; color: #856404;"><strong>💡 Tip:</strong> Please keep your phone nearby in case the driver needs to contact you for delivery instructions.</p>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p style="margin-top: 20px;">
                Questions about your delivery? Contact us at <a href="mailto:support@yumzy.com" style="color: #e11d48;">support@yumzy.com</a>
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
Your order is on the way! #{{orderId}} - Yumzy

Hi {{name}},

Great news! Your delicious meal has been prepared and is now on its way to you. Get ready to enjoy your food!

Delivery Information:
Order ID: #{{orderId}}
Estimated Arrival: {{estimatedArrival}}
${orderData.driverName ? 'Driver: {{driverName}}' : ''}
${orderData.driverPhone ? 'Driver Contact: {{driverPhone}}' : ''}

Track your order: {{trackingUrl}}

💡 Tip: Please keep your phone nearby in case the driver needs to contact you for delivery instructions.

Questions about your delivery? Contact us at support@yumzy.com

© 2024 Yumzy. All rights reserved.
      `.trim()
    }

    return this.sendEmail({
      to: email,
      template,
      variables: { 
        name, 
        orderId: orderData.orderId.slice(0, 8),
        estimatedArrival: orderData.estimatedArrival,
        driverName: orderData.driverName || '',
        driverPhone: orderData.driverPhone || '',
        trackingUrl
      }
    })
  }

  // Order delivered email (HIGHEST PRIORITY)
  async sendOrderDelivered(
    email: string, 
    name: string, 
    orderData: {
      orderId: string
      total: string
      items: Array<{ name: string; quantity: number }>
    }
  ): Promise<boolean> {
    console.log(`🎯 CRITICAL EMAIL: Sending delivery confirmation to ${email} for order ${orderData.orderId}`)
    const reorderUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderData.orderId}`
    const reviewUrl = `${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderData.orderId}#review`
    const menuUrl = `${process.env.NEXT_PUBLIC_APP_URL}/menu`
    
    const template: EmailTemplate = {
      subject: `Order Delivered! 🎉 #${orderData.orderId.slice(0, 8)} - Yumzy`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Delivered</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #e11d48; margin: 0;">🍕 Yumzy</h1>
              <p style="color: #666; margin: 5px 0;">Delicious Food Delivered</p>
            </div>
            
            <div style="background-color: #dcfce7; border: 1px solid #16a34a; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
              <h2 style="color: #15803d; margin: 0 0 10px 0;">🎉 Order Delivered!</h2>
              <p style="color: #15803d; margin: 0; font-size: 18px;">Enjoy your delicious meal!</p>
            </div>
            
            <h3 style="color: #333; margin-bottom: 15px;">Hi {{name}},</h3>
            
            <p style="color: #555; margin-bottom: 25px;">
              Your order has been successfully delivered! We hope you enjoy every bite of your delicious meal. Thank you for choosing Yumzy!
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
              <p><strong>Order ID:</strong> #{{orderId}}</p>
              <p><strong>Total:</strong> {{total}}</p>
              <p><strong>Items:</strong> {{itemCount}} items delivered</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{reorderUrl}}" style="background-color: #e11d48; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 0 10px 10px 0;">
                Reorder This Meal
              </a>
              <a href="{{reviewUrl}}" style="background-color: #3b82f6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 0 10px 10px 0;">
                Rate Your Experience
              </a>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 25px 0; text-align: center;">
              <p style="margin: 0; color: #92400e;"><strong>🌟 Love your meal?</strong> Help others discover great food by leaving a review!</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{menuUrl}}" style="background-color: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Browse Menu for Next Order
              </a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p><strong>Thank you for choosing Yumzy!</strong></p>
              <p>Your satisfaction is our priority. If you have any feedback or issues with your order, please don't hesitate to contact us.</p>
              
              <p style="margin-top: 20px;">
                Contact us: <a href="mailto:support@yumzy.com" style="color: #e11d48;">support@yumzy.com</a>
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
Order Delivered! 🎉 #{{orderId}} - Yumzy

Hi {{name}},

Your order has been successfully delivered! We hope you enjoy every bite of your delicious meal. Thank you for choosing Yumzy!

Order Summary:
Order ID: #{{orderId}}
Total: {{total}}
Items: {{itemCount}} items delivered

🌟 Love your meal? Help others discover great food by leaving a review!

Reorder: {{reorderUrl}}
Rate your experience: {{reviewUrl}}
Browse menu: {{menuUrl}}

Thank you for choosing Yumzy! Your satisfaction is our priority. If you have any feedback or issues with your order, please contact us at support@yumzy.com

© 2024 Yumzy. All rights reserved.
      `.trim()
    }

    return this.sendEmail({
      to: email,
      template,
      variables: { 
        name, 
        orderId: orderData.orderId.slice(0, 8),
        total: orderData.total,
        itemCount: orderData.items.length.toString(),
        reorderUrl,
        reviewUrl,
        menuUrl
      }
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