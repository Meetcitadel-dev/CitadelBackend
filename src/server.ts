import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import app from './app';
import './models'; // Import all models to ensure they are initialized
import { setupAssociations } from './models/associations';
import websocketService from './services/websocket.service';
import connectMongoDB from './config/mongodb';

// Setup model associations
setupAssociations();

const PORT = process.env.PORT || 3001;

// Start server only after MongoDB is connected
(async () => {
  try {
    await connectMongoDB();

    // Create HTTP server
    const server = createServer(app);

    // Initialize WebSocket service
    websocketService.initialize(server);

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server initialized`);
    });
  } catch (err) {
    console.error('Failed to start server due to MongoDB connection error:', err);
    process.exit(1);
  }
})();

