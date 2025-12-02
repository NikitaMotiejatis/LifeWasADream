import { useState, ChangeEvent, useEffect } from 'react';

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
    format: v =>
      v
        .replace(/[^\p{L}\s'-]/gu, '')
        .replace(/\s+/g, ' ')
        .replace(/-+/g, '-')
        .replace(/'+/g, "'")
        .trimStart(),
  });

export const usePhoneValidation = (initialValue = '') =>
  useInputValidation({
    initialValue,
    format: v =>
      v
        .replace(/[^0-9+]/g, '')
        .replace(/\+/g, (m, offset) => (offset === 0 ? '+' : ''))
        .slice(0, 16),
  });
