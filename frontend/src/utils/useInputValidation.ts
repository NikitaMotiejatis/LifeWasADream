import { useState, ChangeEvent, useEffect } from 'react';

const EMAIL_DB_REGEX =
  /^[^\.][a-zA-Z0-9\-.+]{0,62}[^\.]+@([^\-][a-zA-Z0-9\-]{0,61}[^\-]\.)+[^\-][a-zA-Z0-9\-]{0,61}[^\-]$/;
const PHONE_DB_REGEX = /^\+[0-9]{3,15}$/;

export const formatName = (value: string): string => {
  return value
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .replace(/'+/g, "'")
    .trimStart();
};

export const formatPhone = (value: string): string => {
  return value
    .replace(/[^0-9+]/g, '')
    .replace(/\+/g, (match, offset) => (offset === 0 ? '+' : ''))
    .slice(0, 16);
};

export const formatEmail = (value: string): string => {
  let result = value.replace(/\s+/g, '').replace(/[^a-zA-Z0-9@.+\-]/g, '');

  const atIndex = result.indexOf('@');
  if (atIndex !== -1) {
    result =
      result.slice(0, atIndex + 1) +
      result.slice(atIndex + 1).replace(/@/g, '');
  }

  return result.slice(0, 254);
};

function useInputValidation({
  initialValue = '',
  format,
}: {
  initialValue?: string;
  format: (value: string) => string;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(false);

  useEffect(() => {
    setValue(initialValue);
    setError(false);
  }, [initialValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filtered = format(input);
    setError(filtered !== input);
    setValue(filtered);
  };

  const reset = (newValue = '') => {
    setValue(newValue);
    setError(false);
  };

  const isValid = value.trim().length >= 0 && !error;

  return { value, error, handleChange, setValue, reset, isValid };
}

export const useNameValidation = (initialValue = '') =>
  useInputValidation({
    initialValue,
    format: formatName,
  });

export const usePhoneValidation = (initialValue = '') =>
  useInputValidation({
    initialValue,
    format: formatPhone,
  });

export const isPhoneValidForRequest = (phone: string): boolean => {
  return PHONE_DB_REGEX.test(phone);
};

export const useEmailValidation = (initialValue = '') =>
  useInputValidation({
    initialValue,
    format: formatEmail,
  });

export const isEmailValidForRequest = (email: string): boolean => {
  return EMAIL_DB_REGEX.test(email);
};
