import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  userId: string;
  eventId: string;
  eventType?: string;
  amount?: number;
  currency?: string;
  bookingDate?: Date;
  bookingTime?: string;
  location?: string;
  guests?: number;
  notes?: any;
  status: 'pending' | 'confirmed' | 'cancelled';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  phonepeOrderId?: string;
  phonepePaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
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
    type: Schema.Types.Mixed,
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

const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;