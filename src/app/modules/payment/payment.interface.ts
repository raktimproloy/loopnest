export type TPayment = {
  userId: string;
  courseId: string;
  paymentType: 'mobile_banking' | 'bank';
  paymentMethod: 'bkash' | 'nagad' | 'bank';
  price: number;
  status: 'pending' | 'accepted' | 'rejected';
  transaction_id: string;
  send_number: string;
  accept_admin_id?: string;
  account_name?: string;
  bank_name?: string;
  account_number?: string;
  createdAt: Date;
  updatedAt: Date;
};

