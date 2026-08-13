import * as Yup from 'yup';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Yup Validation Schema for Student Admission & Edits
 */
export const studentSchema = Yup.object().shape({
  first_name: Yup.string()
    .required('First name is required.')
    .min(2, 'First name must be at least 2 characters.'),
  last_name: Yup.string()
    .required('Last name is required.')
    .min(2, 'Last name must be at least 2 characters.'),
  admission_number: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  roll_number: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  grade: Yup.string()
    .required('Grade / Class assignment is required.'),
  section: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  gender: Yup.string()
    .required('Gender selection is required.'),
  dob: Yup.date()
    .required('Date of birth is required.')
    .typeError('Please enter a valid date of birth.'),
  guardian_name: Yup.string()
    .required('Guardian name is required.'),
  guardian_address: Yup.string()
    .required('Guardian address is required.'),
  guardian_email: Yup.string()
    .required('Guardian email is required.')
    .email('Must be a valid email address.'),
  guardian_phone: Yup.string()
    .required('Guardian phone is required.')
    .test('is-valid-phone', 'Please enter a valid phone number.', function (value) {
      if (!value) return false;
      // The value will have a '+' since we prepend it in onChange
      const phoneNumber = parsePhoneNumberFromString(value);
      return phoneNumber ? phoneNumber.isValid() : false;
    }),
  alternate_phone: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
    .test('is-valid-alternate-phone', 'Please enter a valid phone number.', function (value) {
      if (!value) return true; // It's optional
      
      const phoneNumber = parsePhoneNumberFromString(value.startsWith('+') ? value : '+' + value);
      
      // If the parsed number is undefined, it might just be the dial code (e.g. "+91")
      if (!phoneNumber) {
        // If length is small (dial code only), treat as empty/optional
        if (value.length <= 5) return true; 
        return false;
      }
      
      // If it parsed successfully but has no national number (also just dial code)
      if (!phoneNumber.nationalNumber) {
        return true;
      }

      return phoneNumber.isValid();
    }),
  nfc_card_uid: Yup.string()
    .nullable()
    .transform((value) => (value === '' ? null : value))
});
