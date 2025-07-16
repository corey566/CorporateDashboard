import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface PayHerePayment {
  merchant_id: string;
  return_url: string;
  cancel_url: string;
  notify_url: string;
  order_id: string;
  items: string;
  amount: number;
  currency: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  hash: string;
}

export interface PayHereNotification {
  merchant_id: string;
  order_id: string;
  payment_id: string;
  payhere_amount: number;
  payhere_currency: string;
  status_code: number;
  md5sig: string;
  custom_1?: string;
  custom_2?: string;
  method: string;
  status_message: string;
  card_holder_name?: string;
  card_no?: string;
}

export class PayHereService {
  private merchantId: string;
  private merchantSecret: string;
  private sandbox: boolean;
  private baseUrl: string;

  constructor() {
    this.merchantId = process.env.PAYHERE_MERCHANT_ID || '';
    this.merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
    this.sandbox = process.env.NODE_ENV !== 'production';
    this.baseUrl = this.sandbox 
      ? 'https://sandbox.payhere.lk' 
      : 'https://www.payhere.lk';
  }

  generateHash(order_id: string, amount: number, currency: string): string {
    const hash_string = `${this.merchantId}${order_id}${amount.toFixed(2)}${currency}${this.merchantSecret}`;
    return crypto.createHash('md5').update(hash_string).digest('hex').toUpperCase();
  }

  verifyPayment(notification: PayHereNotification): boolean {
    const hash_string = `${this.merchantId}${notification.order_id}${notification.payhere_amount.toFixed(2)}${notification.payhere_currency}${notification.status_code}${this.merchantSecret}`;
    const calculated_hash = crypto.createHash('md5').update(hash_string).digest('hex').toUpperCase();
    return calculated_hash === notification.md5sig;
  }

  createPayment(params: {
    companyId: number;
    subscriptionId: number;
    amount: number;
    currency: string;
    description: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
  }): PayHerePayment {
    const order_id = `SUB-${params.subscriptionId}-${uuidv4()}`;
    const hash = this.generateHash(order_id, params.amount, params.currency);

    const names = params.customerName.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    return {
      merchant_id: this.merchantId,
      return_url: `${process.env.FRONTEND_URL}/payment/success`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      notify_url: `${process.env.BACKEND_URL}/api/payment/payhere/notify`,
      order_id,
      items: params.description,
      amount: params.amount,
      currency: params.currency,
      first_name: firstName,
      last_name: lastName,
      email: params.customerEmail,
      phone: params.customerPhone,
      address: params.customerAddress,
      city: params.customerCity,
      country: 'Sri Lanka',
      hash,
    };
  }

  generatePaymentForm(payment: PayHerePayment): string {
    const formFields = Object.entries(payment)
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}">`)
      .join('\n');

    return `
      <form method="post" action="${this.baseUrl}/pay/checkout" id="payhere-form">
        ${formFields}
      </form>
      <script>
        document.getElementById('payhere-form').submit();
      </script>
    `;
  }

  async processRecurringPayment(params: {
    companyId: number;
    subscriptionId: number;
    amount: number;
    currency: string;
    description: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    recurrence: string; // 'Month' or 'Year'
    duration: string; // 'Forever' or number
  }): Promise<any> {
    // PayHere recurring payment implementation
    // This would involve their recurring payment API
    const order_id = `REC-${params.subscriptionId}-${uuidv4()}`;
    
    const recurringData = {
      merchant_id: this.merchantId,
      order_id,
      items: params.description,
      currency: params.currency,
      amount: params.amount,
      recurrence: params.recurrence,
      duration: params.duration,
      startup_fee: 0,
      notify_url: `${process.env.BACKEND_URL}/api/payment/payhere/recurring-notify`,
      customer_email: params.customerEmail,
      customer_name: params.customerName,
      customer_phone: params.customerPhone,
    };

    // In a real implementation, you would make an API call to PayHere
    // For now, we'll return a mock response
    return {
      status: 'success',
      subscription_id: order_id,
      message: 'Recurring payment setup successful',
    };
  }

  isPaymentSuccessful(statusCode: number): boolean {
    return statusCode === 2; // 2 = success in PayHere
  }

  getPaymentStatusMessage(statusCode: number): string {
    const statusMessages: { [key: number]: string } = {
      '-3': 'Invalid',
      '-2': 'Failed',
      '-1': 'Cancelled',
      '0': 'Pending',
      '1': 'Processing',
      '2': 'Success',
      '3': 'Authorized',
    };

    return statusMessages[statusCode] || 'Unknown';
  }
}

export const payHereService = new PayHereService();