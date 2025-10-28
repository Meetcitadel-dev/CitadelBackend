"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const http_1 = require("http");
const app_1 = __importDefault(require("./app"));
require("./models"); // Import all models to ensure they are initialized
const associations_1 = require("./models/associations");
const websocket_service_1 = __importDefault(require("./services/websocket.service"));
const mongodb_1 = __importDefault(require("./config/mongodb"));
// Setup model associations
(0, associations_1.setupAssociations)();
const PORT = process.env.PORT || 3001;
// Start server only after MongoDB is connected
(async () => {
    try {
        await (0, mongodb_1.default)();
        // Create HTTP server
        const server = (0, http_1.createServer)(app_1.default);
        // Initialize WebSocket service
        websocket_service_1.default.initialize(server);
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`WebSocket server initialized`);
        });
    }
    catch (err) {
        console.error('Failed to start server due to MongoDB connection error:', err);
        process.exit(1);
    }
})();
