export interface ClientDraft {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  company?: string;
}

export interface ClientRecord extends ClientDraft {
  id: string;
  user_id?: string;
  sync_status: 'synced' | 'pending' | 'failed';
  created_at: string;
  updated_at?: string;
}
