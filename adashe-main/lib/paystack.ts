import crypto from 'crypto'

export interface PaystackConfig {
  publicKey: string
  secretKey: string
  baseUrl: string
}

export interface PaymentData {
  email: string
  amount: number // Amount in kobo (NGN * 100)
  currency?: string
  reference?: string
  callback_url?: string
  metadata?: Record<string, any>
}

export interface TransactionVerification {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: string
    reference: string
    amount: number
    message: string | null
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: any
    log: any
    fees: number
    fees_split: any
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
      reusable: boolean
      signature: string
    }
    customer: {
      id: number
      first_name: string
      last_name: string
      email: string
      customer_code: string
      phone: string
      metadata: any
      risk_action: string
    }
    plan: any
    subaccount: any
    split: any
    order_id: any
    paidAt: string
    createdAt: string
  }
}

export interface PayoutRecipient {
  type: string
  name: string
  description?: string
  account_number: string
  bank_code: string
  currency: string
  email?: string
}

export interface PayoutTransfer {
  source: string
  amount: number
  recipient: string
  reason?: string
  currency?: string
  reference?: string
}

class PaystackService {
  private config: PaystackConfig

  constructor() {
    this.config = {
      publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
      secretKey: process.env.PAYSTACK_SECRET_KEY || '',
      baseUrl: 'https://api.paystack.co'
    }
  }

  // Generate payment reference
  generateReference(): string {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  // Initialize payment
  async initializePayment(data: PaymentData): Promise<any> {
    const url = `${this.config.baseUrl}/transaction/initialize`
    
    const paymentData = {
      ...data,
      amount: Math.round(data.amount * 100), // Convert to kobo
      currency: data.currency || 'NGN',
      reference: data.reference || this.generateReference()
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Payment initialization failed')
      }

      return result
    } catch (error) {
      console.error('Paystack initialization error:', error)
      throw error
    }
  }

  // Verify payment
  async verifyPayment(reference: string): Promise<TransactionVerification> {
    const url = `${this.config.baseUrl}/transaction/verify/${reference}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Payment verification failed')
      }

      return result
    } catch (error) {
      console.error('Paystack verification error:', error)
      throw error
    }
  }

  // Create transfer recipient
  async createTransferRecipient(recipientData: PayoutRecipient): Promise<any> {
    const url = `${this.config.baseUrl}/transferrecipient`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(recipientData)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create transfer recipient')
      }

      return result
    } catch (error) {
      console.error('Paystack recipient creation error:', error)
      throw error
    }
  }

  // Initiate transfer (payout)
  async initiateTransfer(transferData: PayoutTransfer): Promise<any> {
    const url = `${this.config.baseUrl}/transfer`

    const transfer = {
      ...transferData,
      amount: Math.round(transferData.amount * 100), // Convert to kobo
      currency: transferData.currency || 'NGN',
      reference: transferData.reference || this.generateReference()
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transfer)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Transfer initiation failed')
      }

      return result
    } catch (error) {
      console.error('Paystack transfer error:', error)
      throw error
    }
  }

  // Get banks list
  async getBanks(country: string = 'nigeria'): Promise<any> {
    const url = `${this.config.baseUrl}/bank?country=${country}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch banks')
      }

      return result
    } catch (error) {
      console.error('Paystack banks fetch error:', error)
      throw error
    }
  }

  // Resolve bank account
  async resolveBankAccount(accountNumber: string, bankCode: string): Promise<any> {
    const url = `${this.config.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Account resolution failed')
      }

      return result
    } catch (error) {
      console.error('Paystack account resolution error:', error)
      throw error
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const hash = crypto
        .createHmac('sha512', this.config.secretKey)
        .update(payload, 'utf-8')
        .digest('hex')
      
      return hash === signature
    } catch (error) {
      console.error('Webhook signature verification error:', error)
      return false
    }
  }

  // Get public key for frontend
  getPublicKey(): string {
    return this.config.publicKey
  }
}

export const paystack = new PaystackService()
export default paystack