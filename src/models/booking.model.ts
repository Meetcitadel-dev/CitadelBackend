import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: string;
  eventId: string;
  eventType: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'failed';
  phonepeOrderId?: string;
  phonepePaymentId?: string;
  bookingDate: Date;
  bookingTime: string;
  location: string;
  guests: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  eventId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['Dinner', 'Lunch', 'Breakfast', 'Party', 'Meeting', 'Other']
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'failed'],
    default: 'pending'
  },
  phonepeOrderId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  phonepePaymentId: {
    type: String,
    unique: true,
    sparse: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  bookingTime: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ eventId: 1, status: 1 });
bookingSchema.index({ phonepeOrderId: 1 });
bookingSchema.index({ createdAt: -1 });

export default mongoose.model<IBooking>('Booking', bookingSchema); 