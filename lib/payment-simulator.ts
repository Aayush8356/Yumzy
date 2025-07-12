/**
 * Dummy Payment Simulation System
 * Simulates realistic payment processing with random delays and success rates
 */

export interface PaymentResult {
  success: boolean
  transactionId: string
  paymentMethod: string
  amount: number
  processingTime: number
  timestamp: Date
  error?: string
}

export interface PaymentRequest {
  orderId: string
  amount: number
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet'
  customerDetails: {
    name: string
    email: string
    phone: string
  }
}

class PaymentSimulator {
  private static instance: PaymentSimulator
  
  static getInstance(): PaymentSimulator {
    if (!PaymentSimulator.instance) {
      PaymentSimulator.instance = new PaymentSimulator()
    }
    return PaymentSimulator.instance
  }

  /**
   * Simulate payment processing with realistic behavior
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    // Simulate processing time (1-5 seconds)
    const processingTime = Math.random() * 4000 + 1000
    
    // Show processing animation
    await this.simulateProcessingDelay(processingTime)
    
    // 95% success rate (realistic for production systems)
    const isSuccessful = Math.random() > 0.05
    
    if (isSuccessful) {
      return {
        success: true,
        transactionId: this.generateTransactionId(),
        paymentMethod: request.paymentMethod,
        amount: request.amount,
        processingTime,
        timestamp: new Date()
      }
    } else {
      // Simulate payment failures
      const failureReasons = [
        'Insufficient funds',
        'Network timeout',
        'Card declined',
        'Bank server error',
        'Invalid CVV'
      ]
      
      return {
        success: false,
        transactionId: '',
        paymentMethod: request.paymentMethod,
        amount: request.amount,
        processingTime,
        timestamp: new Date(),
        error: failureReasons[Math.floor(Math.random() * failureReasons.length)]
      }
    }
  }

  /**
   * Generate realistic transaction ID
   */
  private generateTransactionId(): string {
    const prefix = 'TXN'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    return `${prefix}${timestamp}${random}`
  }

  /**
   * Simulate processing delay with progress updates
   */
  private async simulateProcessingDelay(duration: number): Promise<void> {
    return new Promise(resolve => {
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        
        // Emit progress events (for UI updates)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('payment-progress', { 
            detail: { progress } 
          }))
        }
        
        if (progress >= 100) {
          clearInterval(interval)
          resolve()
        }
      }, duration / 10)
    })
  }

  /**
   * Validate payment method availability
   */
  isPaymentMethodAvailable(method: string): boolean {
    const availableMethods = ['card', 'upi', 'netbanking', 'wallet']
    return availableMethods.includes(method)
  }

  /**
   * Get payment method fee (for realistic calculation)
   */
  getPaymentMethodFee(method: string, amount: number): number {
    const fees = {
      card: amount * 0.02, // 2% for cards
      upi: 0, // Free for UPI
      netbanking: 5, // Flat ₹5 for netbanking
      wallet: amount * 0.01 // 1% for wallet
    }
    
    return fees[method as keyof typeof fees] || 0
  }
}

export default PaymentSimulator