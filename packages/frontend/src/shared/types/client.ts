import { OfflineRecord } from "./common";

export type ClientStatus = 'individual' | 'legal_entity';

export interface ClientDraft {
  name: string;
  email: string;
  phone_number?: string;
  company?: string;
  status: ClientStatus;
}
export interface ClientRecord extends OfflineRecord, ClientDraft {

}
