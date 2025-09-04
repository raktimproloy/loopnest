import { model, Schema } from "mongoose";
import { TAdmin } from "./admin.interface";

const adminSchema = new Schema<TAdmin>({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'admin', 'moderator'], 
    required: true,
    default: 'admin'
  },
  permissions: [{ type: String, required: true }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
});

// Automatically update updatedAt field on save
adminSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Automatically update updatedAt field on update operations
adminSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Index for better query performance
adminSchema.index({ email: 1 });
adminSchema.index({ role: 1 });
adminSchema.index({ isActive: 1 });

export const Admin = model<TAdmin>("Admin", adminSchema);
