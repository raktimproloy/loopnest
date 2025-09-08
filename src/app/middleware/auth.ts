import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { verifyAccessToken } from '../../utils/jwt';
import { Student } from '../modules/student/student.model';

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Prefer cookie-based token; fallback to Authorization header
      const tokenFromCookie = (req as any).cookies?.accessToken as string | undefined;
      const tokenFromHeader = req.headers.authorization?.replace('Bearer ', '');
      const token = tokenFromCookie || tokenFromHeader;
      
      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Access token is required',
        });
      }

      // Verify token
      let decoded;
      try {
        decoded = verifyAccessToken(token);
      } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid or expired token',
        });
      }

      // Check if the token is for student (has userId property)
      if (!('userId' in decoded)) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid token',
        });
      }

      // Check if student exists and is active
      const student = await Student.findById(decoded.userId);
      if (!student || student.isDeleted || student.status !== 'active') {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid token',
        });
      }

      // Add user info to request
      req.user = {
        userId: student._id.toString(),
        email: student.email || '',
        registrationType: student.registrationType,
        role: student.role,
      };

      next();
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication failed',
      });
    }
  };
};

export default auth;
