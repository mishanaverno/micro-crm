import { OfflineRecord } from "./common";

export interface ClientDraft {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  company?: string;
}
export interface ClientRecord extends OfflineRecord, ClientDraft {

}
