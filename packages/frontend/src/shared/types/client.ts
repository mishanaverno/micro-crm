export interface ClientDraft {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  company?: string;
  address?: string;
}

export interface ClientRecord extends ClientDraft {
  id: string;
  sync_status: 'synced' | 'pending' | 'failed';
  created_at: string;
}
