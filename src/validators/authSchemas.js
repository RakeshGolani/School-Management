import * as Yup from 'yup';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Yup Validation Schema for School Login
 */
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required('Email address is required.')
    .email('Please enter a valid email address.'),
  password: Yup.string()
    .required('Password is required.')
    .min(6, 'Password must be at least 6 characters.')
});

/**
 * Yup Validation Schema for School Profile Update
 */
export const schoolProfileSchema = Yup.object().shape({
  school_name: Yup.string()
    .required('School institution name is required.')
    .min(3, 'School name must be at least 3 characters.'),
  email: Yup.string()
    .required('Official email address is required.')
    .email('Please enter a valid email address.'),
  phone: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .test('is-valid-phone', 'Please enter a valid phone number.', function (value) {
      if (!value) return true;
      const phoneNumber = parsePhoneNumberFromString(value.startsWith('+') ? value : '+' + value);
      if (!phoneNumber) {
        if (value.length <= 5) return true;
        return false;
      }
      return phoneNumber.isValid();
    }),
  address: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
});

/**
 * Yup Validation Schema for Change Password
 */
export const changePasswordSchema = Yup.object().shape({
  current_password: Yup.string()
    .required('Current password is required.')
    .min(6, 'Current password must be at least 6 characters.'),
  new_password: Yup.string()
    .required('New password is required.')
    .min(6, 'New password must be at least 6 characters.'),
  confirm_password: Yup.string()
    .required('Please confirm your new password.')
    .oneOf([Yup.ref('new_password')], 'Confirm password does not match new password.')
});
