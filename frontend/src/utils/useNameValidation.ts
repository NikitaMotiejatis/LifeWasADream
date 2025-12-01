import { useState, ChangeEvent, useEffect } from 'react';

export function useNameValidation(initialValue = '') {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(false);

  useEffect(() => {
    setValue(initialValue);
    setError(false);
  }, [initialValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filtered = input
      .replace(/^[^\p{Letter}]*([\p{Letter}\s'-]*|).*$/gu, '$1')
      .replace(/[\s]+/gu, ' ')
      .replace(/[-]+/gu, '-')
      .replace(/[']+/gu, "\'");

    setError(filtered !== input);
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
