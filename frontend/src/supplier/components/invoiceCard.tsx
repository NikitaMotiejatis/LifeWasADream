import { useTranslation } from 'react-i18next';
import { Invoice } from '@/supplier/pages/invoiceStatusPage';
import { useCurrency } from '@/global/contexts/currencyContext';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return {
        bg: 'bg-green-50',
        border: 'border-green-200',
        badge: 'bg-green-100 text-green-800 border-green-300',
      };
    case 'APPROVED':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
      };
    case 'PENDING':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      };
    case 'OVERDUE':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-800 border-red-300',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        badge: 'bg-gray-100 text-gray-800 border-gray-300',
      };
  }
};

type InvoiceCardProps = {
  invoice: Invoice;
  translateProduct?: (key: string) => string;
  translateUnit?: (unit: string) => string;
  onViewDetails: (id: string) => void;
};

export default function InvoiceCard({
  invoice,
  translateProduct = key => key,
  translateUnit = unit => unit,
  onViewDetails,
}: InvoiceCardProps) {
  const { t } = useTranslation();
  const colors = getStatusColor(invoice.status);
  const { formatPrice } = useCurrency();

  const statusText = t(`invoices.statuses.${invoice.status}`, invoice.status);

  return (
    <div
      className={`rounded-lg border p-6 shadow-sm transition-all ${colors.bg} ${colors.border}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{invoice.id}</h3>
          <p className="text-sm text-gray-600">
            {t('invoice.labels.order')}: {invoice.orderId} • {invoice.branch}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-sm font-semibold ${colors.badge}`}
        >
          {statusText}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatItem
          label={t('invoice.labels.invoiceAmount')}
          value={`${formatPrice(invoice.amount).toLocaleString()}`}
          isBold
        />
        <StatItem
          label={t('invoice.labels.invoiceDate')}
          value={invoice.invoiceDate}
        />
        <StatItem label={t('invoice.labels.dueDate')} value={invoice.dueDate} />
        <StatItem
          label={t('invoice.labels.itemsText')}
          value={t('invoice.labels.items', {
            count: invoice.items.length,
          })}
        />
      </div>
      <div className="mb-4 rounded-lg bg-white/95 p-4">
        <p className="mb-3 text-sm font-semibold text-gray-700">
          {t('invoices.card.itemsTitle')}
        </p>
        <div className="space-y-2">
          {invoice.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-gray-700">
                {item.quantity} {translateUnit(item.unit)} ×{' '}
                {translateProduct(item.productKey)}
              </span>
              <span className="font-medium text-gray-900">
                {item.unitPrice.toFixed(2)} / {translateUnit(item.unit)} ={' '}
                {item.totalPrice.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {invoice.note && (
        <div className="mb-4 rounded-lg bg-white/90 p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{t('invoice.labels.note')}</span>{' '}
            {invoice.note}
          </p>
        </div>
      )}

      <button
        onClick={() => onViewDetails(invoice.id)}
        className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white transition-all hover:bg-blue-700 active:scale-95"
      >
        {t('invoice.viewDetails')}
      </button>
    </div>
  );
}

function StatItem({
  label,
  value,
  isBold = false,
}: {
  label: string;
  value: string;
  isBold?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-gray-600 uppercase">
        {label}
      </p>
      <p
        className={`mt-1 ${isBold ? 'text-lg font-bold' : 'text-sm'} text-gray-900`}
      >
        {value}
      </p>
    </div>
  );
}
