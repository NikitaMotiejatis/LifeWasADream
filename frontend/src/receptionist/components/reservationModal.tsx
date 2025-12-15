import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/global/contexts/currencyContext';
import {
  useNameValidation,
  usePhoneValidation,
} from '@/utils/useInputValidation';
import { formatDateTime } from '@/utils/formatDateTime';
import { Reservation } from './reservationList';
import { Service } from './editReservation/types';

type Props = {
  open: boolean;
  type: 'complete' | 'cancel' | 'refund' | 'cancel_refund' | 'edit';
  reservation: Reservation | null;
  service?: Service;
  onClose: () => void;
  onConfirm: (refundData?: {
    name: string;
    phone: string;
    email: string;
    reason: string;
  }) => void;
};

export default function ReservationModal({
  open,
  type,
  reservation,
  service,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const name = useNameValidation(reservation?.customerName ?? '');
  const phone = usePhoneValidation(reservation?.customerPhone ?? '');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open && reservation) {
      name.reset(reservation.customerName || '');
      phone.reset(reservation.customerPhone || '');
      setEmail('');
      setReason('');
    }
    if (!open) {
      name.reset();
      phone.reset();
      setEmail('');
      setReason('');
    }
  }, [open, reservation]);

  if (!open || !reservation) return null;

  const servicePrice = service?.price ?? 0;

  const isRefundInvalid =
    type === 'refund' && (!name.isValid || !phone.isValid || !reason.trim());

  const handleConfirm = () => {
    if (type === 'refund') {
      if (isRefundInvalid) return;

      onConfirm({
        name: name.value.trim(),
        phone: phone.value.trim(),
        email: email.trim(),
        reason: reason.trim(),
      });
    } else {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
        <h3 className="mb-5 text-xl font-bold text-gray-900">
          {t(`reservations.modal.title.${type}`)} #{reservation.id}
        </h3>

        <div className="flex justify-evenly text-sm text-gray-700">
          <p className="font-medium">{reservation.customerName}</p>
          <p className="text-gray-600">{reservation.customerPhone}</p>
          <p className="text-gray-600">
            {formatDateTime(reservation.datetime)}
          </p>
        </div>

        {(type === 'complete' || type === 'refund' || type === 'edit') && (
          <div className="mt-6 mb-6 rounded-xl bg-blue-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                {t('reservations.modal.totalAmount')}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(servicePrice)}
              </span>
            </div>
          </div>
        )}

        {type === 'refund' && (
          <div className="mb-6 space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('reservations.modal.refund.name')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name.value}
                onChange={name.handleChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                  name.error
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder={t('reservations.modal.refund.namePlaceholder')}
              />
              {name.error && (
                <p className="animate-in fade-in mt-1 text-xs text-red-600 duration-200">
                  {t('validation.name')}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('reservations.modal.refund.phone')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone.value}
                onChange={phone.handleChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                  phone.error
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder={t('reservations.modal.refund.phonePlaceholder')}
              />
              {phone.error && (
                <p className="animate-in fade-in mt-1 text-xs text-red-600 duration-200">
                  {t('validation.phone')}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('reservations.modal.refund.email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder={t('reservations.modal.refund.emailPlaceholder')}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('reservations.modal.refund.reason')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder={t('reservations.modal.refund.reasonPlaceholder')}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-400 py-2 text-xs font-medium transition hover:bg-gray-100"
          >
            {t('common.cancel')}
          </button>

           <button
             onClick={handleConfirm}
             disabled={isRefundInvalid}
            className={`flex-1 rounded-lg py-2 text-xs font-medium text-white transition ${type === 'complete' || type === 'edit' ? 'bg-blue-600 hover:bg-blue-700' : ''} ${type === 'refund' ? 'bg-purple-600 hover:bg-purple-700' : ''} ${type === 'cancel' || type === 'cancel_refund' ? 'bg-red-600 hover:bg-red-700' : ''} disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200 disabled:opacity-60`}
           >
             {t(`reservations.modal.confirm.${type}`)}
           </button>
        </div>
      </div>
    </div>
  );
}
