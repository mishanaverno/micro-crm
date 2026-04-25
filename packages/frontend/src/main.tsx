import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/auth-provider';
import { router } from './app/router';
import { OutboxProvider } from './shared/offline/outbox-provider';
import { queryClient } from './shared/query/query-client';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OutboxProvider>
          <RouterProvider router={router} />
        </OutboxProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
