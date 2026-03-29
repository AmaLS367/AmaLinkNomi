import { env } from '../config/env';
import { AppError } from '../shared/errors';
import {
  Nomi,
  SendMessageResponse,
  SendRoomMessageResponse,
  ListNomisResponse,
  ListRoomsResponse,
} from './nomi-types';

export class NomiApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? env.NOMI_API_BASE_URL;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${env.NOMI_API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let apiErrorType = 'UnknownError';
      let message = response.statusText;
      try {
        const body = (await response.json()) as { error?: { type?: string; message?: string } };
        apiErrorType = body?.error?.type ?? apiErrorType;
        message = body?.error?.message ?? message;
      } catch {
        // ignore parse failure
      }
      const statusCode = response.status >= 500 ? 502 : response.status;
      throw new AppError(`Nomi API error: ${message}`, apiErrorType, statusCode);
    }

    return response.json() as Promise<T>;
  }

  async listNomis(): Promise<ListNomisResponse> {
    return this.request<ListNomisResponse>('/v1/nomis');
  }

  async getNomi(nomiId: string): Promise<Nomi> {
    return this.request<Nomi>(`/v1/nomis/${nomiId}`);
  }

  async sendMessage(nomiId: string, messageText: string): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>(`/v1/nomis/${nomiId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ messageText }),
    });
  }

  async listRooms(): Promise<ListRoomsResponse> {
    return this.request<ListRoomsResponse>('/v1/rooms');
  }

  async sendRoomMessage(roomId: string, messageText: string): Promise<SendRoomMessageResponse> {
    return this.request<SendRoomMessageResponse>(`/v1/rooms/${roomId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ messageText }),
    });
  }
}

export const nomiClient = new NomiApiClient();
