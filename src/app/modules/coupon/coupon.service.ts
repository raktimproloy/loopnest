import AppError from '../../errors/AppError';
import { TCoupon, TCouponCreateData, TCouponUpdateData, TCouponUsageData, TCouponListResponse, TCouponStats } from './coupon.interface';
import { Coupon } from './coupon.model';
import { Student } from '../student/student.model';
import { Course } from '../course/course.model';
import httpStatus from 'http-status';
import { COUPON_MESSAGES } from './coupon.constant';

export const createCoupon = async (payload: TCouponCreateData) => {
  try {
    // Check if course exists
    const course = await Course.findById(payload.courseId);
    if (!course || course.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, "Course not found");
    }

    // Convert expiryDate to Date object if it's a string
    const expiryDate = typeof payload.expiryDate === 'string' 
      ? new Date(payload.expiryDate) 
      : payload.expiryDate;

    // Validate discount value based on type
    if (payload.discountType === 'percentage' && payload.discountValue > 100) {
      throw new AppError(httpStatus.BAD_REQUEST, "Percentage discount cannot exceed 100%");
    }

    const couponData = {
      ...payload,
      cuponCode: payload.cuponCode.toUpperCase(),
      expiryDate,
      totalUse: 0,
      status: payload.status || 'active',
    };

    const newCoupon = await Coupon.create(couponData);
    return newCoupon;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Coupon with this code already exists"
      );
    }
    throw error;
  }
};

export const getAllCoupons = async (query: Record<string, unknown> = {}): Promise<TCouponListResponse> => {
  const { page = 1, limit = 10, search, status, courseId } = query;
  
  // Build filter object
  const filter: any = { isDeleted: false };
  
  if (status) {
    filter.status = status;
  }
  
  if (courseId) {
    filter.courseId = courseId;
  }
  
  if (search) {
    filter.$or = [
      { cuponCode: { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate pagination
  const skip = (Number(page) - 1) * Number(limit);
  
  // Get coupons with course information
  const coupons = await Coupon.find(filter)
    .populate('courseId', 'title price originalPrice')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  // Get total count
  const total = await Coupon.countDocuments(filter);
  const totalPages = Math.ceil(total / Number(limit));

  // Calculate statistics
  const stats = await calculateCouponStats();

  return {
    coupons,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
    stats,
  };
};

export const getCouponById = async (couponId: string) => {
  const coupon = await Coupon.findOne({
    _id: couponId,
    isDeleted: false,
  }).populate('courseId', 'title price originalPrice');
  
  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, COUPON_MESSAGES.NOT_FOUND);
  }

  return coupon;
};

export const getCouponByCode = async (cuponCode: string) => {
  const coupon = await Coupon.findOne({
    cuponCode: cuponCode.toUpperCase(),
    isDeleted: false,
  }).populate('courseId', 'title price originalPrice');
  
  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, COUPON_MESSAGES.NOT_FOUND);
  }

  return coupon;
};

export const updateCoupon = async (couponId: string, updateData: TCouponUpdateData) => {
  try {
    // Check if coupon exists
    const existingCoupon = await Coupon.findById(couponId);
    if (!existingCoupon || existingCoupon.isDeleted) {
      throw new AppError(httpStatus.NOT_FOUND, COUPON_MESSAGES.NOT_FOUND);
    }

    // Check if course exists (if courseId is being updated)
    if (updateData.courseId) {
      const course = await Course.findById(updateData.courseId);
      if (!course || course.isDeleted) {
        throw new AppError(httpStatus.NOT_FOUND, "Course not found");
      }
    }

    // Validate discount value based on type
    if (updateData.discountType === 'percentage' && updateData.discountValue && updateData.discountValue > 100) {
      throw new AppError(httpStatus.BAD_REQUEST, "Percentage discount cannot exceed 100%");
    }

    // Convert expiryDate to Date object if it's a string
    if (updateData.expiryDate && typeof updateData.expiryDate === 'string') {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    // Convert cuponCode to uppercase if provided
    if (updateData.cuponCode) {
      updateData.cuponCode = updateData.cuponCode.toUpperCase();
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      updateData,
      { new: true, runValidators: true }
    ).populate('courseId', 'title price originalPrice');

    if (!updatedCoupon) {
      throw new AppError(httpStatus.NOT_FOUND, COUPON_MESSAGES.NOT_FOUND);
    }

    return updatedCoupon;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Coupon with this code already exists"
      );
    }
    throw error;
  }
};

export const updateCouponStatus = async (couponId: string, status: string) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon || coupon.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, COUPON_MESSAGES.NOT_FOUND);
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    { status },
    { new: true, runValidators: true }
  ).populate('courseId', 'title price originalPrice');

  return updatedCoupon;
};

