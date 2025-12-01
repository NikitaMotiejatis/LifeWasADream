import { useState, ChangeEvent, useEffect } from 'react';

export function usePhoneValidation(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(false);

  useEffect(() => {
    setValue(initialValue);
    setError(false);
  }, [initialValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filtered = input
      .replace(/[^0-9+]/g, '')
      .replace(/\+/g, (_m, offset) => (offset === 0 ? '+' : ''))
      .slice(0, 16);

    setError(input !== filtered);
    setValue(filtered);
  };

  const reset = (newValue = '') => {
    setValue(newValue);
    setError(false);
  };

  return {
    value,
    error,
    handleChange,
    setValue,
    reset,
    isValid: value.trim().length > 0 && !error,
  };
}
