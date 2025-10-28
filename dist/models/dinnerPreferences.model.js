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
const DinnerPreferencesSchema = new mongoose_1.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        ref: 'User',
        index: true
    },
    city: {
        type: String
    },
    preferredAreas: [{
            type: String
        }],
    budget: {
        type: String,
        enum: ['low', 'medium', 'high']
    },
    language: [{
            type: String
        }],
    dietaryRestriction: {
        type: String,
        enum: ['veg', 'non-veg', 'vegan', 'any']
    },
    drinksPreference: {
        type: String,
        enum: ['yes', 'no', 'occasionally']
    },
    relationshipStatus: {
        type: String,
        enum: ['single', 'in-relationship', 'married', 'prefer-not-to-say']
    },
    personalityTraits: [{
            questionId: String,
            question: String,
            answer: String
        }],
    personalityScore: {
        type: Number,
        default: 0
    },
    hasCompletedSetup: {
        type: Boolean,
        default: false
    },
    setupCompletedAt: {
        type: Date
    }
}, {
    timestamps: true,
    collection: 'dinner_preferences'
});
// Create indexes
DinnerPreferencesSchema.index({ userId: 1 });
DinnerPreferencesSchema.index({ city: 1 });
DinnerPreferencesSchema.index({ hasCompletedSetup: 1 });
const DinnerPreferences = mongoose_1.default.model('DinnerPreferences', DinnerPreferencesSchema);
exports.default = DinnerPreferences;
