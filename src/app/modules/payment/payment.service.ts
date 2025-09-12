import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Payment } from './payment.model';
import { TPayment } from './payment.interface';
import { Student as User } from '../student/student.model';
import { sendPaymentAcceptedEmail, sendPaymentRejectedEmail, sendPaymentAcceptedNotification, sendPaymentRejectedNotification } from '../../../utils/emailService';

export const createPaymentRequest = async (userId: string, payload: Omit<TPayment, 'userId' | 'status' | 'accept_admin_id' | 'createdAt' | 'updatedAt'>) => {
  // Check if student already has this course in activeCourses
  const student = await User.findById(userId).select('activeCourses');
  if (!student) {
    throw new AppError(httpStatus.NOT_FOUND, 'Student not found');
  }

  // Check if course is already in student's activeCourses
  if (student.activeCourses && student.activeCourses.includes(payload.courseId as any)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You already have access to this course');
  }

  // Check if there's already a pending payment request for this course
  const existingPendingPayment = await Payment.findOne({
    userId,
    courseId: payload.courseId,
    status: 'pending'
  });

  if (existingPendingPayment) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You already have a pending payment request for this course');
  }

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

  // Send notification (email and SMS) to student
  try {
    const student = payment.userId as any;
    const course = payment.courseId as any;
    const studentEmail = student?.email;
    const studentPhone = student?.phone;
    
    if (studentEmail || studentPhone) {
      console.log(`[PAYMENT SERVICE] Sending ${status} notification to student:`, {
        email: studentEmail || 'Not provided',
        phone: studentPhone || 'Not provided'
      });
      
      if (status === 'accepted') {
        const notificationResult = await sendPaymentAcceptedNotification(
          studentEmail,
          studentPhone,
          student.fullName || 'Student',
          course?.title || 'Course',
          course?.price || payment.price
        );
        
        if (notificationResult.email?.success) {
          console.log(`[PAYMENT SERVICE] ✅ Payment accepted email sent successfully to ${studentEmail}`);
          console.log(`[PAYMENT SERVICE] Email Message ID: ${notificationResult.email.messageId}`);
        } else if (notificationResult.email?.error) {
          console.log(`[PAYMENT SERVICE] ❌ Failed to send payment accepted email to ${studentEmail}`);
          console.log(`[PAYMENT SERVICE] Email error:`, notificationResult.email.error);
        }
        
        if (notificationResult.sms?.success) {
          console.log(`[PAYMENT SERVICE] ✅ Payment accepted SMS sent successfully to ${studentPhone}`);
          console.log(`[PAYMENT SERVICE] SMS Message ID: ${notificationResult.sms.messageId}`);
        } else if (notificationResult.sms?.error) {
          console.log(`[PAYMENT SERVICE] ❌ Failed to send payment accepted SMS to ${studentPhone}`);
          console.log(`[PAYMENT SERVICE] SMS error:`, notificationResult.sms.error);
        }
      } else if (status === 'rejected') {
        const notificationResult = await sendPaymentRejectedNotification(
          studentEmail,
          studentPhone,
          student.fullName || 'Student',
          course?.title || 'Course',
          course?.price || payment.price,
          reason
        );
        
        if (notificationResult.email?.success) {
          console.log(`[PAYMENT SERVICE] ✅ Payment rejected email sent successfully to ${studentEmail}`);
          console.log(`[PAYMENT SERVICE] Email Message ID: ${notificationResult.email.messageId}`);
        } else if (notificationResult.email?.error) {
          console.log(`[PAYMENT SERVICE] ❌ Failed to send payment rejected email to ${studentEmail}`);
          console.log(`[PAYMENT SERVICE] Email error:`, notificationResult.email.error);
        }
        
        if (notificationResult.sms?.success) {
          console.log(`[PAYMENT SERVICE] ✅ Payment rejected SMS sent successfully to ${studentPhone}`);
          console.log(`[PAYMENT SERVICE] SMS Message ID: ${notificationResult.sms.messageId}`);
        } else if (notificationResult.sms?.error) {
          console.log(`[PAYMENT SERVICE] ❌ Failed to send payment rejected SMS to ${studentPhone}`);
          console.log(`[PAYMENT SERVICE] SMS error:`, notificationResult.sms.error);
        }
      }
    } else {
      console.log(`[PAYMENT SERVICE] ⚠️ No email or phone found for student, skipping notifications`);
    }
  } catch (notificationError: any) {
    console.log(`[PAYMENT SERVICE] ❌ Error sending payment notifications:`, notificationError.message);
    // Don't throw error - payment status update should succeed even if notifications fail
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


