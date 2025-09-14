import { model, Schema, Types } from "mongoose";
import { TUser } from "./student.interface";

const studentSchema = new Schema<TUser>({
  fullName: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  password: { type: String },
  role: {
    type: String,
    enum: ['student', 'mentor'],
    default: 'student',
  },
  registrationType: { 
    type: String, 
    enum: ['manual', 'google', 'facebook'], 
    required: true 
  },
  emailVerified: { type: Boolean, default: false },
  otpCode: { type: String },
  otpExpire: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'blocked'], 
    default: 'active' 
  },
  profileImage: { type: String },
  googleId: { type: String },
  facebookId: { type: String },
  lastLogin: { type: Date },
  activeCourses: [{ type: Types.ObjectId, ref: 'Course', default: [] }],
  usedCoupons: [{ type: Types.ObjectId, ref: 'Coupon', default: [] }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

// Automatically update updatedAt field on save
studentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Automatically update updatedAt field on update operations
studentSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Indexes for better query performance and uniqueness on optional fields
studentSchema.index({ email: 1 }, { unique: true, sparse: true });
studentSchema.index({ phone: 1 }, { unique: true, sparse: true });
studentSchema.index({ googleId: 1 });
studentSchema.index({ facebookId: 1 });

export const Student = model<TUser>("User", studentSchema);
