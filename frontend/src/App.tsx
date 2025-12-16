import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import LoginPage from '@/global/pages/loginPage';
import UnauthorizedPage from '@/global/pages/unauthorizedPage';
import NewOrderPage from '@/receptionist/pages/newOrderPage';
import OrdersPage from '@/receptionist/pages/ordersList';
import NewReservationPage from '@/receptionist/pages/newReservationPage';
import ReservationsPage from '@/receptionist/pages/reservationsList';
import StockUpdatesPage from '@/stock/pages/stockUpdatesPage';
import TransferRequestsPage from '@/stock/pages/transferRequestsPage';
import StockAlertsPage from '@/stock/pages/stockAlertsPage';
import AuditHistoryPage from '@/stock/pages/auditHistoryPage';
import InvoiceStatusPage from '@/supplier/pages/invoiceStatusPage';
import DeliveriesPage from '@/supplier/pages/deliveriesPage';
import DashboardPage from '@/manager/pages/dashboardPage';
import RefundApprovalsPage from '@/manager/pages/refundApprovalsPage';
import ReportsAnalyticsPage from '@/manager/pages/reportsAnalyticsPage';
import InventoryOverviewPage from '@/manager/pages/inventoryOverviewPage';
import EditOrderPage from '@/receptionist/pages/editOrderPage';
import EditReservationPage from '@/receptionist/pages/editReservationPage';
import PaymentSuccessPage from '@/receptionist/pages/paymentSuccessPage';
import PaymentCancelPage from '@/receptionist/pages/paymentCancelPage';
import ReservationPaymentSuccessPage from '@/receptionist/pages/reservationPaymentSuccessPage';
import ReservationPaymentCancelPage from '@/receptionist/pages/reservationPaymentCancelPage';
import VatSettingsPage from '@/manager/pages/vatSettingsPage'; 
import ProtectedRoute from '@/global/components/protectedRoute';

const POS_ROLES = ['CASHIER', 'RECEPTIONIST'];
const MANAGER_ROLES = ['OWNER', 'MANAGER'];
const STOCK_ROLES = ['CLERK'];
const SUPPLIER_ROLES = ['SUPPLIER'];

const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to="/login" /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/unauthorized', element: <UnauthorizedPage /> },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <ProtectedRoute requiredRoles={POS_ROLES} />,
          children: [
            { path: '/newOrder', element: <NewOrderPage /> },
            { path: '/orders', element: <OrdersPage /> },
            { path: '/edit-order/:orderId', element: <EditOrderPage /> },
            { path: '/payment/success', element: <PaymentSuccessPage /> },
            { path: '/payment/cancel', element: <PaymentCancelPage /> },
            { path: '/newReservation', element: <NewReservationPage /> },
            { path: '/reservations', element: <ReservationsPage /> },
            { path: '/edit-reservation/:reservationId', element: <EditReservationPage /> },
            { path: '/reservation-payment/success', element: <ReservationPaymentSuccessPage /> },
            { path: '/reservation-payment/cancel', element: <ReservationPaymentCancelPage /> },
          ],
        },
        {
          element: <ProtectedRoute requiredRoles={STOCK_ROLES} />,
          children: [
            { path: '/stockUpdates', element: <StockUpdatesPage /> },
            { path: '/transferRequests', element: <TransferRequestsPage /> },
            { path: '/stockAlerts', element: <StockAlertsPage /> },
            { path: '/auditHistory', element: <AuditHistoryPage /> },
          ],
        },
        {
          element: <ProtectedRoute requiredRoles={SUPPLIER_ROLES} />,
          children: [
            { path: '/invoiceStatus', element: <InvoiceStatusPage /> },
            { path: '/deliveries', element: <DeliveriesPage /> },
          ],
        },
        {
          element: <ProtectedRoute requiredRoles={MANAGER_ROLES} />,
          children: [
            { path: '/dashboard', element: <DashboardPage /> },
            { path: '/refunds', element: <RefundApprovalsPage /> },
            { path: '/reports', element: <ReportsAnalyticsPage /> },
            { path: '/inventory', element: <InventoryOverviewPage /> },
            { path: '/vat-settings', element: <VatSettingsPage /> },
          ],
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);

export default function App() {
  return <RouterProvider router={router} />;
}
