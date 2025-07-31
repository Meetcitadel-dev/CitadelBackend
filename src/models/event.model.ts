import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  eventType: string;
  date: Date;
  time: string;
  location: string;
  price: number;
  currency: string;
  maxGuests: number;
  currentBookings: number;
  status: 'active' | 'inactive' | 'cancelled';
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['Dinner', 'Lunch', 'Breakfast', 'Party', 'Meeting', 'Other']
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  maxGuests: {
    type: Number,
    required: true,
    min: 1
  },
  currentBookings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active'
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventSchema.index({ eventType: 1, date: 1, status: 1 });
eventSchema.index({ status: 1 });

export default mongoose.model<IEvent>('Event', eventSchema);







