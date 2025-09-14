export type TDiscountType = 'percentage' | 'amount';

export type TCouponStatus = 'active' | 'inactive' | 'expired';

export type TCoupon = {
  cuponCode: string;
  discountType: TDiscountType;
  discountValue: number;
  usageLimit?: number; // Optional, if not provided then unlimited
  totalUse: number;
  expiryDate: Date;
  courseId: string;
  status: TCouponStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
};

export type TCouponCreateData = {
  cuponCode: string;
  discountType: TDiscountType;
  discountValue: number;
  usageLimit?: number;
  expiryDate: Date | string;
  courseId: string;
  status?: TCouponStatus;
};

export type TCouponUpdateData = {
  cuponCode?: string;
  discountType?: TDiscountType;
  discountValue?: number;
  usageLimit?: number;
  expiryDate?: Date | string;
  courseId?: string;
  status?: TCouponStatus;
};

export type TCouponUsageData = {
  cuponCode: string;
  userId: string;
  courseId: string;
};

export type TCouponStats = {
  totalCoupons: number;
  activeCoupons: number;
  inactiveCoupons: number;
  expiredCoupons: number;
  totalUsage: number;
  customerSavings: number;
  usageEfficiency: number;
};

export type TCouponListResponse = {
  coupons: TCoupon[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: TCouponStats;
};
