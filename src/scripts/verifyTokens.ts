import jwt from 'jsonwebtoken';

const TOKEN1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE1LCJ1c2VybmFtZSI6ImFua2l0cmFuamFuXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6ImFua2l0cmFuamFuXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzNzI3NjI1LCJleHAiOjE3NTQxNTk2MjV9.sT6crFmHnsM8za-NJIaP5ph2mVuVkVY-RMuJL99SzJo';
const TOKEN2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE2LCJ1c2VybmFtZSI6Im5pc2FyZ3BhdGVsXzIxNDEyIiwicm9sZSI6IlVTRVIiLCJlbWFpbCI6Im5pc2FyZ3BhdGVsXzIxNDEyQGFpdHB1bmUuZWR1LmluIiwiaWF0IjoxNzUzNzI3NjI1LCJleHAiOjE3NTQxNTk2MjV9.sT6crFmHnsM8za-NJIaP5ph2mVuVkVY-RMuJL99SzJo';

function verifyTokens() {
  console.log('🔐 Verifying JWT Tokens...\n');

  try {
    // Verify Token 1 (Ankit)
    console.log('🔍 Verifying Token 1 (Ankit)...');
    const decoded1 = jwt.verify(TOKEN1, process.env.JWT_SECRET || 'secret') as any;
    console.log('✅ Token 1 is valid');
    console.log('   User ID:', decoded1.sub);
    console.log('   Email:', decoded1.email);
    console.log('   Username:', decoded1.username);
    console.log('   Expires:', new Date(decoded1.exp * 1000));
    console.log('   Current time:', new Date());
    console.log('   Token expired:', Date.now() > decoded1.exp * 1000 ? 'YES' : 'NO');

  } catch (error) {
    console.error('❌ Token 1 is invalid:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  try {
    // Verify Token 2 (Nisarg)
    console.log('🔍 Verifying Token 2 (Nisarg)...');
    const decoded2 = jwt.verify(TOKEN2, process.env.JWT_SECRET || 'secret') as any;
    console.log('✅ Token 2 is valid');
    console.log('   User ID:', decoded2.sub);
    console.log('   Email:', decoded2.email);
    console.log('   Username:', decoded2.username);
    console.log('   Expires:', new Date(decoded2.exp * 1000));
    console.log('   Current time:', new Date());
    console.log('   Token expired:', Date.now() > decoded2.exp * 1000 ? 'YES' : 'NO');

  } catch (error) {
    console.error('❌ Token 2 is invalid:', error);
  }
}

verifyTokens(); 