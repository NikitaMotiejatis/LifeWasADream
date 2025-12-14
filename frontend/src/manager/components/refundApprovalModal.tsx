import { useTranslation } from 'react-i18next';
import { Refund } from '@/utils/refundService';
import { useState } from 'react';
import CheckmarkIcon from '../../icons/checkmarkIcon';
import TrashcanIcon from '../../icons/trashcanIcon';

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
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

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

      <div className="bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full relative">
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-xl leading-6 font-semibold text-gray-900" id="modal-title">
                {t('manager.refunds.modal.title')} - {request.orderId}
              </h3>
              <p className="text-sm text-gray-500">
                {t('manager.refunds.modal.subtitle')}
              </p>
              <div className="mt-6 space-y-4">
                {/* Refund Details */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">{t('manager.refunds.modal.refundAmount')}</p>
                    <p className="text-3xl font-bold text-gray-900">${request.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 mt-2">Refund ID: {request.id} | Order ID: {request.orderId}</p>
                  </div>
                </div>

                {/* Reason */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">{t('manager.refunds.modal.reason')}</p>
                  <p className="text-base font-medium text-red-600">{request.reason}</p>
                  <p className="text-sm text-gray-500 mt-2">Requested At: {new Date(request.requestedAt).toLocaleString()}</p>
                </div>

                {/* Rejection Reason Input */}
                {isRejecting && (
                  <div className="mt-4">
                    <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
                      {t('manager.refunds.rejectionReason')}
                    </label>
                    <textarea
                      id="rejection-reason"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder={t('manager.refunds.rejectionPlaceholder')}
                    />
                    {!rejectionReason.trim() && (
                      <p className="mt-1 text-xs text-red-500">{t('manager.refunds.reasonRequired')}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 text-base font-medium text-gray-700 bg-white hover:bg-gray-100 transition-colors duration-150"
            onClick={handleClose}
          >
            {t('common.cancel')}
          </button>

          <button
            type="button"
            className={`w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium sm:text-sm transition-colors duration-150 ${isRejecting ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
            onClick={() => {
              if (!isRejecting) {
                setIsRejecting(true);
              } else if (rejectionReason.trim()) {
                handleConfirmReject();
              }
            }}
            disabled={isRejecting && !rejectionReason.trim()}
          >
            <TrashcanIcon className="w-5 h-5 mr-2" />
            {isRejecting ? t('manager.refunds.confirmReject') : t('manager.refunds.reject')}
          </button>

          {!isRejecting && (
            <button
              type="button"
              className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-150"
              onClick={handleApprove}
            >
              <CheckmarkIcon className="w-5 h-5 mr-2" />
              {t('manager.refunds.approve')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
