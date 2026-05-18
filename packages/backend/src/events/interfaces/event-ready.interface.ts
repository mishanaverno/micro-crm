export interface EventReady {
  user_id: string;
  client_id: string;
  order_id?: number | null;
  getPayload: () => Record<string, unknown>;
}