export const deleteCoupon = async (couponId: string) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon || coupon.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, COUPON_MESSAGES.NOT_FOUND);
  }

  // Soft delete
  await Coupon.findByIdAndUpdate(couponId, { isDeleted: true });

  return { message: COUPON_MESSAGES.DELETED };
};

export const useCoupon = async (payload: TCouponUsageData) => {
  const { cuponCode, userId, courseId } = payload;

  // Get coupon
  const coupon = await Coupon.findOne({
    cuponCode: cuponCode.toUpperCase(),
    isDeleted: false,
  });

  if (!coupon) {
    throw new AppError(httpStatus.NOT_FOUND, COUPON_MESSAGES.NOT_FOUND);
  }

  // Check if coupon is active
  if (coupon.status !== 'active') {
    throw new AppError(httpStatus.BAD_REQUEST, COUPON_MESSAGES.INACTIVE);
  }

  // Check if coupon is expired
  if (coupon.expiryDate < new Date()) {
    // Update coupon status to expired
    await Coupon.findByIdAndUpdate(coupon._id, { status: 'expired' });
    throw new AppError(httpStatus.BAD_REQUEST, COUPON_MESSAGES.EXPIRED);
  }

  // Check if coupon is for the correct course
  if (coupon.courseId.toString() !== courseId) {
    throw new AppError(httpStatus.BAD_REQUEST, COUPON_MESSAGES.INVALID_COURSE);
  }

  // Check usage limit
  if (coupon.usageLimit && coupon.totalUse >= coupon.usageLimit) {
    throw new AppError(httpStatus.BAD_REQUEST, COUPON_MESSAGES.USAGE_LIMIT_REACHED);
  }

  // Get user and check if they already used this coupon
  const user = await Student.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.usedCoupons && user.usedCoupons.includes(coupon._id.toString())) {
    throw new AppError(httpStatus.BAD_REQUEST, COUPON_MESSAGES.ALREADY_USED);
  }

  // Get course information
  const course = await Course.findById(courseId);
  if (!course) {
    throw new AppError(httpStatus.NOT_FOUND, "Course not found");
  }

  // Calculate discount amount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (course.price * coupon.discountValue) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  // Ensure discount doesn't exceed course price
  if (discountAmount > course.price) {
    discountAmount = course.price;
  }

  // Update coupon usage
  await Coupon.findByIdAndUpdate(coupon._id, {
    $inc: { totalUse: 1 }
  });

  // Add coupon to user's used coupons
  await Student.findByIdAndUpdate(userId, {
    $addToSet: { usedCoupons: coupon._id }
  });

  return {
    message: COUPON_MESSAGES.APPLIED,
    coupon: {
      code: coupon.cuponCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      originalPrice: course.price,
      finalPrice: course.price - discountAmount,
    },
  };
};

const calculateCouponStats = async (): Promise<TCouponStats> => {
  const totalCoupons = await Coupon.countDocuments({ isDeleted: false });
  const activeCoupons = await Coupon.countDocuments({ status: 'active', isDeleted: false });
  const inactiveCoupons = await Coupon.countDocuments({ status: 'inactive', isDeleted: false });
  const expiredCoupons = await Coupon.countDocuments({ status: 'expired', isDeleted: false });
  
  const totalUsageResult = await Coupon.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: null, totalUsage: { $sum: '$totalUse' } } }
  ]);
  
  const totalUsage = totalUsageResult.length > 0 ? totalUsageResult[0].totalUsage : 0;
  
  // Calculate customer savings (simplified calculation)
  const customerSavingsResult = await Coupon.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course'
      }
    },
    { $unwind: '$course' },
    {
      $addFields: {
        savings: {
          $cond: {
            if: { $eq: ['$discountType', 'percentage'] },
            then: { $multiply: [{ $divide: ['$course.price', 100] }, '$discountValue', '$totalUse'] },
            else: { $multiply: ['$discountValue', '$totalUse'] }
          }
        }
      }
    },
    { $group: { _id: null, totalSavings: { $sum: '$savings' } } }
  ]);
  
  const customerSavings = customerSavingsResult.length > 0 ? customerSavingsResult[0].totalSavings : 0;
  
  // Calculate usage efficiency
  const usageEfficiency = totalCoupons > 0 ? (totalUsage / totalCoupons) : 0;

  return {
    totalCoupons,
    activeCoupons,
    inactiveCoupons,
    expiredCoupons,
    totalUsage,
    customerSavings,
    usageEfficiency: Math.round(usageEfficiency * 100) / 100,
  };
};

export const CouponServices = {
  createCoupon,
  getAllCoupons,
  getCouponById,
  getCouponByCode,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
  useCoupon,
};
