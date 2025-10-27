import mongoose, { Schema, Document } from 'mongoose';

export interface IDinnerEvent extends Document {
  eventDate: Date;
  eventTime: string; // e.g., "8:00 PM"
  city: string;
  area: string;
  venue?: string; // Restaurant name (revealed 24 hours before)
  venueAddress?: string;
  venueDetails?: string;
  
  maxAttendees: number;
  currentAttendees: number;
  attendeeIds: string[]; // User IDs who booked
  
  bookingFee: number; // in rupees
  status: 'upcoming' | 'full' | 'completed' | 'cancelled';
  
  // Group chat details
  groupChatId?: string;
  groupChatCreated: boolean;
  groupChatCreatedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const DinnerEventSchema = new Schema<IDinnerEvent>({
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

const DinnerEvent = mongoose.model<IDinnerEvent>('DinnerEvent', DinnerEventSchema);

export default DinnerEvent;

