import { model, Schema } from 'mongoose';
import { TPayment } from './payment.interface';

const paymentSchema = new Schema<TPayment>({
  userId: { type: String, ref: 'User', required: true },
  courseId: { type: String, ref: 'Course', required: true },
  paymentType: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  transaction_id: { type: String },
  send_number: { type: String },
  account_name: { type: String },
  bank_name: { type: String },
  account_number: { type: String },
  accept_admin_id: { type: String, ref: 'User' },
  cuponCode: { type: String }, // Optional coupon code for discount
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// timestamps are set in schema defaults; pre hooks not needed for TS types

export const Payment = model<TPayment>('Payment', paymentSchema);


