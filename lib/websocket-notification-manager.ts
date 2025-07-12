/**
 * Real-time WebSocket Notification Manager
 * Handles real-time order updates and notifications using Server-Sent Events (SSE)
 * Falls back to polling when SSE is not available
 */

export interface RealtimeNotification {
  id: string
  type: 'order_status' | 'payment_update' | 'delivery_update' | 'system_notification'
  userId: string
  orderId?: string
  title: string
  message: string
  data?: Record<string, any>
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface ConnectionStatus {
  connected: boolean
  lastPing: Date | null
  reconnectAttempts: number
  connectionType: 'sse' | 'polling' | 'disconnected'
}

class WebSocketNotificationManager {
  private static instance: WebSocketNotificationManager
  private eventSource: EventSource | null = null
  private pollingInterval: NodeJS.Timeout | null = null
  private connectionStatus: ConnectionStatus = {
    connected: false,
    lastPing: null,
    reconnectAttempts: 0,
    connectionType: 'disconnected'
  }
  private userId: string | null = null
  private listeners = new Map<string, (notification: RealtimeNotification) => void>()
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // Start with 1 second

  static getInstance(): WebSocketNotificationManager {
    if (!WebSocketNotificationManager.instance) {
      WebSocketNotificationManager.instance = new WebSocketNotificationManager()
    }
    return WebSocketNotificationManager.instance
  }

  /**
   * Initialize connection for a specific user
   */
  async connect(userId: string): Promise<void> {
    this.userId = userId
    
    // Disconnect any existing connections
    await this.disconnect()

    try {
      // Try Server-Sent Events first
      await this.connectSSE(userId)
    } catch (error) {
      console.warn('SSE connection failed, falling back to polling:', error)
      this.connectPolling(userId)
    }
  }

  /**
   * Connect using Server-Sent Events
   */
  private async connectSSE(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(`/api/realtime/sse?userId=${userId}`)
        
        this.eventSource.onopen = () => {
          this.connectionStatus = {
            connected: true,
            lastPing: new Date(),
            reconnectAttempts: 0,
            connectionType: 'sse'
          }
          console.log('🔗 SSE connection established')
          this.emit('connection-status', this.connectionStatus)
          resolve()
        }

        this.eventSource.onmessage = (event) => {
          try {
            const notification: RealtimeNotification = JSON.parse(event.data)
            this.handleNotification(notification)
          } catch (error) {
            console.error('Failed to parse SSE message:', error)
          }
        }

        this.eventSource.onerror = (error) => {
          console.error('SSE connection error:', error)
          this.connectionStatus.connected = false
          this.emit('connection-status', this.connectionStatus)
          
          if (this.connectionStatus.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => this.reconnectSSE(userId), this.getReconnectDelay())
          } else {
            console.warn('Max SSE reconnection attempts reached, falling back to polling')
            this.connectPolling(userId)
          }
        }

        // Timeout for connection
        setTimeout(() => {
          if (!this.connectionStatus.connected) {
            reject(new Error('SSE connection timeout'))
          }
        }, 5000)

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Reconnect SSE with exponential backoff
   */
  private async reconnectSSE(userId: string): Promise<void> {
    this.connectionStatus.reconnectAttempts++
    console.log(`🔄 Attempting SSE reconnection ${this.connectionStatus.reconnectAttempts}/${this.maxReconnectAttempts}`)
    
    if (this.eventSource) {
      this.eventSource.close()
    }
    
    try {
      await this.connectSSE(userId)
    } catch (error) {
      console.error('SSE reconnection failed:', error)
    }
  }

  /**
   * Connect using polling fallback
   */
  private connectPolling(userId: string): void {
    this.connectionStatus = {
      connected: true,
      lastPing: new Date(),
      reconnectAttempts: 0,
      connectionType: 'polling'
    }
    
    console.log('🔄 Using polling connection')
    this.emit('connection-status', this.connectionStatus)

    // Poll every 3 seconds
    this.pollingInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/realtime?userId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${userId}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          
          if (data.notifications && data.notifications.length > 0) {
            data.notifications.forEach((notification: RealtimeNotification) => {
              this.handleNotification(notification)
            })
          }

          this.connectionStatus.lastPing = new Date()
          this.connectionStatus.connected = true
        } else {
          throw new Error(`Polling failed: ${response.status}`)
        }
      } catch (error) {
        console.error('Polling error:', error)
        this.connectionStatus.connected = false
        this.emit('connection-status', this.connectionStatus)
      }
    }, 3000)
  }

  /**
   * Handle incoming notification
   */
  private handleNotification(notification: RealtimeNotification): void {
    console.log('📨 Received notification:', notification)

    // Update connection status
    this.connectionStatus.lastPing = new Date()

    // Emit to all listeners
    this.listeners.forEach(listener => {
      try {
        listener(notification)
      } catch (error) {
        console.error('Listener error:', error)
      }
    })

    // Show browser notification for high priority notifications
    if (notification.priority === 'urgent' || notification.priority === 'high') {
      this.showBrowserNotification(notification)
    }

    // Emit custom DOM event for global listeners
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('realtime-notification', {
        detail: notification
      }))
    }
  }

  /**
   * Show browser notification
   */
  private async showBrowserNotification(notification: RealtimeNotification): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    // Request permission if not granted
    if (Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.orderId || notification.id,
        data: notification.data,
        requireInteraction: notification.priority === 'urgent'
      })

      // Auto-close after 5 seconds (except urgent)
      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotification.close(), 5000)
      }

      browserNotification.onclick = () => {
        window.focus()
        if (notification.orderId) {
          window.location.href = `/track/${notification.orderId}`
        }
        browserNotification.close()
      }
    }
  }

  /**
   * Add notification listener
   */
  on(event: string, listener: (notification: RealtimeNotification) => void): void {
    this.listeners.set(event, listener)
  }

  /**
   * Remove notification listener
   */
  off(event: string): void {
    this.listeners.delete(event)
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    const listener = this.listeners.get(event)
    if (listener) {
      listener(data)
    }
  }

  /**
   * Send notification to server
   */
  async sendNotification(notification: Omit<RealtimeNotification, 'id' | 'timestamp'>): Promise<void> {
    try {
      await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.userId}`
        },
        body: JSON.stringify({
          ...notification,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return { ...this.connectionStatus }
  }

  /**
   * Disconnect from real-time service
   */
  async disconnect(): Promise<void> {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }

    this.connectionStatus = {
      connected: false,
      lastPing: null,
      reconnectAttempts: 0,
      connectionType: 'disconnected'
    }

    this.listeners.clear()
    console.log('🔌 Disconnected from real-time service')
  }

  /**
   * Get reconnection delay with exponential backoff
   */
  private getReconnectDelay(): number {
    const delay = this.reconnectDelay * Math.pow(2, this.connectionStatus.reconnectAttempts)
    return Math.min(delay, 30000) // Max 30 seconds
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connectionStatus.connected
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.userId
  }
}

export default WebSocketNotificationManager