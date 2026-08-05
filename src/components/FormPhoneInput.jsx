'use client';

import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const FormPhoneInput = ({ label, value, onChange, error, required, defaultCountry = 'in' }) => {
    // Ensure 10-digit Indian numbers default to +91 so it doesn't parse '98...' as Iran (+98)
    const formatInputValue = (val) => {
        if (!val) return '';
        const clean = val.toString().trim();
        if (clean.startsWith('+')) return clean;
        if (/^\d{10}$/.test(clean)) return `+91 ${clean}`;
        if (/^91\d{10}$/.test(clean)) return `+${clean}`;
        return clean;
    };

    const formattedValue = formatInputValue(value);

    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <PhoneInput
                defaultCountry={defaultCountry}
                preferredCountries={['in', 'us', 'gb', 'ae']}
                value={formattedValue}
                forceDialCode
                charAfterDialCode=" "
                prefix="+"
                onChange={(phone) => {
                    onChange(phone);
                }}
                className='w-full'
                inputStyle={{
                    width: '100%',
                    height: '44px',
                    fontSize: '14px',
                    borderRadius: '0 12px 12px 0',
                    border: error ? '1px solid #f43f5e' : '1px solid #e2e8f0',
                    borderLeft: 'none',
                    color: '#0f172a',
                    backgroundColor: '#f8fafc',
                    paddingLeft: '12px',
                    fontFamily: 'inherit',
                    outline: 'none'
                }}
                countrySelectorStyleProps={{
                    buttonStyle: {
                        height: '44px',
                        borderRadius: '12px 0 0 12px',
                        border: error ? '1px solid #f43f5e' : '1px solid #e2e8f0',
                        borderRight: 'none',
                        backgroundColor: '#f8fafc',
                        padding: '0 10px',
                    },
                    dropdownStyleProps: {
                        style: {
                            backgroundColor: '#ffffff',
                            color: '#0f172a',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                            scrollbarWidth: 'thin'
                        }
                    }
                }}
            />
            {error && <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>}
        </div>
    );
};

export default FormPhoneInput;
