import axios from 'axios';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:3000/api/v1';

async function testConversationDetails() {
  try {
    // Generate a valid token for user ID 15 (Ankit)
    const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_2024';
    const token = jwt.sign({ 
      sub: 15, 
      username: 'ankitranjan_21412',
      role: 'USER',
      email: 'ankitranjan_21412@aitpune.edu.in'
    }, JWT_SECRET, { expiresIn: '5d' });

    console.log('Using token for user ID 15 (Ankit)');

    // First, let's create a conversation between user 15 and user 30
    console.log('Creating conversation between user 15 and user 30...');
    const conversationResponse = await axios.get(`${BASE_URL}/chats/conversation/30`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Conversation created:', conversationResponse.data);

    if (conversationResponse.data.success) {
      const conversationId = conversationResponse.data.conversation.id;
      console.log('Testing conversation details with ID:', conversationId);

      // Test the new conversation details endpoint
      const detailsResponse = await axios.get(`${BASE_URL}/chats/conversation/details/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Conversation details response:', detailsResponse.data);
    }

  } catch (error: any) {
    console.error('Error testing conversation details:', error.response?.data || error.message);
  }
}

testConversationDetails(); 