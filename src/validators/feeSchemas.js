import * as Yup from 'yup';

/**
 * Yup Validation Schema for Fee Category/Structure Templates
 */
export const feeCategorySchema = Yup.object().shape({
  name: Yup.string()
    .required('Fee structure name is required.')
    .min(3, 'Name must be at least 3 characters.'),
  amount: Yup.number()
    .typeError('Amount must be a valid number.')
    .required('Amount is required.')
    .positive('Amount must be a positive number.'),
  due_date: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  description: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
});

/**
 * Yup Validation Schema for Fee Allocations
 */
export const feeAllocationSchema = Yup.object().shape({
  fee_category_id: Yup.string()
    .required('Please select a fee structure.'),
  target_type: Yup.string()
    .required('Please choose a target assignment.')
    .oneOf(['class', 'student'], 'Invalid assignment target.'),
  class_id: Yup.string()
    .required('Please select a class.'),
  student_id: Yup.string()
    .nullable()
    .when('target_type', {
      is: 'student',
      then: () => Yup.string().required('Please select a student for allocation.'),
      otherwise: () => Yup.string().nullable()
    }),
  amount: Yup.number()
    .nullable()
    .typeError('Custom amount must be a number.')
    .transform((value) => (isNaN(value) || value === '' ? null : value))
    .positive('Custom amount must be positive if specified.'),
  due_date: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
});

/**
 * Yup Validation Schema for Payments Collection Form
 */
export const feePaymentSchema = Yup.object().shape({
  amount_paid: Yup.number()
    .typeError('Payment amount must be a number.')
    .required('Payment amount is required.')
    .positive('Payment amount must be greater than zero.'),
  payment_mode: Yup.string()
    .required('Payment channel is required.')
    .oneOf(['cash', 'card', 'bank_transfer', 'online', 'other'], 'Invalid payment channel.'),
  payment_date: Yup.string()
    .required('Payment date is required.'),
  reference_number: Yup.string()
    .nullable()
    .when('payment_mode', {
      is: (mode) => mode && mode !== 'cash',
      then: () => Yup.string().required('Reference number is required for card, transfer, or online payments.'),
      otherwise: () => Yup.string().nullable()
    }),
  remarks: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
});
