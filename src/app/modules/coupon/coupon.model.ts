import { model, Schema, Types } from "mongoose";
import { TCoupon } from "./coupon.interface";

const couponSchema = new Schema<TCoupon>({
  cuponCode: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true 
  },
  discountType: { 
    type: String, 
    enum: ['percentage', 'amount'], 
    required: true 
  },
  discountValue: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  usageLimit: { 
    type: Number, 
    min: 1,
    default: null // null means unlimited
  },
  totalUse: { 
    type: Number, 
    default: 0,
    min: 0 
  },
  expiryDate: { 
    type: Date, 
    required: true 
  },
  courseId: { 
    type: String, 
    ref: 'Course', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'expired'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

// Automatically update updatedAt field on save
couponSchema.pre('save', function(next) {
  (this as any).updatedAt = new Date();
  
  // Check if coupon is expired
  if ((this as any).expiryDate && (this as any).expiryDate < new Date()) {
    (this as any).status = 'expired';
  }
  
  next();
});

// Automatically update updatedAt field on update operations
couponSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Indexes for better query performance
couponSchema.index({ cuponCode: 1 });
couponSchema.index({ courseId: 1 });
couponSchema.index({ status: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ isDeleted: 1 });
couponSchema.index({ createdAt: -1 });

// Compound indexes
couponSchema.index({ courseId: 1, status: 1 });
couponSchema.index({ status: 1, expiryDate: 1 });

export const Coupon = model<TCoupon>("Coupon", couponSchema);
