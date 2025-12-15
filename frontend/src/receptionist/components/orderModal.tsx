import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/global/contexts/currencyContext';
import {
  isEmailValidForRequest,
  isPhoneValidForRequest,
  useEmailValidation,
  useNameValidation,
  usePhoneValidation,
} from '@/utils/useInputValidation';

type Order = {
  id: number;
  total: number;
};

type Props = {
  open: boolean;
  type: 'edit' | 'pay' | 'refund' | 'cancel';
  order: Order | null;
  onClose: () => void;
  onConfirm: (refundData?: {
    name: string;
    phone: string;
    email: string;
    reason: string;
  }) => void;
};

export default function OrderModal({
  open,
  type,
  order,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const name = useNameValidation();
  const phone = usePhoneValidation();
  const email = useEmailValidation();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) {
      name.reset();
      phone.reset();
      email.reset();
      setReason('');
    }
  }, [open]);

  if (!open || !order) return null;

  const isFormInvalid =
    type === 'refund' &&
    (!name.isValid ||
      !isPhoneValidForRequest(phone.value) ||
      !isEmailValidForRequest(email.value) ||
      !reason.trim());

  const handleConfirm = () => {
    if (type === 'edit') {
      onClose();
      return;
    }

    if (type === 'refund') {
      if (isFormInvalid) return;

      onConfirm({
        name: name.value.trim(),
        phone: phone.value.trim(),
        email: email.value.trim(),
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
          {t(`orders.modal.title.${type}`)} #{order.id}
        </h3>

        {(type === 'pay' || type === 'refund') && (
          <div className="mt-4 mb-6 rounded-xl bg-blue-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                {t('orders.modal.totalAmount')}
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        )}

        {type === 'refund' && (
          <div className="mb-6 space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('orders.modal.nameLabel')}{' '}
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
                placeholder={t('orders.modal.namePlaceholder')}
              />
              {name.error && (
                <p className="animate-in fade-in mt-1 text-xs text-red-600 duration-200">
                  {t('orders.modal.nameError')}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('orders.modal.phoneLabel')}{' '}
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
                placeholder={t('orders.modal.phonePlaceholder')}
              />
              {phone.error && (
                <p className="animate-in fade-in mt-1 text-xs text-red-600 duration-200">
                  {t('orders.modal.phoneError')}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('orders.modal.emailLabel')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email.value}
                onChange={email.handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder={t('orders.modal.emailPlaceholder')}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {t('orders.modal.reasonLabel')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder={t('orders.modal.reasonPlaceholder')}
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
            disabled={isFormInvalid}
            className={`flex-1 rounded-lg py-2 text-xs font-medium text-white transition ${type === 'pay' || type === 'edit' ? 'bg-blue-600 hover:bg-blue-700' : ''} ${type === 'refund' ? 'bg-purple-600 hover:bg-purple-700' : ''} ${type === 'cancel' ? 'bg-red-600 hover:bg-red-700' : ''} disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200 disabled:opacity-60`}
          >
            {t(`orders.modal.confirmButton.${type}`)}
          </button>
        </div>
      </div>
    </div>
  );
}
