import { PropsWithChildren } from 'react';
import { useOutboxAutoFlush } from './use-outbox';

export function OutboxProvider({ children }: PropsWithChildren) {
  useOutboxAutoFlush();
  return children;
}
