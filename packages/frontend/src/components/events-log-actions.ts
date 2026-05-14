import { ReactNode } from 'react';

export interface EventsLogAction {
  id: string;
  label: string;
  onSelect: () => void;
  icon?: ReactNode;
  tone?: 'default' | 'destructive';
}
