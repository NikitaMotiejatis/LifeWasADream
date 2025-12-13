import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import LoginPage from '@/global/pages/loginPage';
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

const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to="/login" /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/newOrder', element: <NewOrderPage /> },
    { path: '/orders', element: <OrdersPage /> },
    { path: '/newReservation', element: <NewReservationPage /> },
    { path: '/reservations', element: <ReservationsPage /> },
    { path: '/stockUpdates', element: <StockUpdatesPage /> },
    { path: '/transferRequests', element: <TransferRequestsPage /> },
    { path: '/stockAlerts', element: <StockAlertsPage /> },
    { path: '/auditHistory', element: <AuditHistoryPage /> },
    { path: '/invoiceStatus', element: <InvoiceStatusPage /> },
    { path: '/deliveries', element: <DeliveriesPage /> },
    { path: '/dashboard', element: <DashboardPage /> },
    { path: '/refunds', element: <RefundApprovalsPage /> },
    { path: '/reports', element: <ReportsAnalyticsPage /> },
    { path: '/inventory', element: <InventoryOverviewPage /> },
    { path: '/edit-order/:orderId', element: <EditOrderPage /> },
    { path: '/edit-reservation/:reservationId',  element: <EditReservationPage />,
    },
    { path: '/payment/success', element: <PaymentSuccessPage /> },
    { path: '/payment/cancel', element: <PaymentCancelPage /> },
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
