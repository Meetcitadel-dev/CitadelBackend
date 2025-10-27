import mongoose, { Schema, Document } from 'mongoose';

export interface IDinnerPreferences extends Document {
  userId: string;
  
  // Location preferences
  city?: string;
  preferredAreas?: string[];
  
  // Dining preferences
  budget?: 'low' | 'medium' | 'high'; // $, $$, $$$
  language?: string[];
  dietaryRestriction?: 'veg' | 'non-veg' | 'vegan' | 'any';
  drinksPreference?: 'yes' | 'no' | 'occasionally';
  relationshipStatus?: 'single' | 'in-relationship' | 'married' | 'prefer-not-to-say';
  
  // Personality quiz results
  personalityTraits?: {
    questionId: string;
    question: string;
    answer: string;
  }[];
  personalityScore?: number;
  
  // Setup completion
  hasCompletedSetup: boolean;
  setupCompletedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const DinnerPreferencesSchema = new Schema<IDinnerPreferences>({
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

const DinnerPreferences = mongoose.model<IDinnerPreferences>('DinnerPreferences', DinnerPreferencesSchema);

export default DinnerPreferences;

