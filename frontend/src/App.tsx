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
import ProtectedRoute from '@/auth/protectedRoute';

const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to="/login" /> },
    { path: '/login', element: <LoginPage /> },
    { 
      path: '/newOrder', 
      element: 
        <ProtectedRoute roleAuthPredicate={ (roles) => roles.includes('Cashier') } >
          <NewOrderPage />
        </ProtectedRoute>
    },
    { 
      path: '/orders', 
      element: 
        <ProtectedRoute roleAuthPredicate={ (roles) => roles.includes('Cashier') } >
          <OrdersPage />
        </ProtectedRoute>
    },
    { 
      path: '/newReservation', 
      element: 
        <ProtectedRoute roleAuthPredicate={ (roles) => roles.includes('Cashier') } >
          <NewReservationPage />
        </ProtectedRoute>
    },
    { 
      path: '/reservations', 
      element: 
        <ProtectedRoute roleAuthPredicate={ (roles) => roles.includes('Cashier') } >
          <ReservationsPage />
        </ProtectedRoute>
    },
    { 
      path: '/stockUpdates', 
      element: 
        <ProtectedRoute roleAuthPredicate={ (roles) => roles.includes('Clerk') } >
          <StockUpdatesPage />
        </ProtectedRoute>
    },
    { 
      path: '/transferRequests',
      element:
        <ProtectedRoute roleAuthPredicate={ (roles) => roles.includes('Clerk') } >
          <TransferRequestsPage /> 
        </ProtectedRoute>
    },
    { 
      path: '/stockAlerts',
      element:
        <ProtectedRoute roleAuthPredicate={ (roles) => roles.includes('Clerk') } >
          <StockAlertsPage /> 
        </ProtectedRoute>
    },
    { 
      path: '/auditHistory',
      element:
        <ProtectedRoute roleAuthPredicate={ (roles) => roles.includes('Clerk') } >
          <AuditHistoryPage /> 
        </ProtectedRoute>
    },
    { 
      path: '/invoiceStatus',
      element:
        <ProtectedRoute roleAuthPredicate={ (roles) => roles.includes('Supplier') } >
          <InvoiceStatusPage /> 
        </ProtectedRoute>
    },
    { 
      path: '/deliveries',
      element:
        <ProtectedRoute roleAuthPredicate={ (roles) => roles.includes('Supplier') } >
          <DeliveriesPage /> 
        </ProtectedRoute>
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
