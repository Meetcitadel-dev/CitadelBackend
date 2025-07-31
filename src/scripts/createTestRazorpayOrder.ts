import dotenv from 'dotenv';
dotenv.config();
import Razorpay from 'razorpay';

async function createTestOrder() {
  try {
    // Use these test keys (they work for testing)
    const testKeyId = 'rzp_test_1DP5mmOlF5G5ag';
    const testKeySecret = 'thisisasecret';
    
    console.log('🧪 Creating test Razorpay order...');
    
    const razorpay = new Razorpay({
      key_id: testKeyId,
      key_secret: testKeySecret,
    });

    const order = await razorpay.orders.create({
      amount: 15000, // 150 rupees
      currency: 'INR',
      receipt: 'test_receipt_' + Date.now(),
      notes: {
        test: 'true',
        booking_id: 'test_booking_123'
      }
    });

    console.log('✅ Test order created successfully!');
    console.log('Order ID:', order.id);
    console.log('Amount:', order.amount);
    console.log('Status:', order.status);
    console.log('Receipt:', order.receipt);

    return order;
  } catch (error) {
    console.error('❌ Test order failed:', error);
    console.log('\n💡 This means your Razorpay setup needs fixing');
    console.log('1. Go to https://dashboard.razorpay.com/');
    console.log('2. Create a new account');
    console.log('3. Get fresh test keys');
    console.log('4. Update your .env file');
  }
}

createTestOrder(); 