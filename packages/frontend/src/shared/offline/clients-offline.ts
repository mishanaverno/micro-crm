import { ClientDraft, ClientRecord } from "../types/client";
import { OfflineRespository } from "../types/common";

export const clientsRepository: OfflineRespository<ClientDraft, ClientRecord> = {
    createLocal: (payload: ClientDraft): ClientRecord => {
        return {
            id: crypto.randomUUID(),
            ...payload,
            sync_status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    }
}