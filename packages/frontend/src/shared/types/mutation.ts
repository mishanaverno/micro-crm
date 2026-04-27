import { ClientDraft } from './client';

export type MutationEntities = 'client' | 'note';
export type MutationOperations = 'create' | 'update' | 'delete';
export type MutationStatus = 'pending' | 'processing' | 'failed';

export interface Mutation {
  id?: number;
  entity: MutationEntities;
  operation: MutationOperations;
  payload: ClientDraft;
  created_at: string;
  status: MutationStatus;
  retry_count: number;
  error_message?: string;
}
