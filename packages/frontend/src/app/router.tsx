import { createHashRouter } from 'react-router-dom';
import { AppLayout } from './app-layout';
import { DashboardPage } from '../pages/dashboard-page';
import { EventsLogPage } from '../pages/events-log-page';
import { ClientsPage } from '../pages/clients-page';
import { NotesPage } from '../pages/notes-page';
import { OrdersPage } from '../pages/orders-page';
import { PaidsPage } from '../pages/paids-page';
import { LoginPage } from '../pages/login-page';
import { RegisterPage } from '../pages/register-page';
import { ProtectedRoute } from '../features/auth/protected-route';
import { PublicOnlyRoute } from '../features/auth/public-only-route';

export const router = createHashRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'clients',
            element: <ClientsPage />,
          },
          {
            path: 'notes',
            element: <NotesPage />,
          },
          {
            path: 'orders',
            element: <OrdersPage />,
          },
          {
            path: 'paids',
            element: <PaidsPage />,
          },
          {
            path: 'events-log',
            element: <EventsLogPage />,
          },
        ],
      },
    ],
  },
]);
