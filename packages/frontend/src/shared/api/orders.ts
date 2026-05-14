import { httpRequest } from './http';
import { OrderDraft, OrderRecord, UpdateOrderDraft } from '../types/order';

interface ApiOrderRecord extends Omit<OrderRecord, 'id' | 'sync_status'> {
  id: number | string;
  sync_status?: OrderRecord['sync_status'];
}

function toOrderRecord(order: ApiOrderRecord): OrderRecord {
  return {
    ...order,
    id: String(order.id),
    price: Number(order.price),
    sync_status: order.sync_status ?? 'synced',
    updated_at: order.updated_at ?? order.created_at,
  };
}

export async function fetchOrdersRequest(accessToken: string) {
  const orders = await httpRequest<ApiOrderRecord[]>({
    path: '/orders',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return orders.map(toOrderRecord);
}

export async function createOrderRequest(payload: OrderDraft, accessToken: string) {
  const order = await httpRequest<ApiOrderRecord>({
    path: '/orders',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toOrderRecord(order);
}

export async function updateOrderRequest(
  orderId: string,
  payload: UpdateOrderDraft,
  accessToken: string,
) {
  const order = await httpRequest<ApiOrderRecord>({
    path: `/orders/${orderId}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toOrderRecord(order);
}

export async function deleteOrderRequest(orderId: string, accessToken: string) {
  return httpRequest<OrderRecord>({
    path: `/orders/${orderId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
