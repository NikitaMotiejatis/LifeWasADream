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

const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to="/login" /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/newOrder', element: <NewOrderPage /> },
    { path: '/orders', element: <OrdersPage /> },
    { path: '/newReservation', element: <NewReservationPage /> },
    { path: '/reservations', element: <ReservationsPage /> },
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
