import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { ModuleSearchableFields } from "./module.constant";
import { TModule } from "./module.interface";
import { Module } from "./module.model";
import httpStatus from "http-status";

export const createModuleIntoDb = async (payload: TModule) => {
  // Create new Module
  const newModule = await Module.create(payload);
  return newModule;
};

export const getSingleModuleFromDb = async (id: string) => {
  const result = await Module.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "No Module found");
  }
  return result;
};

export const getAllBlogsFromDb = async (query: Record<string, unknown>) => {
  // Allow filtering by courseId and isPublished explicitly
  const filter: any = { isDeleted: false };
  if (query.courseId) filter.courseId = query.courseId;
  if (query.isPublished !== undefined) filter.isPublished = String(query.isPublished) === 'true';

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const sort = (query.sort as string)?.split(',').join(' ') || '-createdAt';
  const fields = (query.fields as string)?.split(',').join(' ') || '-__v';

  const [items, total] = await Promise.all([
    Module.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(fields),
    Module.countDocuments(filter),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: items,
  };
};

export const updateModuleIntoDb = async (id: string, payload: TModule) => {
  const result = await Module.findByIdAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "No Module found");
  }
  return result;
};

export const deleteModuleFromDb = async (id: string) => {
  const result = await Module.findByIdAndUpdate(
    { _id: id },
    { isDeleted: true }
  );
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "No Module found");
  }
  return result;
};

export const ModuleServices = {
  createModuleIntoDb,
  getSingleModuleFromDb,
  getAllBlogsFromDb,
  updateModuleIntoDb,
  deleteModuleFromDb,
};
