import { useState, ChangeEvent, useEffect } from 'react';

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