export interface EventReady {
    user_id: string;
    client_id: string;
    getPayload: () => Record<string, string | number | null>
}