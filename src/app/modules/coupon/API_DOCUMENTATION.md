# Coupon API Documentation

## Overview
This module provides comprehensive coupon code management functionality for both administrators and students.

## Features
- Admin can create, read, update, delete coupons
- Admin can change coupon status
- Students can use coupons with validation
- Comprehensive statistics and analytics
- Pagination support for coupon listings

## API Endpoints

### Admin Routes (Protected by adminAuth middleware)

#### 1. Create Coupon
```
POST /api/v1/coupon
```

**Request Body:**
```json
{
  "cuponCode": "SAVE20",
  "discountType": "percentage",
  "discountValue": 20,
  "usageLimit": 100,
  "expiryDate": "2024-12-31T23:59:59.000Z",
  "courseId": "64a1b2c3d4e5f6789abcdef0",
  "status": "active"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "_id": "...",
    "cuponCode": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "usageLimit": 100,
    "totalUse": 0,
    "expiryDate": "2024-12-31T23:59:59.000Z",
    "courseId": "64a1b2c3d4e5f6789abcdef0",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "isDeleted": false
  }
}
```

#### 2. Get All Coupons (with pagination and statistics)
```
GET /api/v1/coupon?page=1&limit=10&search=SAVE&status=active&courseId=64a1b2c3d4e5f6789abcdef0
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `search` (optional): Search by coupon code
- `status` (optional): Filter by status (active, inactive, expired)
- `courseId` (optional): Filter by course ID

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Coupons fetched successfully",
  "data": {
    "coupons": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    },
    "stats": {
      "totalCoupons": 25,
      "activeCoupons": 15,
      "inactiveCoupons": 5,
      "expiredCoupons": 5,
      "totalUsage": 150,
      "customerSavings": 2500.00,
      "usageEfficiency": 6.0
    }
  }
}
```

#### 3. Get Coupon by ID
```
GET /api/v1/coupon/:id
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Coupon fetched successfully",
  "data": {
    "_id": "...",
    "cuponCode": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "usageLimit": 100,
    "totalUse": 15,
    "expiryDate": "2024-12-31T23:59:59.000Z",
    "courseId": {
      "_id": "64a1b2c3d4e5f6789abcdef0",
      "title": "React Course",
      "price": 299,
      "originalPrice": 399
    },
    "status": "active",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "isDeleted": false
  }
}
```

#### 4. Update Coupon
```
PUT /api/v1/coupon/:id
```

**Request Body:**
```json
{
  "discountValue": 25,
  "usageLimit": 150,
  "expiryDate": "2024-12-31T23:59:59.000Z"
}
```

#### 5. Update Coupon Status
```
PATCH /api/v1/coupon/:id/status
```

**Request Body:**
```json
{
  "status": "inactive"
}
```

#### 6. Delete Coupon
```
DELETE /api/v1/coupon/:id
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Coupon deleted successfully",
  "data": null
}
```

### Student Routes (Protected by auth middleware)

#### 1. Use Coupon
```
POST /api/v1/coupon/use
```

**Request Body:**
```json
{
  "cuponCode": "SAVE20",
  "courseId": "64a1b2c3d4e5f6789abcdef0"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "discountAmount": 59.80,
    "originalPrice": 299,
    "finalPrice": 239.20
  }
}
```

### Public Routes

#### 1. Get Coupon by Code (Public)
```
GET /api/v1/coupon/code/:cuponCode
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Coupon details fetched successfully",
  "data": {
    "_id": "...",
    "cuponCode": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "usageLimit": 100,
    "totalUse": 15,
    "expiryDate": "2024-12-31T23:59:59.000Z",
    "courseId": {
      "_id": "64a1b2c3d4e5f6789abcdef0",
      "title": "React Course",
      "price": 299,
      "originalPrice": 399
    },
    "status": "active"
  }
}
```

## Data Models

### Coupon Model
```typescript
{
  cuponCode: string;           // Unique coupon code (uppercase)
  discountType: 'percentage' | 'amount';
  discountValue: number;       // Discount value (percentage or amount)
  usageLimit?: number;         // Optional usage limit (null = unlimited)
  totalUse: number;           // Total times used
  expiryDate: Date;           // Expiry date
  courseId: ObjectId;         // Reference to Course
  status: 'active' | 'inactive' | 'expired';
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
```

### Student Model Updates
```typescript
{
  // ... existing fields
  usedCoupons: ObjectId[];    // Array of used coupon IDs
}
```

## Business Logic

### Coupon Validation Rules
1. **Status Check**: Only active coupons can be used
2. **Expiry Check**: Expired coupons are automatically marked as expired
3. **Usage Limit**: Check if usage limit is reached
4. **Course Validation**: Coupon must be valid for the specific course
5. **User Validation**: User cannot use the same coupon twice

### Statistics Calculation
- **Total Coupons**: Count of all non-deleted coupons
- **Active Coupons**: Count of coupons with 'active' status
- **Inactive Coupons**: Count of coupons with 'inactive' status
- **Expired Coupons**: Count of coupons with 'expired' status
- **Total Usage**: Sum of all coupon usage counts
- **Customer Savings**: Calculated based on discount type and course prices
- **Usage Efficiency**: Average usage per coupon

### Error Handling
- Coupon not found
- Coupon already used by user
- Coupon expired
- Coupon inactive
- Usage limit reached
- Invalid course for coupon
- Invalid discount value

## Security Features
- Admin authentication required for management operations
- User authentication required for coupon usage
- Input validation using Zod schemas
- Soft delete for data integrity
- Automatic expiry date validation

## Usage Examples

### Frontend Integration
```javascript
// Use coupon
const useCoupon = async (cuponCode, courseId) => {
  const response = await fetch('/api/v1/coupon/use', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ cuponCode, courseId })
  });
  return response.json();
};

// Get coupon details
const getCouponDetails = async (cuponCode) => {
  const response = await fetch(`/api/v1/coupon/code/${cuponCode}`);
  return response.json();
};
```

This coupon system provides a complete solution for managing discount codes with proper validation, analytics, and user experience features.
