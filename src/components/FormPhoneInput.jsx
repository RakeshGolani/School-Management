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
                value={formattedValue}
                forceDialCode
                disableCountryGuess
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
                    buttonProps: {
                        disabled: true,
                        tabIndex: -1,
                        style: {
                            pointerEvents: 'none',
                            cursor: 'default'
                        }
                    },
                    buttonStyle: {
                        height: '44px',
                        borderRadius: '12px 0 0 12px',
                        border: error ? '1px solid #f43f5e' : '1px solid #e2e8f0',
                        borderRight: 'none',
                        backgroundColor: '#f8fafc',
                        padding: '0 12px',
                        pointerEvents: 'none',
                        cursor: 'default'
                    },
                    dropdownArrowStyleProps: {
                        style: {
                            display: 'none'
                        }
                    },
                    dropdownStyleProps: {
                        style: {
                            display: 'none'
                        }
                    }
                }}
            />
            {error && <p className="text-xs text-rose-500 font-medium pl-1">{error}</p>}
        </div>
    );
};

export default FormPhoneInput;
