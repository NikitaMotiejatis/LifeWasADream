import { useTranslation } from 'react-i18next';
import type { Reservation } from './types';
import { useState } from 'react';

type CustomerInfoSectionProps = {
  reservation: Reservation;
  handleChange: (field: keyof Reservation, value: any) => void;
};

export function CustomerInfoSection({
  reservation,
  handleChange,
}: CustomerInfoSectionProps) {
  const { t } = useTranslation();
  const [phoneError, setPhoneError] = useState<string>('');

  const handlePhoneChange = (value: string) => {
    let cleanedValue = value;

    if (cleanedValue.includes('+')) {
      const withoutPlus = cleanedValue.replace(/\+/g, '');
      cleanedValue = '+' + withoutPlus;
    }

    if (cleanedValue.startsWith('+')) {
      const afterPlus = cleanedValue.substring(1).replace(/\D/g, '');
      cleanedValue = '+' + afterPlus;
    } else {
      cleanedValue = cleanedValue.replace(/\D/g, '');
    }

    handleChange('customerPhone', cleanedValue);

    const digitsOnly = cleanedValue.replace(/\D/g, '');
    const hasValidPrefix =
      cleanedValue === '' ||
      cleanedValue.startsWith('+') ||
      /^\d/.test(cleanedValue);

    if (!cleanedValue) {
      setPhoneError(t('reservation.phoneRequired', 'Phone number is required'));
    } else if (!hasValidPrefix) {
      setPhoneError(
        t('reservation.invalidPrefix', 'Must start with + or a digit'),
      );
    } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      setPhoneError(
        t('reservation.invalidLength', 'Phone number must be 7-15 digits'),
      );
    } else {
      setPhoneError('');
    }
  };

  const handleNameChange = (value: string) => {
    const cleanedValue = value.replace(/[^a-zA-ZąčęėįšųūžĄČĘĖĮŠŲŪŽ\s-]/g, '');
    handleChange('customerName', cleanedValue);
  };

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h3 className="mb-3 text-lg font-semibold">
        {t('reservation.customerInfo', 'Customer Information')}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('reservation.customerName', 'Customer Name')} *
          </label>
          <input
            type="text"
            value={reservation.customerName}
            onChange={e => handleNameChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder={t('reservation.customerNamePlaceholder', 'John Smith')}
            required
          />
          {!reservation.customerName && (
            <p className="mt-1 text-sm text-red-600">
              {t('reservation.nameRequired', 'Name is required')}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t('reservation.customerPhone', 'Phone Number')} *
          </label>
          <input
            type="tel"
            value={reservation.customerPhone}
            onChange={e => handlePhoneChange(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 ${
              phoneError ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            placeholder={t(
              'reservation.customerPhonePlaceholder',
              '1234567890',
            )}
            required
          />
          {phoneError && (
            <p className="mt-1 text-sm text-red-600">{phoneError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
