import { createHashRouter } from 'react-router-dom';
import { AppLayout } from './app-layout';
import { DashboardPage } from '../pages/dashboard-page';
import { EventsLogPage } from '../pages/events-log-page';
import { ClientsPage } from '../pages/clients-page';
import { NotesPage } from '../pages/notes-page';
import { OrdersPage } from '../pages/orders-page';
import { FinancesPage } from '../pages/finances-page';
import { RemindersPage } from '../pages/reminders-page';
import { TasksPage } from '../pages/tasks-page';
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
            path: 'tasks',
            element: <TasksPage />,
          },
          {
            path: 'reminders',
            element: <RemindersPage />,
          },
          {
            path: 'orders',
            element: <OrdersPage />,
          },
          {
            path: 'finances',
            element: <FinancesPage />,
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
