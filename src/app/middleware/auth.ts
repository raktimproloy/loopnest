import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../errors/AppError';
import { verifyAccessToken } from '../../utils/jwt';
import { Student } from '../modules/student/student.model';

const auth = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get token from header
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Access token is required',
          errorSources: [{ path: 'authorization', message: 'Access token is required' }]
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
          errorSources: [{ path: 'authorization', message: 'Invalid or expired token' }]
        });
      }

      // Check if the token is for student (has userId property)
      if (!('userId' in decoded)) {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid token',
          errorSources: [{ path: 'authorization', message: 'Invalid token' }]
        });
      }

      // Check if student exists and is active
      const student = await Student.findById(decoded.userId);
      if (!student || student.isDeleted || student.status !== 'active') {
        return res.status(httpStatus.UNAUTHORIZED).json({
          success: false,
          message: 'Invalid token',
          errorSources: [{ path: 'authorization', message: 'Invalid token' }]
        });
      }

      // Add user info to request
      req.user = {
        userId: student._id.toString(),
        email: student.email,
        registrationType: student.registrationType,
      };

      next();
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Authentication failed',
        errorSources: [{ path: 'auth', message: 'Authentication failed' }]
      });
    }
  };
};

export default auth;
