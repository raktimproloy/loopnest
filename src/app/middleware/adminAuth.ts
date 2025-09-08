import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { verifyAccessToken } from '../../utils/jwt';
import { Student as User } from '../modules/student/student.model';

const adminAuth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Prefer cookie-based token; fallback to Authorization header
      const tokenFromCookie = (req as any).cookies?.accessToken as string | undefined;
      const tokenFromHeader = req.headers.authorization?.replace('Bearer ', '');
      const token = tokenFromCookie || tokenFromHeader;
      
      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Admin access token is required',
        });
      }

      // Verify token
      let decoded;
      try {
        decoded = verifyAccessToken(token);
      } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired admin token',
        });
      }

      // Require userId in token; role will be verified from DB
      if (!('userId' in decoded)) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid admin token',
        });
      }

      // Check if user exists and is admin
      const user = await User.findById((decoded as any).userId);
      if (!user || user.isDeleted || user.status !== 'active' || user.role !== 'admin') {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid admin token',
        });
      }

      // Add admin info to request
      req.admin = {
        userId: user._id.toString(),
        email: user.email || '',
        role: user.role,
        registrationType: user.registrationType,
      } as any;

      next();
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Admin authentication failed',
      });
    }
  };
};

// Role-based authorization middleware
const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Admin not authenticated',
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Permission-based authorization middleware
const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Admin not authenticated',
      });
    }

    // if (!req.admin.permissions.includes(permission)) {
    //   return res.status(httpStatus.FORBIDDEN).json({
    //     success: false,
    //     message: 'Insufficient permissions',
    //   });
    // }

    next();
  };
};

export { adminAuth };
