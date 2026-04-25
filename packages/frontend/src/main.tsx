import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { OutboxProvider } from './shared/offline/outbox-provider';
import { queryClient } from './shared/query/query-client';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <OutboxProvider>
        <RouterProvider router={router} />
      </OutboxProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
