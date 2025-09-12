import { model, Schema } from "mongoose";
import { TCourse } from "./course.interface";

const instructorSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, required: true },
  imageUrl: { type: String, required: true },
}, { _id: false });

const courseModuleSchema = new Schema({
  title: { type: String, required: true },
  lessons: [{ type: String, required: true }],
}, { _id: false });

const courseFeatureSchema = new Schema({
  value: { type: String, required: true },
}, { _id: false });

const projectSchema = new Schema({
  name: { type: String, required: true },
}, { _id: false });

const courseSchema = new Schema<TCourse>({
  title: { type: String, required: true },
  batchName: { type: String, required: true },
  description: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
  videoUrl: { type: String },
  courseType: { type: String, required: true },
  upcomingCourse: { type: Number, required: false, default: 0 },
  enrolledStudents: { type: Number, required: true, default: 0 },
  moduleCount: { type: Number, required: true, default: 0 },
  projectCount: { type: Number, required: true, default: 0 },
  assignmentCount: { type: Number, required: true, default: 0 },
  price: { type: Number, required: true, default: 0 },
  originalPrice: { type: Number, required: true, default: 0 },
  instructors: [instructorSchema],
  courseFeatures: [courseFeatureSchema],
  courseModules: [courseModuleSchema],
  projects: [projectSchema],
  isPublished: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Automatically update updatedAt field on save
courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Automatically update updatedAt field on update operations
courseSchema.pre(['updateOne', 'findOneAndUpdate'], function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Index for better query performance
courseSchema.index({ courseType: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isDeleted: 1 });
courseSchema.index({ title: 'text', description: 'text' });

export const Course = model<TCourse>("Course", courseSchema);
