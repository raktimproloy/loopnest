import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Payment } from './payment.model';
import { TPayment } from './payment.interface';
import { Student as User } from '../student/student.model';
import { sendPaymentAcceptedEmail, sendPaymentRejectedEmail } from '../../../utils/emailService';

export const createPaymentRequest = async (userId: string, payload: Omit<TPayment, 'userId' | 'status' | 'accept_admin_id' | 'createdAt' | 'updatedAt'>) => {
  const doc = await Payment.create({
    ...payload,
    userId,
    status: 'pending',
  });
  return doc;
};

export const listPaymentsForAdmin = async (query: any) => {
  const filter: any = {};
  if (query.userId) filter.userId = query.userId;
  if (query.courseId) filter.courseId = query.courseId;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.status) filter.status = query.status;

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId')
      .populate('courseId'),
    Payment.countDocuments(filter),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: items,
  };
};

export const listPaymentsForUser = async (userId: string, query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Payment.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId')
      .populate('courseId'),
    Payment.countDocuments({ userId }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: items,
  };
};

export const getPaymentById = async (userId: string, id: string) => {
  const payment = await Payment.findOne({ _id: id, userId })
    .populate('userId')
    .populate('courseId');
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  return payment;
};

export const updatePaymentStatus = async (adminId: string, id: string, status: 'accepted' | 'rejected', reason?: string) => {
  const payment = await Payment.findById(id)
    .populate('userId', 'fullName email')
    .populate('courseId', 'title price');
  
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');

  payment.status = status;
  if (status === 'accepted') payment.accept_admin_id = adminId;
  await payment.save();

  if (status === 'accepted') {
    // add course to user's activeCourses
    await User.updateOne({ _id: payment.userId }, { $addToSet: { activeCourses: payment.courseId } });
  }

  // Send email notification to student
  try {
    const student = payment.userId as any;
    const course = payment.courseId as any;
    
    if (student?.email) {
      console.log(`[PAYMENT SERVICE] Sending ${status} email notification to student: ${student.email}`);
      
      if (status === 'accepted') {
        const emailResult = await sendPaymentAcceptedEmail(
          student.email,
          student.fullName || 'Student',
          course?.title || 'Course',
          course?.price || payment.price
        );
        
        if (emailResult.success) {
          console.log(`[PAYMENT SERVICE] ✅ Payment accepted email sent successfully to ${student.email}`);
          console.log(`[PAYMENT SERVICE] Message ID: ${emailResult.messageId}`);
        } else {
          console.log(`[PAYMENT SERVICE] ❌ Failed to send payment accepted email to ${student.email}`);
          console.log(`[PAYMENT SERVICE] Email error:`, emailResult.error);
        }
      } else if (status === 'rejected') {
        const emailResult = await sendPaymentRejectedEmail(
          student.email,
          student.fullName || 'Student',
          course?.title || 'Course',
          course?.price || payment.price,
          reason
        );
        
        if (emailResult.success) {
          console.log(`[PAYMENT SERVICE] ✅ Payment rejected email sent successfully to ${student.email}`);
          console.log(`[PAYMENT SERVICE] Message ID: ${emailResult.messageId}`);
        } else {
          console.log(`[PAYMENT SERVICE] ❌ Failed to send payment rejected email to ${student.email}`);
          console.log(`[PAYMENT SERVICE] Email error:`, emailResult.error);
        }
      }
    } else {
      console.log(`[PAYMENT SERVICE] ⚠️ No email found for student, skipping email notification`);
    }
  } catch (emailError: any) {
    console.log(`[PAYMENT SERVICE] ❌ Error sending payment notification email:`, emailError.message);
    // Don't throw error - payment status update should succeed even if email fails
  }

  return payment;
};

export const PaymentServices = {
  createPaymentRequest,
  listPaymentsForAdmin,
  listPaymentsForUser,
  getPaymentById,
  updatePaymentStatus,
};


