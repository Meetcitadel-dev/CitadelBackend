import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  bookingId: string;
  phonepeOrderId: string;
  phonepePaymentId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  signature?: string;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  bookingId: {
    type: String,
    required: true,
    index: true
  },
  phonepeOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phonepePaymentId: {
    type: String,
    unique: true,
    sparse: true
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
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  signature: {
    type: String
  },
  paymentMethod: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ phonepeOrderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model<IPayment>('Payment', paymentSchema); 