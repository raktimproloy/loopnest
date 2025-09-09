import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Payment } from './payment.model';
import { TPayment } from './payment.interface';
import { Student as User } from '../student/student.model';

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
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
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
    Payment.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Payment.countDocuments({ userId }),
  ]);

  return {
    meta: { page, limit, total, totalPage: Math.ceil(total / limit) },
    data: items,
  };
};

export const getPaymentById = async (userId: string, id: string) => {
  const payment = await Payment.findOne({ _id: id, userId });
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');
  return payment;
};

export const updatePaymentStatus = async (adminId: string, id: string, status: 'accepted' | 'rejected') => {
  const payment = await Payment.findById(id);
  if (!payment) throw new AppError(httpStatus.NOT_FOUND, 'Payment not found');

  payment.status = status;
  if (status === 'accepted') payment.accept_admin_id = adminId;
  await payment.save();

  if (status === 'accepted') {
    // add course to user's activeCourses
    await User.updateOne({ _id: payment.userId }, { $addToSet: { activeCourses: payment.courseId } });
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


