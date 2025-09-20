"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadSingleImage = void 0;
const multer_1 = __importDefault(require("multer"));
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
// File filter to only allow specific image types
const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPEG, PNG, or WEBP image files are allowed'));
    }
};
// Configure multer
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 4 * 1024 * 1024, // 4MB limit
    },
});
// Middleware for single image upload
exports.uploadSingleImage = upload.single('image');
// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum size is 4MB.' });
        }
        return res.status(400).json({ error: err.message });
    }
    else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
};
exports.handleUploadError = handleUploadError;
