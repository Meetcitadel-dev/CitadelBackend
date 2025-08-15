"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connectionRequest_model_1 = __importDefault(require("../models/connectionRequest.model"));
const notificationReadStatus_model_1 = __importDefault(require("../models/notificationReadStatus.model"));
async function checkAndCreateTables() {
    try {
        console.log('Checking and creating tables...');
        // Sync the models to create tables if they don't exist
        await connectionRequest_model_1.default.sync({ force: false });
        console.log('✅ ConnectionRequest table is ready');
        await notificationReadStatus_model_1.default.sync({ force: false });
        console.log('✅ NotificationReadStatus table is ready');
        console.log('All tables are ready!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error creating tables:', error);
        process.exit(1);
    }
}
checkAndCreateTables();
