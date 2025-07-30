import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1/auth';

async function testLoginAPI() {
  console.log('🧪 Testing Login API Endpoints...\n');

  try {
    // Test 1: Check user existence with valid email
    console.log('1. Testing check-user endpoint...');
    const checkUserResponse = await axios.post(`${BASE_URL}/check-user`, {
      email: 'test@university.edu'
    });
    console.log('✅ Check user response:', checkUserResponse.data);

    // Test 2: Send OTP for login
    console.log('\n2. Testing send-otp endpoint for login...');
    const sendOtpResponse = await axios.post(`${BASE_URL}/send-otp`, {
      email: 'test@university.edu',
      isLogin: true
    });
    console.log('✅ Send OTP response:', sendOtpResponse.data);

    // Test 3: Verify OTP (you'll need to use the actual OTP from email)
    console.log('\n3. Testing verify-otp endpoint...');
    console.log('⚠️  Note: You need to check your email for the actual OTP');
    console.log('   Replace "123456" with the actual OTP from your email');
    
    // Uncomment the following lines and replace with actual OTP
    /*
    const verifyOtpResponse = await axios.post(`${BASE_URL}/verify-otp`, {
      email: 'test@university.edu',
      otp: '123456', // Replace with actual OTP
      isLogin: true
    });
    console.log('✅ Verify OTP response:', verifyOtpResponse.data);
    */

  } catch (error: any) {
    if (error.response) {
      console.log('❌ Error response:', error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// Test error cases
async function testErrorCases() {
  console.log('\n🧪 Testing Error Cases...\n');

  try {
    // Test 1: Invalid email domain
    console.log('1. Testing invalid email domain...');
    const invalidEmailResponse = await axios.post(`${BASE_URL}/check-user`, {
      email: 'test@gmail.com'
    });
    console.log('✅ Invalid email response:', invalidEmailResponse.data);
  } catch (error: any) {
    if (error.response) {
      console.log('✅ Expected error for invalid email:', error.response.data);
    }
  }

  try {
    // Test 2: Non-existent user
    console.log('\n2. Testing non-existent user...');
    const nonExistentUserResponse = await axios.post(`${BASE_URL}/check-user`, {
      email: 'nonexistent@university.edu'
    });
    console.log('✅ Non-existent user response:', nonExistentUserResponse.data);
  } catch (error: any) {
    if (error.response) {
      console.log('✅ Expected error for non-existent user:', error.response.data);
    }
  }

  try {
    // Test 3: Missing email
    console.log('\n3. Testing missing email...');
    const missingEmailResponse = await axios.post(`${BASE_URL}/check-user`, {});
    console.log('✅ Missing email response:', missingEmailResponse.data);
  } catch (error: any) {
    if (error.response) {
      console.log('✅ Expected error for missing email:', error.response.data);
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Login API Tests...\n');
  
  await testLoginAPI();
  await testErrorCases();
  
  console.log('\n✅ All tests completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Check your email for the OTP');
  console.log('2. Uncomment the verify OTP test and replace with actual OTP');
  console.log('3. Test the complete login flow');
}

runTests().catch(console.error); 