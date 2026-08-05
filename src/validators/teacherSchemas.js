import * as Yup from 'yup';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Yup Validation Schema for Teacher Creation & Edits
 */
export const teacherSchema = Yup.object().shape({
  name: Yup.string()
    .required('Teacher full name is required.')
    .min(2, 'Name must be at least 2 characters.'),
  email: Yup.string()
    .required('Email address is required.')
    .email('Must be a valid email address.'),
  phone: Yup.string()
    .required('Phone number is required.')
    .test('is-valid-phone', 'Please enter a valid phone number.', function (value) {
      if (!value) return false;
      const phoneNumber = parsePhoneNumberFromString(value.startsWith('+') ? value : '+' + value);
      return phoneNumber ? phoneNumber.isValid() : false;
    }),
  subject: Yup.string()
    .required('Primary teaching subject is required.'),
  qualification: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  class_assigned: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  gender: Yup.string()
    .required('Gender selection is required.'),
  employee_id: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  nfc_card_uid: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
});
