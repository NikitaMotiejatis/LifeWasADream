import { useTranslation } from 'react-i18next';
import type { PaymentMethod } from './types';

interface PaymentSectionProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  total: number;
  onPayment: () => void;
}

export function PaymentSection({
  paymentMethod,
  setPaymentMethod,
  total,
  onPayment,
}: PaymentSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6">
      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-700 xl:text-sm">
          {t('orderSummary.paymentMethod', 'Payment Method')}
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {(['Cash', 'Card', 'Gift card'] as const).map(method => (
            <button
              key={method}
              onClick={() => setPaymentMethod(method)}
              className={`rounded-lg py-2 text-xs font-medium transition ${
                paymentMethod === method
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-400 hover:bg-gray-100'
              }`}
            >
              {t(`orderSummary.paymentMethods.${method}`, method)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-gray-300 pt-6">
        <button
          onClick={onPayment}
          className="w-full rounded-lg bg-green-600 py-3 text-sm font-medium text-white hover:bg-green-700"
        >
          {t('orderSummary.completePayment', 'Complete Payment')}
        </button>
      </div>
    </div>
  );
}