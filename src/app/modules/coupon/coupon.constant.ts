export const COUPON_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
} as const;

export const DISCOUNT_TYPE = {
  PERCENTAGE: 'percentage',
  AMOUNT: 'amount',
} as const;

export const COUPON_MESSAGES = {
  CREATED: 'Coupon created successfully',
  UPDATED: 'Coupon updated successfully',
  DELETED: 'Coupon deleted successfully',
  STATUS_UPDATED: 'Coupon status updated successfully',
  APPLIED: 'Coupon applied successfully',
  NOT_FOUND: 'Coupon not found',
  ALREADY_USED: 'You have already used this coupon',
  EXPIRED: 'Coupon has expired',
  INACTIVE: 'Coupon is inactive',
  USAGE_LIMIT_REACHED: 'Coupon usage limit reached',
  INVALID_COURSE: 'Coupon is not valid for this course',
  INVALID_DISCOUNT_VALUE: 'Invalid discount value',
} as const;

export const COUPON_VALIDATION = {
  MIN_DISCOUNT_VALUE: 0,
  MAX_PERCENTAGE: 100,
  MAX_AMOUNT: 999999,
  MIN_USAGE_LIMIT: 1,
  MAX_USAGE_LIMIT: 999999,
} as const;
