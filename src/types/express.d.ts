import { TJWTPayload } from '../app/modules/student/student.interface';
import { TAdminJWTPayload } from '../app/modules/admin/admin.interface';

declare global {
  namespace Express {
    interface Request {
      user?: TJWTPayload;
      admin?: TAdminJWTPayload;
    }
  }
}
