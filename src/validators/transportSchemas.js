import * as Yup from 'yup';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export const busSchema = Yup.object().shape({
  bus_number: Yup.string()
    .required('Bus number is required.')
    .min(2, 'Bus number must be at least 2 characters.'),
  driver_name: Yup.string()
    .required('Driver name is required.')
    .min(2, 'Driver name must be at least 2 characters.'),
  driver_phone: Yup.string()
    .required('Driver phone is required.')
    .test('is-valid-phone', 'Please enter a valid phone number.', function (value) {
      if (!value) return false;
      const phoneNumber = parsePhoneNumberFromString(value.startsWith('+') ? value : '+' + value);
      return phoneNumber ? phoneNumber.isValid() : false;
    }),
  route_id: Yup.string()
    .required('Assigned route is required.'),
  device_id: Yup.string().nullable()
});

export const routeSchema = Yup.object().shape({
  route_code: Yup.string()
    .required('Route code is required.')
    .min(2, 'Route code must be at least 2 characters.'),
  route_name: Yup.string()
    .required('Route name is required.')
    .min(2, 'Route name must be at least 2 characters.')
});

export const stopSchema = Yup.object().shape({
  route_id: Yup.string()
    .required('Bus route is required.'),
  stop_name: Yup.string()
    .required('Stop name is required.')
    .min(2, 'Stop name must be at least 2 characters.'),
  sequence: Yup.number()
    .required('Sequence number is required.')
    .min(1, 'Sequence must be at least 1.'),
  pickup_time: Yup.string().nullable(),
  drop_off_time: Yup.string().nullable()
});
