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
const DinnerBookingSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        ref: 'User',
        index: true
    },
    eventId: {
        type: String,
        required: true,
        ref: 'DinnerEvent',
        index: true
    },
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentGateway: {
        type: String,
        enum: ['razorpay', 'phonepe', 'stripe', 'cash'],
        required: true
    },
    bookingStatus: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed'],
        default: 'confirmed'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    cancellationDate: {
        type: Date
    },
    cancellationReason: {
        type: String
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    venueDetailsSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    collection: 'dinner_bookings'
});
// Create indexes
DinnerBookingSchema.index({ userId: 1, eventId: 1 });
DinnerBookingSchema.index({ paymentId: 1 });
DinnerBookingSchema.index({ bookingStatus: 1 });
DinnerBookingSchema.index({ createdAt: -1 });
const DinnerBooking = mongoose_1.default.model('DinnerBooking', DinnerBookingSchema);
exports.default = DinnerBooking;
