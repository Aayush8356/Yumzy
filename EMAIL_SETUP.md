# Email Setup Guide for Yumzy

This guide explains how to configure email functionality for your Yumzy food delivery application. The app supports multiple email providers with Gmail App Passwords being the recommended approach for most users.

## 🚀 Quick Setup (Gmail App Password - Recommended)

Gmail App Passwords are the most reliable and commonly used method for production applications. They're more secure than using your regular Gmail password and work well with nodemailer.

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the setup process to enable 2FA (you'll need your phone)

### Step 2: Generate App Password

1. After enabling 2FA, go back to **Security** settings
2. Under "Signing in to Google", click **App passwords**
3. You might need to sign in again
4. Select **Mail** from the "Select app" dropdown
5. Select **Other (Custom name)** from the "Select device" dropdown
6. Enter "Yumzy Food App" as the custom name
7. Click **Generate**
8. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables

Add these lines to your `.env.local` file:

```bash
# Email Configuration (Gmail App Password)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
EMAIL_FROM=Yumzy Food Delivery <your-email@gmail.com>

# Admin email for contact form notifications
ADMIN_EMAIL=your-email@gmail.com
```

### Step 4: Test the Setup

1. Start your development server: `npm run dev`
2. Try registering a new user account
3. Check your email for the verification message
4. Check the console logs for "✅ Gmail App Password email service configured"

## 📧 Email Features

Once configured, your application will automatically send:

1. **Email Verification** - When users register new accounts
2. **Password Reset** - When users request password resets
3. **Welcome Emails** - After email verification is complete
4. **Contact Form Auto-Replies** - When users submit contact forms
5. **Admin Notifications** - When new contact messages are received

## 🔧 Alternative Email Configurations

### Option 2: Custom SMTP Provider

If you prefer using a different email provider (like your hosting provider's SMTP):

```bash
# Custom SMTP Configuration
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
EMAIL_FROM=Yumzy <noreply@yourdomain.com>
```

### Option 3: SendGrid (Professional/Enterprise)

For high-volume email sending:

1. Sign up for [SendGrid](https://sendgrid.com/)
2. Create an API key
3. Add to your environment:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your-sendgrid-api-key
EMAIL_FROM=Yumzy <noreply@yourdomain.com>
```

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### "Email service not configured" warning
- **Cause**: No email environment variables are set
- **Solution**: Add Gmail App Password credentials to `.env.local`

#### "Invalid login" error with Gmail
- **Cause**: Using regular Gmail password instead of App Password
- **Solution**: Generate and use a 16-character App Password

#### "Authentication failed" error
- **Cause**: 2FA not enabled or incorrect App Password
- **Solution**: Ensure 2FA is enabled and regenerate App Password

#### Emails going to spam
- **Cause**: Email authentication issues
- **Solution**: 
  - Use a professional "From" name: `Yumzy Food Delivery <your-email@gmail.com>`
  - Consider setting up SPF/DKIM records if using custom domain

#### Rate limiting errors
- **Cause**: Too many emails sent too quickly
- **Solution**: Gmail has sending limits. For high volume, consider SendGrid

### Development vs Production

#### Development Mode
- Uses Ethereal Email (fake SMTP) for testing
- Emails are logged to console instead of being sent
- Preview URLs provided for testing email templates

#### Production Mode
- Uses your configured email provider
- Emails are actually sent to users
- Audit logging tracks all email activity

## 🔍 Testing Email Templates

To test email templates without sending real emails:

1. Set `NODE_ENV=development` in your environment
2. Check console logs for email content
3. Use the provided preview URLs to see formatted emails

## 📱 Mobile App Integration

If you're building a mobile app companion:

1. Email verification links work with deep linking
2. Password reset flows are mobile-friendly
3. All email templates are responsive and mobile-optimized

## 🚨 Security Best Practices

1. **Never commit email credentials** to version control
2. **Use App Passwords**, not regular Gmail passwords
3. **Rotate App Passwords** periodically
4. **Monitor email sending** for suspicious activity
5. **Use HTTPS** for all email verification links

## 🎯 Production Deployment

For production deployment:

1. **Environment Variables**: Set email config in your hosting platform
2. **Domain Setup**: Use your own domain for professional emails
3. **Monitoring**: Enable email delivery monitoring
4. **Backup Provider**: Configure fallback email service

### Popular Hosting Platforms

#### Vercel
```bash
vercel env add GMAIL_USER
vercel env add GMAIL_APP_PASSWORD
```

#### Netlify
Add environment variables in site settings.

#### Railway/Render
Configure in dashboard environment variables section.

## 📊 Email Analytics

The admin dashboard includes email analytics:
- Total emails sent
- Delivery success rates
- Failed email tracking
- User verification rates

Access at: `/admin/analytics`

## 🆘 Support

If you encounter issues:

1. Check the console logs for detailed error messages
2. Verify environment variables are correctly set
3. Test with a simple Gmail setup first
4. Check spam folders for test emails

## 🔗 Useful Links

- [Gmail App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [SendGrid Documentation](https://docs.sendgrid.com/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Email Testing with Ethereal](https://ethereal.email/)

---

**Ready to go live?** Follow the Gmail App Password setup above, and your users will start receiving professional email notifications within minutes! 🚀