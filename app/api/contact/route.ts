import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactMessages, users } from '@/lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'
import { sendAutoReplyEmail, sendAdminNotificationEmail } from '@/lib/email'

// Contact message interface
interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
  orderNumber?: string
  category?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactMessage = await request.json()
    const { name, email, subject, message, phone, orderNumber, category } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Required fields: name, email, subject, message' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Save message to database
    const [newMessage] = await db
      .insert(contactMessages)
      .values({
        name,
        email,
        subject,
        message,
        phone,
        orderNumber,
        category: category || 'general',
        status: 'new',
        priority: 'normal',
      })
      .returning()

    // Generate ticket number
    const createdAt = newMessage.createdAt ? new Date(newMessage.createdAt) : new Date();
    const ticketNumber = `TKT-${createdAt.getTime().toString().slice(-6)}-${newMessage.id.slice(-4).toUpperCase()}`

    // Update message with ticket number
    await db
      .update(contactMessages)
      .set({ ticketNumber })
      .where(eq(contactMessages.id, newMessage.id))

    // Send auto-reply email
    const autoReplyResult = await sendAutoReplyEmail({
      name,
      email,
      subject,
      messageId: newMessage.id,
      ticketNumber,
    })

    // Send notification email to admin
    const adminNotificationResult = await sendAdminNotificationEmail({
      name,
      email,
      subject,
      message,
      messageId: newMessage.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully!',
      data: {
        ticketNumber,
        messageId: newMessage.id,
        autoReplyStatus: autoReplyResult.success,
        adminNotified: adminNotificationResult.success,
        estimatedResponseTime: '24 hours',
      },
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url || '')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const whereClause = status && status !== 'all' ? eq(contactMessages.status, status) : undefined

    const messages = await db
      .select()
      .from(contactMessages)
      .where(whereClause)
      .orderBy(desc(contactMessages.createdAt))
      .limit(limit)
      .offset((page - 1) * limit)

    const totalResult = await db.select({ count: count() }).from(contactMessages).where(whereClause)
    const totalMessages = totalResult[0].count
    const totalPages = Math.ceil(totalMessages / limit)

    return NextResponse.json({
      success: true,
      messages,
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Get contact messages error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

