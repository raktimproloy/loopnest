import express from 'express';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { adminAuth } from '../../middleware/adminAuth';
import { PaymentValidation } from './payment.validation';
import { paymentController } from './payment.controller';

const router = express.Router();

// Student routes
router.post(
  '/',
  auth(),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  paymentController.createPayment
);
router.get('/me', auth(), paymentController.listMyPayments);
router.get('/me/:id', auth(), paymentController.getMyPayment);

// Admin routes
router.get('/', adminAuth(), paymentController.listPaymentsAdmin);
router.put('/:id/status', adminAuth(), validateRequest(PaymentValidation.updatePaymentStatusValidationSchema), paymentController.updatePaymentStatus);

export const PaymentRoutes = router;


