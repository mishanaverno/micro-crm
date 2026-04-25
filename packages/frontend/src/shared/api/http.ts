import { env } from '../lib/env';

export class NetworkError extends Error {
  constructor(message = 'Network unavailable') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  path: string;
}

export async function httpRequest<T>({ path, ...init }: RequestOptions): Promise<T> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    };

    const response = await fetch(`${env.apiBaseUrl}${path}`, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new HttpError(response.status, message || response.statusText);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new NetworkError(error instanceof Error ? error.message : 'Network unavailable');
  }
}
