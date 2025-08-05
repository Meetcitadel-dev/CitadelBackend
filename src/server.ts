import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import app from './app';
import './models'; // Import all models to ensure they are initialized
import { setupAssociations } from './models/associations';
import websocketService from './services/websocket.service';

// Setup model associations
setupAssociations();

const PORT = process.env.PORT || 3001;

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket service
websocketService.initialize(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server initialized`);
});

