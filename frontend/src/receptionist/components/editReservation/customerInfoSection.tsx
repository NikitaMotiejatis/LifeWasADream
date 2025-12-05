import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Reservation } from './types';

type CustomerInfoSectionProps = {
  reservation: Reservation;
  handleChange: (field: keyof Reservation, value: any) => void;
};

export function CustomerInfoSection({
  reservation,
  handleChange,
}: CustomerInfoSectionProps) {
  const { t } = useTranslation();

  const formatName = (value: string): string => {
    return value
      .replace(/[^\p{L}\s'-]/gu, '')
      .replace(/\s+/g, ' ')
      .replace(/-+/g, '-')
      .replace(/'+/g, "'")
      .trimStart();
  };

  const formatPhone = (value: string): string => {
    return value
      .replace(/[^0-9+]/g, '')
      .replace(/\+/g, (match, offset) => (offset === 0 ? '+' : ''))
      .slice(0, 16);
  };

  const [nameValue, setNameValue] = useState(reservation.customerName || '');
  const [phoneValue, setPhoneValue] = useState(reservation.customerPhone || '');
  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  useEffect(() => {
    if (reservation.customerName !== undefined) {
      setNameValue(reservation.customerName);
    }
  }, [reservation.customerName]);

  useEffect(() => {
    if (reservation.customerPhone !== undefined) {
      setPhoneValue(reservation.customerPhone);
    }
  }, [reservation.customerPhone]);

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filtered = formatName(input);
    
    setNameError(filtered !== input);
    setNameValue(filtered);
    handleChange('customerName', filtered);
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filtered = formatPhone(input);
    
    setPhoneError(filtered !== input);
    setPhoneValue(filtered);
    handleChange('customerPhone', filtered);
  };

  const isPhoneValidLength = phoneValue.replace('+', '').length >= 6 && phoneValue.replace('+', '').length <= 15;

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">
        {t('reservation.customerInfo')}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('reservation.customerName')} *
          </label>
          <input
            type="text"
            value={nameValue}
            onChange={handleNameInputChange}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none ${
              nameError
                ? 'border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder={t('reservation.customerNamePlaceholder')}
            required
          />
          {nameError && (
            <p className="animate-fade-in mt-1 text-sm text-red-600">
              {t('validation.name')}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('reservation.customerPhone')} *
          </label>
          <input
            type="tel"
            value={phoneValue}
            onChange={handlePhoneInputChange}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none ${
              phoneError
                ? 'border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder={t('reservation.customerPhonePlaceholder')}
            required
          />
          {phoneError && (
            <p className="animate-fade-in mt-1 text-sm text-red-600">
              {t('validation.phone')}
            </p>
          )}

        </div>
      </div>
    </div>
  );
}