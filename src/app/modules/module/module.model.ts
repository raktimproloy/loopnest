import { model, Schema } from "mongoose";
import { TModule } from "./module.interface";

const moduleSchema = new Schema<TModule>({
  title: { type: String, required: true },
  courseId: { type: String, ref: 'Course', required: true },
  lessons: [{ type: String, required: true }],
  creatorId: { type: String, ref: 'User', required: true },
  duration: { type: String, required: true },
  resourceLink: { type: String },
  assignments: [{ type: String }],
  videoLink: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
});

export const Module = model<TModule>("Module", moduleSchema);
