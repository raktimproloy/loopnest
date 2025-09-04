import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { ModuleSearchableFields } from "./module.constant";
import { TModule } from "./module.interface";
import { Module } from "./module.model";
import httpStatus from "http-status";

export const createModuleIntoDb = async (payload: TModule) => {
  // Check if same module already has a module with this title
  const isExistBlog = await Module.findOne({
    title: payload.title,
    isDeleted: false,
  });

  if (isExistBlog) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Coupon with this code already exists"
    );
  }

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
  const moduleQuery = new QueryBuilder(Module.find().populate("userId"), query)
    .search(ModuleSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await moduleQuery.modelQuery.exec();

  const { page, limit, total, totalPage } = await moduleQuery.countTotal();
  return {
    meta: { page, limit, total, totalPage },
    data: result,
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
