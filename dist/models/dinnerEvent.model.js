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
const DinnerEventSchema = new mongoose_1.Schema({
    eventDate: {
        type: Date,
        required: true,
        index: true
    },
    eventTime: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
        index: true
    },
    area: {
        type: String,
        required: true
    },
    venue: {
        type: String
    },
    venueAddress: {
        type: String
    },
    venueDetails: {
        type: String
    },
    maxAttendees: {
        type: Number,
        default: 6,
        required: true
    },
    currentAttendees: {
        type: Number,
        default: 0
    },
    attendeeIds: [{
            type: String,
            ref: 'User'
        }],
    bookingFee: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'full', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    groupChatId: {
        type: String,
        ref: 'Group'
    },
    groupChatCreated: {
        type: Boolean,
        default: false
    },
    groupChatCreatedAt: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'dinner_events'
});
// Create indexes
DinnerEventSchema.index({ eventDate: 1, city: 1 });
DinnerEventSchema.index({ status: 1 });
DinnerEventSchema.index({ attendeeIds: 1 });
const DinnerEvent = mongoose_1.default.model('DinnerEvent', DinnerEventSchema);
exports.default = DinnerEvent;
