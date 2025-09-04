import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { verifyAccessToken } from '../../utils/jwt';
import { Admin } from '../modules/admin/admin.model';

const adminAuth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from header
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Admin access token is required',
          errorSources: [{ path: 'authorization', message: 'Admin access token is required' }]
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
          errorSources: [{ path: 'authorization', message: 'Invalid or expired admin token' }]
        });
      }

      // Check if the token is for admin (has adminId property)
      if (!('adminId' in decoded)) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid admin token',
          errorSources: [{ path: 'authorization', message: 'Invalid admin token' }]
        });
      }

      // Check if admin exists and is active
      const admin = await Admin.findById(decoded.adminId);
      if (!admin || admin.isDeleted || !admin.isActive) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid admin token',
          errorSources: [{ path: 'authorization', message: 'Invalid admin token' }]
        });
      }

      // Add admin info to request
      req.admin = {
        adminId: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
      };

      next();
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Admin authentication failed',
        errorSources: [{ path: 'auth', message: 'Admin authentication failed' }]
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
        errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
      });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions',
        errorSources: [{ path: 'role', message: 'Insufficient permissions' }]
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
        errorSources: [{ path: 'auth', message: 'Admin not authenticated' }]
      });
    }

    if (!req.admin.permissions.includes(permission)) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'Insufficient permissions',
        errorSources: [{ path: 'permission', message: 'Insufficient permissions' }]
      });
    }

    next();
  };
};

export { adminAuth, requireRole, requirePermission };
