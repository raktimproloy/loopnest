import { model, Schema } from "mongoose";
import { TModule } from "./module.interface";

const moduleSchema = new Schema<TModule>({
  title: { type: String, required: true },
  course: { type: String, required: true },
  lessons: [{ lesson1: String, lesson2: String, description: String }],
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: true },
});

export const Module = model<TModule>("Module", moduleSchema);
