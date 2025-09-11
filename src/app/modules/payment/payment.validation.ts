import { z } from 'zod';

const createPaymentValidationSchema = z.object({
  body: z.object({
    courseId: z.string().min(1, 'Course Id is required'),
    paymentType: z.string().min(1, 'Payment Type is required'),
    paymentMethod: z.string().min(1, 'Payment Method is required'),
    price: z.number().min(0),
    transaction_id: z.string().optional(),
    send_number: z.string().optional(),
    account_name: z.string().optional(),
    bank_name: z.string().optional(),
    account_number: z.string().optional(),
  }),
  cookies: z.object({}).optional(),
});

const updatePaymentStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(['accepted', 'rejected']),
    reason: z.string().optional(),
  }),
  cookies: z.object({}).optional(),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
  updatePaymentStatusValidationSchema,
};


