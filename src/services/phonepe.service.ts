import axios from 'axios';
import crypto from 'crypto';

class PhonePeService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private saltKey: string;
  private saltIndex: string;

  constructor() {
    this.clientId = process.env.PHONEPE_CLIENT_ID!;
    this.clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.phonepe.com/apis/hermes'
      : 'https://api-preprod.phonepe.com/apis/hermes';
    this.saltKey = process.env.PHONEPE_SALT_KEY!;
    this.saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
  }

  private generateChecksum(payload: string): string {
    const base64Payload = Buffer.from(payload).toString('base64');
    const string = base64Payload + '/pg/v1/pay' + this.saltKey;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    return sha256 + '###' + this.saltIndex;
  }

  async createOrder(amount: number, currency = 'INR', merchantTransactionId: string, callbackUrl: string, redirectUrl: string) {
    try {
      const payload = {
        merchantId: this.clientId,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: 'MUID' + Date.now(),
        amount: amount * 100, // Convert to paise
        redirectUrl: redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: callbackUrl,
        mobileNumber: '9999999999',
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const payloadString = JSON.stringify(payload);
      const checksum = this.generateChecksum(payloadString);
      const base64Payload = Buffer.from(payloadString).toString('base64');

      const response = await axios.post(`${this.baseUrl}/pg/v1/pay`, {
        request: base64Payload
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating PhonePe order:', error);
      throw error;
    }
  }

  async verifyPayment(merchantTransactionId: string) {
    try {
      const url = `${this.baseUrl}/pg/v1/status/${this.clientId}/${merchantTransactionId}`;
      const string = `/pg/v1/status/${this.clientId}/${merchantTransactionId}` + this.saltKey;
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      const checksum = sha256 + '###' + this.saltIndex;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': this.clientId
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error verifying PhonePe payment:', error);
      throw error;
    }
  }

  async refundPayment(merchantTransactionId: string, amount: number, refundNote: string) {
    try {
      const payload = {
        merchantId: this.clientId,
        merchantTransactionId: merchantTransactionId,
        amount: amount * 100, // Convert to paise
        refundNote: refundNote
      };

      const payloadString = JSON.stringify(payload);
      const checksum = this.generateChecksum(payloadString);
      const base64Payload = Buffer.from(payloadString).toString('base64');

      const response = await axios.post(`${this.baseUrl}/pg/v1/refund`, {
        request: base64Payload
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error refunding PhonePe payment:', error);
      throw error;
    }
  }
}

export default new PhonePeService(); 