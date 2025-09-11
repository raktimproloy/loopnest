import httpStatus from 'http-status';
import catchAsync from '../../../utils/catchAsync';
import sendResponse from '../../../utils/sendResponse';
import { PaymentServices } from './payment.service';

export const createPayment = catchAsync(async (req, res) => {
  const userId = req.user?.userId as string;
  const body = { ...req.body } as any;
  // Accept both snake_case and camelCase for bank fields
  if (!body.account_name && body.accountName) body.account_name = body.accountName;
  if (!body.bank_name && body.bankName) body.bank_name = body.bankName;
  if (!body.account_number && body.accountNumber) body.account_number = body.accountNumber;
  const result = await PaymentServices.createPaymentRequest(userId, body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Payment request created',
    data: result,
  });
});

export const listMyPayments = catchAsync(async (req, res) => {
  const userId = req.user?.userId as string;
  const result = await PaymentServices.listPaymentsForUser(userId, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments fetched',
    data: result,
  });
});

export const getMyPayment = catchAsync(async (req, res) => {
  const userId = req.user?.userId as string;
  const result = await PaymentServices.getPaymentById(userId, req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment fetched',
    data: result,
  });
});

export const listPaymentsAdmin = catchAsync(async (req, res) => {
  const result = await PaymentServices.listPaymentsForAdmin(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments fetched',
    data: result,
  });
});

export const updatePaymentStatus = catchAsync(async (req, res) => {
  const adminId = req.admin?.userId as string;
  const { status, reason } = req.body;
  const result = await PaymentServices.updatePaymentStatus(adminId, req.params.id, status, reason);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment status updated',
    data: result,
  });
});

export const paymentController = {
  createPayment,
  listMyPayments,
  getMyPayment,
  listPaymentsAdmin,
  updatePaymentStatus,
};


