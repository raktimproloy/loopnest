import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ModuleServices } from "./module.service";

export const createModule = catchAsync(async (req, res) => {
  // Force creatorId from authenticated admin token
  const payload = { ...req.body, creatorId: req.admin?.userId } as any;
  const result = await ModuleServices.createModuleIntoDb(payload);
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Module created successfully",
      data: result,
    });
  }
});

export const getAllModules = catchAsync(async (req, res) => {
  const result = await ModuleServices.getAllBlogsFromDb(req.query);
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Modules fetched successfully",
      data: result,
    });
  }
});

export const getSingleModule = catchAsync(async (req, res) => {
  const result = await ModuleServices.getSingleModuleFromDb(req.params.id);
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Module fetched successfully",
      data: result,
    });
  }
});

export const updateModule = catchAsync(async (req, res) => {
  const result = await ModuleServices.updateModuleIntoDb(
    req.params.id,
    req.body
  );
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Module updated successfully",
      data: result,
    });
  }
});

export const deleteModule = catchAsync(async (req, res) => {
  const result = await ModuleServices.deleteModuleFromDb(req.params.id);
  if (result) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Module deleted successfully",
      data: result,
    });
  }
});

export const moduleController = {
  createModule,
  getAllModules,
  getSingleModule,
  updateModule,
  deleteModule,
};
