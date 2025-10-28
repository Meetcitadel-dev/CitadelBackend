import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  bookingId: string;
  userId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: 'cash' | 'razorpay' | 'phonepe';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  phonepeOrderId?: string;
  phonepePaymentId?: string;
  signature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: {
      type: String,
      required: true,
      ref: 'Booking',
      index: true,
    },
    userId: {
      type: String,
      ref: 'User',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'razorpay', 'phonepe'],
      default: 'razorpay',
    },

    // ✅ Razorpay fields
    razorpayOrderId: {
      type: String,
      index: {
        unique: true,
        partialFilterExpression: { razorpayOrderId: { $type: 'string' } },
      },
    },
    razorpayPaymentId: {
      type: String,
      index: {
        unique: true,
        partialFilterExpression: { razorpayPaymentId: { $type: 'string' } },
      },
    },
    razorpaySignature: String,

    // ✅ PhonePe fields (optional unique per payment)
    phonepeOrderId: {
      type: String,
      index: {
        unique: true,
        partialFilterExpression: { phonepeOrderId: { $type: 'string' } },
      },
    },
    phonepePaymentId: {
      type: String,
      index: {
        unique: true,
        partialFilterExpression: { phonepePaymentId: { $type: 'string' } },
      },
    },

    signature: String,
  },
  {
    timestamps: true,
    collection: 'payments',
  }
);

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
