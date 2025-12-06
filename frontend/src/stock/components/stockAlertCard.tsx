import { useTranslation } from 'react-i18next';
import { StockAlert } from '@/stock/pages/stockAlertsPage';

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'CRITICAL':
      return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        badge: 'bg-red-100 text-red-800 border-red-300',
        text: 'text-red-600',
        bar: 'bg-red-600',
      };
    case 'WARNING':
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        text: 'text-yellow-600',
        bar: 'bg-yellow-600',
      };
    case 'MONITOR':
      return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-800 border-blue-300',
        text: 'text-blue-600',
        bar: 'bg-blue-600',
      };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        badge: 'bg-gray-100 text-gray-800 border-gray-300',
        text: 'text-gray-600',
        bar: 'bg-gray-600',
      };
  }
};

type StockAlertCardProps = {
  alert: StockAlert;
  onReorder: (id: string) => void;
  onAcknowledge: (id: string) => void;
};

export default function StockAlertCard({
  alert,
  onReorder,
  onAcknowledge,
}: StockAlertCardProps) {
  const colors = getSeverityColor(alert.severity);
  const shortage = Math.max(0, alert.minimumStock - alert.currentStock);
  const stockPercentage = Math.min(
    (alert.currentStock / alert.minimumStock) * 100,
    100,
  );

  return (
    <div
      className={`rounded-lg border p-6 shadow-sm transition-all ${colors.bg} ${colors.border}`}
    >
      <AlertHeader alert={alert} colors={colors} />
      <AlertStats alert={alert} shortage={shortage} colors={colors} />
      <ProgressBar percentage={stockPercentage} color={colors.bar} />
      <AlertActions
        alertId={alert.id}
        severity={alert.severity}
        onReorder={onReorder}
        onAcknowledge={onAcknowledge}
      />
    </div>
  );
}

function AlertHeader({ alert, colors }: { alert: StockAlert; colors: any }) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {alert.productName}
        </h3>
        <p className="text-sm text-gray-600">
          {t('stockAlerts.labels.sku')} {alert.sku}
        </p>
      </div>
      <span
        className={`rounded-full border px-3 py-1 text-sm font-semibold ${colors.badge}`}
      >
        {t(`stockAlerts.severity.${alert.severity}`)}
      </span>
    </div>
  );
}

function AlertStats({
  alert,
  shortage,
  colors,
}: {
  alert: StockAlert;
  shortage: number;
  colors: any;
}) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatItem
        label={t('stockAlerts.currentBig')}
        value={`${alert.currentStock} ${alert.unit}`}
        className={colors.text}
        isBold
      />
      <StatItem
        label={t('stockAlerts.minimumBig')}
        value={`${alert.minimumStock} ${alert.unit}`}
        isBold
      />
      <StatItem
        label={t('stockAlerts.lastOrderedBig')}
        value={
          alert.lastOrderedDaysAgo === null
            ? t('stockAlerts.never')
            : t('stockAlerts.daysAgo', { count: alert.lastOrderedDaysAgo })
        }
      />
      <StatItem
        label={t('stockAlerts.shortageBig')}
        value={shortage > 0 ? `–${shortage} ${alert.unit}` : `0 ${alert.unit}`}
        className="text-red-600"
        isBold
      />
    </div>
  );
}

function StatItem({
  label,
  value,
  className = 'text-gray-900',
  isBold = false,
}: {
  label: string;
  value: string;
  className?: string;
  isBold?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-600">{label}</p>
      <p
        className={`mt-1 ${isBold ? 'text-lg font-bold' : 'text-sm'} ${className}`}
      >
        {value}
      </p>
    </div>
  );
}

function ProgressBar({
  percentage,
  color,
}: {
  percentage: number;
  color: string;
}) {
  return (
    <div className="mb-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-300">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function AlertActions({
  alertId,
  severity,
  onReorder,
  onAcknowledge,
}: {
  alertId: string;
  severity: string;
  onReorder: (id: string) => void;
  onAcknowledge: (id: string) => void;
}) {
  const { t } = useTranslation();

  const getButtonColor = () => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-600 hover:bg-red-700';
      case 'WARNING':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={() => onReorder(alertId)}
        className={`flex-1 rounded-lg px-4 py-2.5 font-medium text-white transition-all active:scale-95 ${getButtonColor()}`}
      >
        {t('stockAlerts.actions.reorder')}
      </button>
      <button
        onClick={() => onAcknowledge(alertId)}
        className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 active:scale-95"
      >
        {t('stockAlerts.actions.acknowledge')}
      </button>
    </div>
  );
}
