import mongoose, { Schema, Document } from 'mongoose';

export interface IDinnerBooking extends Document {
  userId: string;
  eventId: string;
  
  // Payment details
  paymentId: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentAmount: number;
  paymentMethod: string;
  paymentGateway: 'razorpay' | 'phonepe' | 'stripe' | 'cash';
  
  // Booking details
  bookingStatus: 'confirmed' | 'cancelled' | 'completed';
  bookingDate: Date;
  cancellationDate?: Date;
  cancellationReason?: string;
  
  // Notifications
  reminderSent: boolean;
  venueDetailsSent: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const DinnerBookingSchema = new Schema<IDinnerBooking>({
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

const DinnerBooking = mongoose.model<IDinnerBooking>('DinnerBooking', DinnerBookingSchema);

export default DinnerBooking;

