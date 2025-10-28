"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const BookingSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true
    },
    eventId: {
        type: String,
        required: true,
        index: true
    },
    eventType: String,
    amount: Number,
    currency: {
        type: String,
        default: 'INR'
    },
    bookingDate: Date,
    bookingTime: String,
    location: String,
    guests: {
        type: Number,
        default: 1
    },
    notes: {
        type: mongoose_1.Schema.Types.Mixed,
        default: null
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
        index: true
    },
    // Razorpay fields
    razorpayOrderId: {
        type: String,
        index: { unique: true, partialFilterExpression: { razorpayOrderId: { $type: "string" } } }
    },
    razorpayPaymentId: {
        type: String,
        index: true,
        sparse: true
    },
    // PhonePe fields (for backward compatibility)
    phonepeOrderId: {
        type: String,
        index: true,
        sparse: true
    },
    phonepePaymentId: {
        type: String,
        index: true,
        sparse: true
    }
}, {
    timestamps: true,
    collection: 'bookings'
});
const Booking = mongoose_1.default.model('Booking', BookingSchema);
exports.default = Booking;
