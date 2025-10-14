"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const mongodb_1 = __importDefault(require("./config/mongodb"));
const university_routes_1 = __importDefault(require("./routes/university.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const onboarding_routes_1 = __importDefault(require("./routes/onboarding.routes"));
const explore_routes_1 = __importDefault(require("./routes/explore.routes"));
const enhancedExplore_routes_1 = __importDefault(require("./routes/enhancedExplore.routes"));
const connections_routes_1 = __importDefault(require("./routes/connections.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const userProfile_routes_1 = __importDefault(require("./routes/userProfile.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const enhancedChat_routes_1 = __importDefault(require("./routes/enhancedChat.routes"));
const groupChat_routes_1 = __importDefault(require("./routes/groupChat.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
// Loosen CSP for images so CloudFront/UploadThing can load
app.use(helmet_1.default.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        ...helmet_1.default.contentSecurityPolicy.getDefaultDirectives(),
        // Allow images from HTTPS and data URLs
        'img-src': ["'self'", 'https:', 'data:'],
    }
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// CORS configuration using environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:5173']; // Default to development
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true
}));
// Connect to MongoDB
(0, mongodb_1.default)();
// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: 'Server is working!' });
});
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/profile', profile_routes_1.default);
app.use('/api/profile', profile_routes_1.default); // Add alias for backward compatibility
app.use('/api/v1', university_routes_1.default);
app.use('/api/v1', onboarding_routes_1.default);
app.use('/api/v1/explore', explore_routes_1.default);
app.use('/api/v1/enhanced-explore', enhancedExplore_routes_1.default);
app.use('/api/v1/connections', connections_routes_1.default); // Use dedicated connections routes
app.use('/api/v1', notification_routes_1.default); // Add notification routes
app.use('/api/v1/users', userProfile_routes_1.default); // Add user profile routes
app.use('/api/v1/chats', chat_routes_1.default); // Add chat routes
app.use('/api/v1/enhanced-chats', enhancedChat_routes_1.default); // Add enhanced chat routes
app.use('/api/v1/group-chats', groupChat_routes_1.default); // Add group chat routes
app.use('/api/v1/groups', groupChat_routes_1.default); // Add alias for groups endpoint
app.use('/api/v1/payments', payment_routes_1.default); // Add payment routes
app.use('/api/payments', payment_routes_1.default); // Add alias for frontend compatibility
exports.default = app;
