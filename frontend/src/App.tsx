import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/loginPage';
import NewOrderPage from './pages/newOrderPage';
import OrdersPage from './pages/ordersList';
import NewReservationPage from './pages/newReservationPage';
import ReservationsPage from './pages/reservationsList';
import StockUpdatesPage from './pages/stockUpdatesPage';
import TransferRequestsPage from './pages/transferRequestsPage';
import StockAlertsPage from './pages/stockAlertsPage';
import AuditHistoryPage from './pages/auditHistoryPage';
import InvoiceStatusPage from '@/supplier/pages/invoiceStatusPage';
import DeliveriesPage from '@/supplier/pages/deliveriesPage';

const router = createBrowserRouter(
  [
    //{ path: '/', element: <Navigate to="/login" /> },
    //{ path: '/login', element: <LoginPage /> },
    //{ path: '/newOrder', element: <NewOrderPage /> },
    //{ path: '/orders', element: <OrdersPage /> },
    //{ path: '/newReservation', element: <NewReservationPage /> },
    //{ path: '/reservations', element: <ReservationsPage /> },
    //{ path: '/stockUpdates', element: <StockUpdatesPage /> },
    //{ path: '/transferRequests', element: <TransferRequestsPage /> },
    //{ path: '/stockAlerts', element: <StockAlertsPage /> },
    //{ path: '/auditHistory', element: <AuditHistoryPage /> },
    { path: '/invoiceStatus', element: <InvoiceStatusPage /> },
    { path: '/deliveries', element: <DeliveriesPage /> },
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
