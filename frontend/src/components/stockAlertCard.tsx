import { StockAlert } from '../pages/stockAlertsPage';

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'CRITICAL':
            return {
                bg: 'bg-red-50',
                border: 'border-red-200',
                badge: 'bg-red-100 text-red-800 border-red-300',
                text: 'text-red-600',
            };
        case 'WARNING':
            return {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                text: 'text-yellow-600',
            };
        case 'MONITOR':
            return {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                badge: 'bg-blue-100 text-blue-800 border-blue-300',
                text: 'text-blue-600',
            };
        default:
            return {
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                badge: 'bg-gray-100 text-gray-800 border-gray-300',
                text: 'text-gray-600',
            };
    }
};

interface StockAlertCardProps {
    alert: StockAlert;
    onReorder: (id: string) => void;
    onAcknowledge: (id: string) => void;
}

export default function StockAlertCard({ alert, onReorder, onAcknowledge }: StockAlertCardProps) {
    const colors = getSeverityColor(alert.severity);
    const shortage = alert.minimumStock - alert.currentStock;
    const stockPercentage = Math.min((alert.currentStock / alert.minimumStock) * 100, 100);

    return (
        <div
            className={`rounded-lg border p-6 shadow-sm transition-all ${colors.bg} ${colors.border}`}
        >
            <AlertHeader alert={alert} colors={colors} />
            <AlertStats alert={alert} shortage={shortage} colors={colors} />
            <ProgressBar percentage={stockPercentage} colors={colors} />
            <AlertActions
                alertId={alert.id}
                severity={alert.severity}
                onReorder={onReorder}
                onAcknowledge={onAcknowledge}
            />
        </div>
    );
}

interface AlertHeaderProps {
    alert: StockAlert;
    colors: ReturnType<typeof getSeverityColor>;
}

function AlertHeader({ alert, colors }: AlertHeaderProps) {
    return (
        <div className="mb-4 flex items-start justify-between">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{alert.productName}</h3>
                <p className="text-sm text-gray-600">SKU: {alert.sku}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${colors.badge}`}>
        {alert.severity}
      </span>
        </div>
    );
}

interface AlertStatsProps {
    alert: StockAlert;
    shortage: number;
    colors: ReturnType<typeof getSeverityColor>;
}

function AlertStats({ alert, shortage, colors }: AlertStatsProps) {
    return (
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatItem label="CURRENT" value={`${alert.currentStock} ${alert.unit}`} className={colors.text} isBold />
            <StatItem label="MINIMUM" value={`${alert.minimumStock} ${alert.unit}`} isBold />
            <StatItem label="LAST ORDERED" value={alert.lastOrdered} />
            <StatItem label="SHORTAGE" value={`-${shortage} ${alert.unit}`} className="text-red-600" isBold />
        </div>
    );
}

interface StatItemProps {
    label: string;
    value: string;
    className?: string;
    isBold?: boolean;
}

function StatItem({ label, value, className = 'text-gray-900', isBold = false }: StatItemProps) {
    return (
        <div>
            <p className="text-xs font-semibold text-gray-600">{label}</p>
            <p className={`mt-1 ${isBold ? 'text-lg font-bold' : 'text-sm'} ${className}`}>{value}</p>
        </div>
    );
}

interface ProgressBarProps {
    percentage: number;
    colors: ReturnType<typeof getSeverityColor>;
}

function ProgressBar({ percentage, colors }: ProgressBarProps) {
    return (
        <div className="mb-4">
            <div className="h-2 w-full rounded-full bg-gray-300">
                <div
                    className={`h-full rounded-full transition-all ${colors.text.replace('text-', 'bg-')}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

interface AlertActionsProps {
    alertId: string;
    severity: string;
    onReorder: (id: string) => void;
    onAcknowledge: (id: string) => void;
}

function AlertActions({ alertId, severity, onReorder, onAcknowledge }: AlertActionsProps) {
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
                className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-all duration-200 ${getButtonColor()} active:scale-95`}
            >
                Reorder Now
            </button>
            <button
                onClick={() => onAcknowledge(alertId)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 active:scale-95"
            >
                Acknowledge
            </button>
        </div>
    );
}