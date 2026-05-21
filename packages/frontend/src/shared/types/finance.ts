import { PaidRecord } from './paid';

export type FinanceRecord = PaidRecord & { kind: 'paid' };
