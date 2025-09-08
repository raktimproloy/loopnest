import { TJWTPayload } from '../app/modules/student/student.interface';

declare global {
  namespace Express {
    interface Request {
      user?: TJWTPayload;
      admin?: TJWTPayload;
    }
  }
}
