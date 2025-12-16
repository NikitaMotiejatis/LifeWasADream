import { useTranslation } from 'react-i18next';
import { Refund } from '@/utils/refundService';
import { useState } from 'react';
import CheckmarkIcon from '../../icons/checkmarkIcon';
import TrashcanIcon from '../../icons/trashcanIcon';
import { useCurrency } from '@/global/contexts/currencyContext';
import i18n from '@/i18n';

interface RefundApprovalModalProps {
  request: Refund;
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export default function RefundApprovalModal({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: RefundApprovalModalProps) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const entityId =
    request.refundType === 'reservation'
      ? request.reservationId || request.id
      : request.orderId || request.id;
  const entityLabel =
    request.refundType === 'reservation'
      ? t('reservationId', { defaultValue: 'Reservation ID' })
      : t('orderId', { defaultValue: 'Order ID' });

  const resetModalState = () => {
    setRejectionReason('');
    setIsRejecting(false);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  if (!isOpen) return null;

  const handleApprove = () => {
    onApprove();
    handleClose();
  };

  const handleConfirmReject = () => {
    if (!rejectionReason.trim()) return;
    onReject(rejectionReason.trim());
    handleClose();
  };

  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3
                className="text-xl leading-6 font-semibold text-gray-900"
                id="modal-title"
              >
                {t('manager.refunds.modal.title')} - {entityId}
              </h3>
              <p className="text-sm text-gray-500">
                {t('manager.refunds.modal.subtitle')}
              </p>
              <div className="mt-6 space-y-4">
                {/* Refund Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                      {t('manager.refunds.modal.refundAmount')}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatPrice(request.amount * 100)}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      {t('refundId') +
                        ' ' +
                        request.id +
                        ' | ' +
                        entityLabel +
                        ' ' +
                        entityId}
                    </p>
                  </div>
                </div>

                {/* Reason */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="mb-1 text-xs font-medium text-gray-500 uppercase">
                    {t('manager.refunds.modal.reason')}
                  </p>
                  <p className="text-base font-medium text-red-600">
                    {i18n.exists(`transferRequests.reasons.${request.reason}`)
                      ? t(`transferRequests.reasons.${request.reason}`)
                      : request.reason}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {t('requestedAt') +
                      ' ' +
                      new Date(request.requestedAt).toLocaleString()}
                  </p>
                </div>

                {/* Rejection Reason Input */}
                {isRejecting && (
                  <div className="mt-4">
                    <label
                      htmlFor="rejection-reason"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t('manager.refunds.rejectionReason')}
                    </label>
                    <textarea
                      id="rejection-reason"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 p-1 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      placeholder={t('manager.refunds.rejectionPlaceholder')}
                    />
                    {!rejectionReason.trim() && (
                      <p className="mt-1 text-xs text-red-500">
                        {t('manager.refunds.reasonRequired')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-gray-50 px-4 py-3 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm transition-colors duration-150 hover:bg-gray-100 sm:w-auto"
            onClick={handleClose}
          >
            {t('common.cancel')}
          </button>

          <button
            type="button"
            className={`inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium shadow-sm transition-colors duration-150 sm:w-auto sm:text-sm ${isRejecting ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
            onClick={() => {
              if (!isRejecting) {
                setIsRejecting(true);
              } else if (rejectionReason.trim()) {
                handleConfirmReject();
              }
            }}
            disabled={isRejecting && !rejectionReason.trim()}
          >
            <TrashcanIcon className="mr-2 h-5 w-5" />
            {isRejecting
              ? t('manager.refunds.confirmReject')
              : t('manager.refunds.reject')}
          </button>

          {!isRejecting && (
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm transition-colors duration-150 hover:bg-green-700 sm:w-auto"
              onClick={handleApprove}
            >
              <CheckmarkIcon className="mr-2 h-5 w-5" />
              {t('manager.refunds.approve')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
