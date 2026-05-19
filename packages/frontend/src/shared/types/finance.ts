import { PaidRecord } from './paid';
import { SpentRecord } from './spent';

export type FinanceRecord =
  | (PaidRecord & { kind: 'paid' })
  | (SpentRecord & { kind: 'spent' });
