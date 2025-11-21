import { Invoice } from '../pages/invoiceStatusPage';

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

interface InvoiceCardProps {
    invoice: Invoice;
    onViewDetails: (id: string) => void;
}

export default function InvoiceCard({ invoice, onViewDetails }: InvoiceCardProps) {
    const colors = getStatusColor(invoice.status);

    return (
        <div
            className={`rounded-lg border p-6 shadow-sm transition-all ${colors.bg} ${colors.border}`}
        >
            <InvoiceHeader invoice={invoice} colors={colors} />
            <InvoiceStats invoice={invoice} />
            <InvoiceItems items={invoice.items} />
            {invoice.note && <InvoiceNote note={invoice.note} />}
            <button
                onClick={() => onViewDetails(invoice.id)}
                className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white transition-all duration-200 hover:bg-blue-700 active:scale-95"
            >
                View Details
            </button>
        </div>
    );
}

interface InvoiceHeaderProps {
    invoice: Invoice;
    colors: ReturnType<typeof getStatusColor>;
}

function InvoiceHeader({ invoice, colors }: InvoiceHeaderProps) {
    return (
        <div className="mb-4 flex items-start justify-between">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{invoice.id}</h3>
                <p className="text-sm text-gray-600">Order: {invoice.orderId} | {invoice.branch}</p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${colors.badge}`}>
        {invoice.status}
      </span>
        </div>
    );
}

interface InvoiceStatsProps {
    invoice: Invoice;
}

function InvoiceStats({ invoice }: InvoiceStatsProps) {
    return (
        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatItem label="INVOICE AMOUNT" value={`$${invoice.amount.toLocaleString()}`} isBold />
            <StatItem label="INVOICE DATE" value={invoice.invoiceDate} />
            <StatItem label="DUE DATE" value={invoice.dueDate} />
            <StatItem label="ITEMS" value={`${invoice.items.length} products`} />
        </div>
    );
}

interface StatItemProps {
    label: string;
    value: string;
    isBold?: boolean;
}

function StatItem({ label, value, isBold = false }: StatItemProps) {
    return (
        <div>
            <p className="text-xs font-semibold text-gray-600">{label}</p>
            <p className={`mt-1 ${isBold ? 'text-lg font-bold' : 'text-sm'} text-gray-900`}>{value}</p>
        </div>
    );
}

interface InvoiceItemsProps {
    items: Invoice['items'];
}

function InvoiceItems({ items }: InvoiceItemsProps) {
    return (
        <div className="mb-4 rounded-lg bg-white/95 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">INVOICE ITEMS</p>
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-700">
              {item.quantity} {item.unit} × {item.productName}
            </span>
                        <span className="font-medium text-gray-900">
              ${item.unitPrice.toFixed(2)} / {item.unit} = ${item.totalPrice.toLocaleString()}
            </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface InvoiceNoteProps {
    note: string;
}

function InvoiceNote({ note }: InvoiceNoteProps) {
    return (
        <div className="mb-4 rounded-lg bg-white/95 p-4">
            <p className="text-sm text-gray-700">
                <span className="font-semibold">Note:</span> {note}
            </p>
        </div>
    );
}
