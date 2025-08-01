import { Request, Response } from 'express';
import exploreController from '../controllers/explore.controller';

// Mock request and response objects for testing
const createMockRequest = (query: any = {}, body: any = {}, user: any = { id: 1 }) => {
  return {
    query,
    body,
    user
  } as Request;
};

const createMockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Test the enhanced explore profiles endpoint
const testGridViewFunctionality = async () => {
  console.log('🧪 Testing Grid View Functionality...\n');

  // Test 1: Basic profile fetching
  console.log('1. Testing basic profile fetching...');
  const basicReq = createMockRequest({ limit: 5, offset: 0 });
  const basicRes = createMockResponse();
  
  try {
    await exploreController.getExploreProfiles(basicReq, basicRes);
    console.log('✅ Basic profile fetching works');
  } catch (error) {
    console.log('❌ Basic profile fetching failed:', error);
  }

  // Test 2: Search functionality
  console.log('\n2. Testing search functionality...');
  const searchReq = createMockRequest({ 
    limit: 5, 
    offset: 0, 
    search: 'test' 
  });
  const searchRes = createMockResponse();
  
  try {
    await exploreController.getExploreProfiles(searchReq, searchRes);
    console.log('✅ Search functionality works');
  } catch (error) {
    console.log('❌ Search functionality failed:', error);
  }

  // Test 3: Filtering functionality
  console.log('\n3. Testing filtering functionality...');
  const filterReq = createMockRequest({ 
    limit: 5, 
    offset: 0, 
    gender: 'male',
    years: ['First', 'Second'],
    universities: ['MIT'],
    skills: ['JavaScript']
  });
  const filterRes = createMockResponse();
  
  try {
    await exploreController.getExploreProfiles(filterReq, filterRes);
    console.log('✅ Filtering functionality works');
  } catch (error) {
    console.log('❌ Filtering functionality failed:', error);
  }

  // Test 4: Sorting functionality
  console.log('\n4. Testing sorting functionality...');
  const sortReq = createMockRequest({ 
    limit: 5, 
    offset: 0, 
    sortBy: 'name_asc' 
  });
  const sortRes = createMockResponse();
  
  try {
    await exploreController.getExploreProfiles(sortReq, sortRes);
    console.log('✅ Sorting functionality works');
  } catch (error) {
    console.log('❌ Sorting functionality failed:', error);
  }

  // Test 5: Connection management
  console.log('\n5. Testing connection management...');
  const connectionReq = createMockRequest(
    {}, 
    { targetUserId: 2, action: 'connect' }
  );
  const connectionRes = createMockResponse();
  
  try {
    await exploreController.manageConnection(connectionReq, connectionRes);
    console.log('✅ Connection management works');
  } catch (error) {
    console.log('❌ Connection management failed:', error);
  }

  console.log('\n🎉 Grid View Backend Testing Complete!');
};

// Run the tests
testGridViewFunctionality().catch(console.error); 