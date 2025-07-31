import dotenv from 'dotenv';
dotenv.config();
import phonepeService from '../services/phonepe.service';

async function testPhonePeKeys() {
  try {
    const clientId = process.env.PHONEPE_CLIENT_ID;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
    const saltKey = process.env.PHONEPE_SALT_KEY;

    console.log('🔍 Checking PhonePe Configuration...');
    console.log('Client ID:', clientId ? '✅ Set' : '❌ Missing');
    console.log('Client Secret:', clientSecret ? '✅ Set' : '❌ Missing');
    console.log('Salt Key:', saltKey ? '✅ Set' : '❌ Missing');

    if (!clientId || !clientSecret || !saltKey) {
      console.log('\n❌ PhonePe keys are missing!');
      console.log('💡 Add these to your .env file:');
      console.log('PHONEPE_CLIENT_ID=your_client_id_here');
      console.log('PHONEPE_CLIENT_SECRET=your_client_secret_here');
      console.log('PHONEPE_SALT_KEY=your_salt_key_here');
      console.log('PHONEPE_SALT_INDEX=1');
      return;
    }

    console.log('\n🧪 Testing PhonePe connection...');
    
    // Test with a minimal order
    const merchantTransactionId = 'test_order_' + Date.now();
    const callbackUrl = 'https://your-domain.com/api/payments/verify';
    const redirectUrl = 'https://your-domain.com/payment-success';

    const order = await phonepeService.createOrder(
      100, // 1 rupee
      'INR',
      merchantTransactionId,
      callbackUrl,
      redirectUrl
    );

    console.log('✅ PhonePe connection successful!');
    console.log('Merchant Transaction ID:', order.data.merchantTransactionId);
    console.log('Amount:', order.data.amount);
    console.log('Status:', order.data.status);

  } catch (error) {
    console.error('❌ PhonePe test failed:', error);
    console.log('\n💡 Possible solutions:');
    console.log('1. Check your API keys are correct');
    console.log('2. Make sure you\'re using test environment');
    console.log('3. Verify your PhonePe merchant account is active');
  }
}

testPhonePeKeys(); 