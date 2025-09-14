import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { CouponServices } from "./coupon.service";
import httpStatus from "http-status";
import { COUPON_MESSAGES } from "./coupon.constant";

// Admin Controllers
const createCoupon = catchAsync(async (req, res) => {
  const payload = req.body;
  
  const result = await CouponServices.createCoupon(payload);
  
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: COUPON_MESSAGES.CREATED,
    data: result,
  });
});

const getAllCoupons = catchAsync(async (req, res) => {
  const result = await CouponServices.getAllCoupons(req.query);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupons fetched successfully",
    data: result,
  });
});

const getCouponById = catchAsync(async (req, res) => {
  const result = await CouponServices.getCouponById(req.params.id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon fetched successfully",
    data: result,
  });
});

const updateCoupon = catchAsync(async (req, res) => {
  const payload = req.body;
  const result = await CouponServices.updateCoupon(req.params.id, payload);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: COUPON_MESSAGES.UPDATED,
    data: result,
  });
});

const updateCouponStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const result = await CouponServices.updateCouponStatus(req.params.id, status);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: COUPON_MESSAGES.STATUS_UPDATED,
    data: result,
  });
});

const deleteCoupon = catchAsync(async (req, res) => {
  const result = await CouponServices.deleteCoupon(req.params.id);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
});

// Student Controllers
const useCoupon = catchAsync(async (req, res) => {
  const payload = {
    ...req.body,
    userId: (req as any).user?.userId,
  };
  
  const result = await CouponServices.useCoupon(payload);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.coupon,
  });
});

const getCouponByCode = catchAsync(async (req, res) => {
  const { cuponCode } = req.params;
  const result = await CouponServices.getCouponByCode(cuponCode);
  
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coupon details fetched successfully",
    data: result,
  });
});

export const couponController = {
  // Admin controllers
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
  
  // Student controllers
  useCoupon,
  getCouponByCode,
};
