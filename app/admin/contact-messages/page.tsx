'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Mail, 
  Phone, 
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  MessageSquare,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  category: string
  orderNumber?: string
  ticketNumber?: string
  status: string
  priority: string
  responseCount: number
  createdAt: string
  updatedAt: string
}

export default function ContactMessagesAdmin() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Fetch messages
  useEffect(() => {
    fetchMessages()
  }, [selectedStatus])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contact?status=${selectedStatus}&limit=50`)
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        throw new Error('Failed to fetch messages')
      }
    } catch (error) {
      console.error('Fetch messages error:', error)
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updateMessageStatus = async (messageId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contact/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchMessages() // Refresh messages
        toast({
          title: "Success",
          description: "Message status updated successfully"
        })
      } else {
        throw new Error('Failed to update message status')
      }
    } catch (error) {
      console.error('Update status error:', error)
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      'new': 'destructive',
      'in_progress': 'default',
      'resolved': 'secondary',
      'closed': 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'low': 'outline',
      'normal': 'secondary',
      'high': 'default',
      'urgent': 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      'new': <Mail className="w-4 h-4" />,
      'in_progress': <Clock className="w-4 h-4" />,
      'resolved': <CheckCircle className="w-4 h-4" />,
      'closed': <CheckCircle className="w-4 h-4" />
    }
    
    return icons[status as keyof typeof icons] || <AlertCircle className="w-4 h-4" />
  }

  // Check if user is admin (after all hooks are called)
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin privileges to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading contact messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
            <p className="text-gray-700 font-medium text-lg">Manage customer inquiries and support requests</p>
          </div>
          <Link href="/admin">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 font-medium">
              ← Back to Admin Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{messages.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Messages</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {messages.filter(m => m.status === 'new').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {messages.filter(m => m.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {messages.filter(m => m.status === 'resolved').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Messages</h2>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.length === 0 ? (
            <Card className="border-gray-200">
              <CardContent className="p-8 text-center bg-gray-50">
                <Mail className="h-12 w-12 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-800 font-medium text-lg">No contact messages found</p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card key={message.id} className={message.status === 'new' ? 'border-red-200 bg-red-50/50' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(message.status)}
                        <CardTitle className="text-lg">
                          {message.subject}
                        </CardTitle>
                        {message.ticketNumber && (
                          <Badge variant="outline" className="text-xs">
                            {message.ticketNumber}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-700 font-medium">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-gray-600" />
                          {message.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4 text-gray-600" />
                          {message.email}
                        </div>
                        {message.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4 text-gray-600" />
                            {message.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          {new Date(message.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(message.status)}
                      {getPriorityBadge(message.priority)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-800">Message:</span>
                      </div>
                      <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
                        {message.message}
                      </p>
                    </div>
                  </div>

                  {message.orderNumber && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm">
                        <strong>Related Order:</strong> {message.orderNumber}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {message.status === 'new' && (
                      <Button 
                        size="sm"
                        onClick={() => updateMessageStatus(message.id, 'in_progress')}
                      >
                        Start Working
                      </Button>
                    )}
                    
                    {message.status === 'in_progress' && (
                      <Button 
                        size="sm"
                        onClick={() => updateMessageStatus(message.id, 'resolved')}
                      >
                        Mark Resolved
                      </Button>
                    )}
                    
                    {message.status === 'resolved' && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => updateMessageStatus(message.id, 'closed')}
                      >
                        Close Ticket
                      </Button>
                    )}

                    <Button 
                      size="sm" 
                      variant="outline"
                      asChild
                    >
                      <a 
                        href={`mailto:${message.email}?subject=Re: ${message.subject}&body=Hi ${message.name},%0A%0AThank you for contacting SavoryStack support.%0A%0A`}
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Reply via Email
                      </a>
                    </Button>

                    {message.status !== 'new' && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => updateMessageStatus(message.id, 'in_progress')}
                      >
                        Reopen
                      </Button>
                    )}
                  </div>

                  {message.responseCount > 0 && (
                    <div className="mt-4 text-sm text-gray-700 font-medium">
                      {message.responseCount} response(s) sent
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}