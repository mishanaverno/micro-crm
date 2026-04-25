import { createHashRouter } from 'react-router-dom';
import { AppLayout } from './app-layout';
import { DashboardPage } from '../pages/dashboard-page';
import { ClientsPage } from '../pages/clients-page';
import { SettingsPage } from '../pages/settings-page';

export const router = createHashRouter([
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
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
]);
