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
// Routes
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
const quiz_routes_1 = __importDefault(require("./routes/quiz.routes"));
const personalityQuiz_routes_1 = __importDefault(require("./routes/personalityQuiz.routes"));
const dinnerPreferences_routes_1 = __importDefault(require("./routes/dinnerPreferences.routes"));
const dinnerEvents_routes_1 = __importDefault(require("./routes/dinnerEvents.routes"));
const eventManagement_routes_1 = __importDefault(require("./routes/eventManagement.routes"));
const app = (0, express_1.default)();
/* ------------------------------- SECURITY --------------------------------- */
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(helmet_1.default.contentSecurityPolicy({
    useDefaults: true,
    directives: {
        ...helmet_1.default.contentSecurityPolicy.getDefaultDirectives(),
        'img-src': ["'self'", 'https:', 'data:'], // allow images from HTTPS and data URLs
    },
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
/* ------------------------------- CORS CONFIG ------------------------------ */
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
    : [
        'https://citadel-frontend-linp.vercel.app',
        'http://localhost:5173',
    ]; // default allowed origins
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true); // allow non-browser or same-origin requests
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        console.warn(`❌ Blocked by CORS: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
};
// ✅ Use CORS middleware
app.use((0, cors_1.default)(corsOptions));
// Preflight requests are handled by CORS middleware above
/* ----------------------------- FALLBACK CORS ------------------------------ */
// (helps when Render proxies strip headers)
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
/* ----------------------------- TEST ENDPOINT ------------------------------ */
app.get('/api/test', (req, res) => {
    res.json({ success: true, message: '✅ Server is working properly!' });
});
/* ----------------------------- REGISTER ROUTES ---------------------------- */
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/profile', profile_routes_1.default);
app.use('/api/profile', profile_routes_1.default);
app.use('/api/v1', university_routes_1.default);
app.use('/api/v1', onboarding_routes_1.default);
app.use('/api/v1/explore', explore_routes_1.default);
app.use('/api/v1/enhanced-explore', enhancedExplore_routes_1.default);
app.use('/api/v1/connections', connections_routes_1.default);
app.use('/api/v1', notification_routes_1.default);
app.use('/api/v1/users', userProfile_routes_1.default);
app.use('/api/v1/chats', chat_routes_1.default);
app.use('/api/v1/enhanced-chats', enhancedChat_routes_1.default);
app.use('/api/v1/group-chats', groupChat_routes_1.default);
app.use('/api/v1/groups', groupChat_routes_1.default);
app.use('/api/v1/payments', payment_routes_1.default);
app.use('/api/payments', payment_routes_1.default);
app.use('/api/v1/quiz', quiz_routes_1.default);
app.use('/api/quiz', personalityQuiz_routes_1.default);
app.use('/api/v1/dinner-preferences', dinnerPreferences_routes_1.default);
app.use('/api/v1/dinner-events', dinnerEvents_routes_1.default);
app.use('/api/v1/event-management', eventManagement_routes_1.default);
/* ---------------------------- ERROR HANDLING ------------------------------ */
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.message);
    if (err.message.includes('CORS')) {
        return res.status(403).json({ success: false, error: 'CORS blocked' });
    }
    res.status(500).json({ success: false, message: err.message });
});
exports.default = app;
