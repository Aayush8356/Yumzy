import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for contact messages (for demo purposes)
let contactMessages: any[] = []

// Load from global store if available
if (typeof global !== 'undefined') {
  (global as any).contactMessagesStore = (global as any).contactMessagesStore || []
  contactMessages = (global as any).contactMessagesStore
}

// GET /api/contact/[id] - Get specific contact message
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id

    const message = contactMessages.find(msg => msg.id === messageId)

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: message
    })
  } catch (error) {
    console.error('Get contact message error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch message' },
      { status: 500 }
    )
  }
}

// PATCH /api/contact/[id] - Update contact message
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id
    const body = await request.json()
    const { 
      status, 
      priority, 
      assignedTo, 
      responseCount,
      lastResponseAt,
      resolvedAt 
    } = body

    // Validate status if provided
    const validStatuses = ['new', 'in_progress', 'resolved', 'closed']
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      )
    }

    // Validate priority if provided
    const validPriorities = ['low', 'normal', 'high', 'urgent']
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority value' },
        { status: 400 }
      )
    }

    // Find message in memory
    const messageIndex = contactMessages.findIndex(msg => msg.id === messageId)
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = { updatedAt: new Date().toISOString() }
    
    if (status !== undefined) {
      updateData.status = status
      
      // Auto-set resolvedAt when status changes to resolved
      if (status === 'resolved' && !resolvedAt) {
        updateData.resolvedAt = new Date().toISOString()
      }
    }
    
    if (priority !== undefined) updateData.priority = priority
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo
    if (responseCount !== undefined) updateData.responseCount = responseCount
    if (lastResponseAt !== undefined) updateData.lastResponseAt = new Date(lastResponseAt).toISOString()
    if (resolvedAt !== undefined) updateData.resolvedAt = new Date(resolvedAt).toISOString()

    // Update message
    const updatedMessage = {
      ...contactMessages[messageIndex],
      ...updateData
    }

    contactMessages[messageIndex] = updatedMessage

    // Update global store
    if (typeof global !== 'undefined') {
      (global as any).contactMessagesStore = contactMessages
    }

    // Send notification if status changed to important states
    if (status === 'resolved') {
      await sendResolutionNotification(updatedMessage)
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message updated successfully',
      data: updatedMessage
    })
  } catch (error) {
    console.error('Update contact message error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

// DELETE /api/contact/[id] - Delete contact message (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const messageId = params.id

    // In production, add admin authorization check here

    // Find message in memory
    const messageIndex = contactMessages.findIndex(msg => msg.id === messageId)
    
    if (messageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Message not found' },
        { status: 404 }
      )
    }

    // Remove message
    const deletedMessage = contactMessages.splice(messageIndex, 1)[0]

    // Update global store
    if (typeof global !== 'undefined') {
      (global as any).contactMessagesStore = contactMessages
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message deleted successfully',
      deletedMessage: deletedMessage
    })
  } catch (error) {
    console.error('Delete contact message error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}

// Send resolution notification email
async function sendResolutionNotification(message: any) {
  try {
    const resolutionEmail = generateResolutionEmail(message)
    
    console.log('📧 Sending resolution notification to:', message.email)
    console.log('Subject:', resolutionEmail.subject)
    console.log('Content:', resolutionEmail.html)
    
    // In production, replace with actual email service
    /*
    await emailService.send({
      to: message.email,
      from: 'support@savorystack.com',
      subject: resolutionEmail.subject,
      html: resolutionEmail.html
    })
    */
    
    return { success: true }
  } catch (error) {
    console.error('Resolution notification error:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'An unknown error occurred' }
  }
}

// Generate resolution email content
function generateResolutionEmail(message: any) {
  return {
    subject: `✅ Your Support Request Has Been Resolved [${message.ticketNumber}]`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: 0; }
          .resolution-box { background: #d4edda; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #28a745; }
          .feedback-section { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Issue Resolved!</h1>
            <p>Your support request has been successfully resolved</p>
          </div>
          
          <div class="content">
            <h2>Hi ${message.name}!</h2>
            
            <div class="resolution-box">
              <h3>✅ Support Request Resolved</h3>
              <p><strong>Ticket Number:</strong> ${message.ticketNumber}</p>
              <p><strong>Subject:</strong> ${message.subject}</p>
              <p><strong>Resolved On:</strong> ${new Date().toLocaleString()}</p>
            </div>
            
            <p>Great news! Our support team has resolved your inquiry. We hope our solution was helpful and addressed your concerns completely.</p>
            
            <div class="feedback-section">
              <h3>📝 How did we do?</h3>
              <p>We'd love to hear about your experience! Your feedback helps us improve our service.</p>
              <a href="#" class="button">Rate Our Support</a>
            </div>
            
            <h3>📞 Need Further Assistance?</h3>
            <p>If you have any additional questions or if this issue resurfaces, please don't hesitate to contact us:</p>
            <ul>
              <li><strong>Phone:</strong> +1 (555) 123-FOOD (24/7)</li>
              <li><strong>Email:</strong> support@savorystack.com</li>
              <li><strong>Live Chat:</strong> Available on our website</li>
            </ul>
            
            <p>Thank you for choosing Yumzy, and we appreciate your patience while we worked to resolve your issue!</p>
            
            <p>Best regards,<br>
            The Yumzy Support Team</p>
          </div>
          
          <div class="footer">
            <p style="margin: 0; color: #666; font-size: 12px;">
              This ticket has been marked as resolved. If you need further assistance, please contact our support team.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}