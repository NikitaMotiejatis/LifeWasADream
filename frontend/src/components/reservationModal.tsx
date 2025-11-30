import { Reservation, servicesMap } from './reservationList';
import { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/currencyContext';

interface Props {
  open: boolean;
  type: 'start' | 'complete' | 'cancel' | 'noshow' | 'refund' | 'cancel_refund';
  reservation: Reservation | null;
  onClose: () => void;
  onConfirm: (refundData?: {
    name: string;
    phone: string;
    email: string;
    reason: string;
  }) => void;
}

export default function ReservationModal({
  open,
  type,
  reservation,
  onClose,
  onConfirm,
}: Props) {
  const { formatPrice } = useCurrency();

  const [refundForm, setRefundForm] = useState({
    name: '',
    phone: '',
    email: '',
    reason: '',
  });

  const [nameError, setNameError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  useEffect(() => {
    if (!open) {
      setRefundForm({ name: '', phone: '', email: '', reason: '' });
      setNameError(false);
      setPhoneError(false);
    }
  }, [open]);

  if (!open || !reservation) return null;

  const titles = {
    start: 'Start Service',
    complete: 'Complete Service',
    cancel: 'Cancel Reservation',
    noshow: 'Mark as No-Show',
    refund: 'Request Refund',
    cancel_refund: 'Cancel Refund Request',
  };

  const servicePrice = servicesMap[reservation.serviceId]?.price;

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleString('en', { month: 'short' });
    const time = d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${day} ${month} • ${time}`;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const valid = /^[\p{Letter}\s'-]*$/u.test(input);
    const filtered = input
      .replace(/[^\p{Letter}\s'-]/gu, '')
      .replace(/^\s+/g, '')
      .replace(/\s+$/g, ' ');

    setNameError(input !== '' && !valid);
    setRefundForm(prev => ({ ...prev, name: filtered }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const filtered = input
      .replace(/[^0-9+]/g, '')
      .replace(/\+/g, (_m, offset) => (offset === 0 ? '+' : ''))
      .slice(0, 16);

    setPhoneError(input !== filtered);
    setRefundForm(prev => ({ ...prev, phone: filtered }));
  };

  const isRefundInvalid =
    type === 'refund' &&
    (!refundForm.name.trim() ||
      !refundForm.phone.trim() ||
      !refundForm.reason.trim());

  const handleConfirm = () => {
    if (type === 'refund') {
      if (isRefundInvalid) return;

      onConfirm({
        name: refundForm.name.trim(),
        phone: refundForm.phone.trim(),
        email: refundForm.email.trim(),
        reason: refundForm.reason.trim(),
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
          {titles[type]} #{reservation.id}
        </h3>

        <div className="space-y-2 text-sm text-gray-700">
          <p className="font-medium">{reservation.customerName}</p>
          <p className="text-gray-600">{reservation.customerPhone}</p>
          <p className="text-gray-600">
            {formatDateTime(reservation.datetime)}
          </p>
        </div>

        {(type === 'complete' || type === 'refund') && (
          <div className="mt-6 mb-6 rounded-xl bg-blue-50 px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-700">
                Total Amount
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
                Customer's Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={refundForm.name}
                onChange={handleNameChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                  nameError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="John Doe"
              />
              {nameError && (
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
                value={refundForm.phone}
                onChange={handlePhoneChange}
                className={`w-full rounded-lg border px-3 py-2 text-sm transition-all focus:ring-2 focus:ring-blue-500/20 focus:outline-none ${
                  phoneError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="+370 600 00000"
              />
              {phoneError && (
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
                value={refundForm.email}
                onChange={e =>
                  setRefundForm(prev => ({ ...prev, email: e.target.value }))
                }
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
                value={refundForm.reason}
                onChange={e =>
                  setRefundForm(prev => ({ ...prev, reason: e.target.value }))
                }
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
            disabled={isRefundInvalid}
            className={`flex-1 rounded-lg py-2 text-xs font-medium text-white transition ${type === 'complete' ? 'bg-green-600 hover:bg-green-700' : ''} ${type === 'refund' ? 'bg-purple-600 hover:bg-purple-700' : ''} ${type === 'cancel' || type === 'noshow' || type === 'cancel_refund' ? 'bg-red-600 hover:bg-red-700' : ''} ${type === 'start' ? 'bg-blue-600 hover:bg-blue-700' : ''} disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-200 disabled:opacity-60`}
          >
            {type === 'start' && 'Start Service'}
            {type === 'complete' && 'Confirm Completion'}
            {type === 'cancel' && 'Confirm Cancellation'}
            {type === 'noshow' && 'Mark as No-Show'}
            {type === 'refund' && 'Request Refund'}
            {type === 'cancel_refund' && 'Cancel Refund Request'}
          </button>
        </div>
      </div>
    </div>
  );
}
