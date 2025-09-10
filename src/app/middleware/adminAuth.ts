import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { verifyAccessToken } from '../../utils/jwt';
import { Student as User } from '../modules/student/student.model';

const adminAuth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Debug: Log all cookies and headers
      console.log('[ADMIN AUTH] Request cookies:', (req as any).cookies);
      console.log('[ADMIN AUTH] Authorization header:', req.headers.authorization);
      console.log('[ADMIN AUTH] Request URL:', req.url);
      console.log('[ADMIN AUTH] Request method:', req.method);
      
      // Check for access token in multiple cookie names and Authorization header
      const tokenFromCookie = (req as any).cookies?.accessToken || 
                            (req as any).cookies?.accessToken_localhost || 
                            (req as any).cookies?.accessToken_vercel;
      const tokenFromHeader = req.headers.authorization?.replace('Bearer ', '');
      const token = tokenFromCookie || tokenFromHeader;
      
      console.log('[ADMIN AUTH] Token from cookie:', tokenFromCookie ? 'Found' : 'Not found');
      console.log('[ADMIN AUTH] Token from header:', tokenFromHeader ? 'Found' : 'Not found');
      console.log('[ADMIN AUTH] Final token:', token ? 'Found' : 'Not found');
      
      if (!token) {
        console.log('[ADMIN AUTH] ❌ No token found');
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Admin access token is required',
          debug: {
            cookies: Object.keys((req as any).cookies || {}),
            hasAuthHeader: !!req.headers.authorization,
            url: req.url,
            method: req.method
          }
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
