import { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/currencyContext';
import { useNameValidation } from '../utils/useNameValidation';
import { usePhoneValidation } from '../utils/usePhoneValidation';

interface Order {
  id: string;
  total: number;
}

interface Props {
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
}

export default function OrderModal({
  open,
  type,
  order,
  onClose,
  onConfirm,
}: Props) {
  const { formatPrice } = useCurrency();

  const name = useNameValidation();
  const phone = usePhoneValidation();

  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) {
      name.reset();
      phone.reset();
      setEmail('');
      setReason('');
    }
  }, [open]);

  if (!open || !order) return null;

  const titles = {
    pay: 'Complete Payment',
    edit: 'Edit Order',
    refund: 'Refund Order',
    cancel: 'Cancel Refund',
  };

  const isFormInvalid =
    type === 'refund' && (!name.isValid || !phone.isValid || !reason.trim());

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
          {titles[type]} #{order.id}
        </h3>

        {(type === 'pay' || type === 'refund') && (
          <div className="mt-4 mb-6 rounded-xl bg-blue-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                Total Amount
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
                Customer's Full Name <span className="text-red-500">*</span>
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
                placeholder="John Doe"
              />
              {name.error && (
                <p className="animate-in fade-in mt-1 text-xs text-red-600 duration-200">
                  Only letters, spaces, hyphens and apostrophes allowed
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Customer's Phone Number <span className="text-red-500">*</span>
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
                placeholder="+37060000000"
              />
              {phone.error && (
                <p className="animate-in fade-in mt-1 text-xs text-red-600 duration-200">
                  Only numbers and optional "+" at the beginning
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Customer's Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Reason for Refund <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="Please explain why Customer wants a refund..."
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-400 py-2 text-xs font-medium transition hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isFormInvalid}
            className={`flex-1 rounded-lg py-2 text-xs font-medium text-white transition ${type === 'pay' || type === 'edit' ? 'bg-blue-600 hover:bg-blue-700' : ''} ${type === 'refund' ? 'bg-purple-600 hover:bg-purple-700' : ''} ${type === 'cancel' ? 'bg-red-600 hover:bg-red-700' : ''} disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200 disabled:opacity-60`}
          >
            {type === 'pay' && 'Confirm Payment'}
            {type === 'edit' && 'Save Changes'}
            {type === 'refund' && 'Issue Refund'}
            {type === 'cancel' && 'Confirm Cancellation'}
          </button>
        </div>
      </div>
    </div>
  );
}
