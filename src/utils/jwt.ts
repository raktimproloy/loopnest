import jwt from 'jsonwebtoken';
import config from '../app/config';
import { TJWTPayload } from '../app/modules/student/student.interface';
import { TAdminJWTPayload } from '../app/modules/admin/admin.interface';

// Union type for both student and admin JWT payloads
type TJWTTokenPayload = TJWTPayload | TAdminJWTPayload;

export const createAccessToken = (payload: TJWTTokenPayload) => {
  return jwt.sign(payload, config.jwt_secret || 'default-secret', { expiresIn: '7d' });
};

export const createRefreshToken = (payload: TJWTTokenPayload) => {
  return jwt.sign(payload, config.jwt_refresh_secret || 'default-refresh-secret', { expiresIn: '30d' });
};

export const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret) as TJWTTokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const verifyAccessToken = (token: string) => {
  try {
    return verifyToken(token, config.jwt_secret || 'default-secret');
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    return verifyToken(token, config.jwt_refresh_secret || 'default-refresh-secret');
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};
