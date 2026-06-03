import { httpRequest } from './http';
import { OrderDraft, OrderRecord, OrderStatus, UpdateOrderDraft } from '../types/order';
import { PaginatedResponse, PaginationParams } from '../types/pagination';
import { toPaginationQuery } from './pagination';

interface OrdersRequestFilters {
  clientId?: string;
  status?: OrderStatus;
}

interface OrdersSortOptions {
  sortBy?: 'created_at' | 'updated_at' | 'price' | 'status';
  sortDirection?: 'asc' | 'desc';
}

interface ApiOrderRecord extends Omit<OrderRecord, 'id' | 'sync_status' | 'status'> {
  id: number | string;
  status: OrderStatus | 'reopened';
  sync_status?: OrderRecord['sync_status'];
}

function toOrderStatus(status: ApiOrderRecord['status']): OrderStatus {
  return status === 'reopened' ? 'created' : status;
}

function toOrderRecord(order: ApiOrderRecord): OrderRecord {
  return {
    ...order,
    id: String(order.id),
    price: Number(order.price),
    status: toOrderStatus(order.status),
    sync_status: order.sync_status ?? 'synced',
    updated_at: order.updated_at ?? order.created_at,
  };
}

function toOrdersQuery(filters?: OrdersRequestFilters) {
  const params = new URLSearchParams();

  if (filters?.clientId) {
    params.set('client_id', filters.clientId);
  }

  if (filters?.status) {
    params.set('status', filters.status);
  }

  const query = params.toString();

  return query ? `?${query}` : '';
}

export async function fetchOrdersRequest(
  accessToken: string,
  filters?: OrdersRequestFilters,
) {
  const orders = await httpRequest<ApiOrderRecord[]>({
    path: `/orders${toOrdersQuery(filters)}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return orders.map(toOrderRecord);
}

export async function fetchOrderRequest(orderId: string, accessToken: string) {
  const order = await httpRequest<ApiOrderRecord>({
    path: `/orders/${orderId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return toOrderRecord(order);
}

export async function fetchPaginatedOrdersRequest(
  accessToken: string,
  pagination: PaginationParams,
  filters?: OrdersRequestFilters,
  sort?: OrdersSortOptions,
) {
  const params = new URLSearchParams(toPaginationQuery(pagination));

  if (filters?.clientId) {
    params.set('client_id', filters.clientId);
  }

  if (filters?.status) {
    params.set('status', filters.status);
  }

  if (sort?.sortBy) {
    params.set('sortBy', sort.sortBy);
  }

  if (sort?.sortDirection) {
    params.set('sortDirection', sort.sortDirection);
  }

  const response = await httpRequest<PaginatedResponse<ApiOrderRecord>>({
    path: `/orders?${params.toString()}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...response,
    items: response.items.map(toOrderRecord),
  };
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
