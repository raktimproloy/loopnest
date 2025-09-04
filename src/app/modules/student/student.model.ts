import { model, Schema } from "mongoose";
import { TStudent } from "./student.interface";

const studentSchema = new Schema<TStudent>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String },
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

// Index for better query performance
studentSchema.index({ email: 1 });
studentSchema.index({ googleId: 1 });
studentSchema.index({ facebookId: 1 });

export const Student = model<TStudent>("Student", studentSchema);
