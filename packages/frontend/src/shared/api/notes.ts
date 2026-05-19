import { httpRequest } from './http';
import { NoteDraft, NoteRecord } from '../types/note';
import { PaginatedResponse, PaginationParams } from '../types/pagination';
import { toPaginationQuery } from './pagination';

interface ApiNoteRecord extends Omit<NoteRecord, 'id' | 'sync_status'> {
  id: number | string;
  sync_status?: NoteRecord['sync_status'];
}

function toNoteRecord(note: ApiNoteRecord): NoteRecord {
  return {
    ...note,
    id: String(note.id),
    sync_status: note.sync_status ?? 'synced',
    updated_at: note.updated_at ?? note.created_at,
  };
}

export async function fetchNotesRequest(accessToken: string) {
  const notes = await httpRequest<ApiNoteRecord[]>({
    path: '/notes',
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return notes.map(toNoteRecord);
}

export async function fetchPaginatedNotesRequest(
  accessToken: string,
  pagination: PaginationParams,
) {
  const response = await httpRequest<PaginatedResponse<ApiNoteRecord>>({
    path: `/notes?${toPaginationQuery(pagination)}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...response,
    items: response.items.map(toNoteRecord),
  };
}

export async function createNoteRequest(payload: NoteDraft, accessToken: string) {
  const note = await httpRequest<ApiNoteRecord>({
    path: '/notes',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toNoteRecord(note);
}

export async function updateNoteRequest(
  noteId: string,
  payload: NoteDraft,
  accessToken: string,
) {
  const note = await httpRequest<ApiNoteRecord>({
    path: `/notes/${noteId}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  return toNoteRecord(note);
}

export async function deleteNoteRequest(noteId: string, accessToken: string) {
  return httpRequest<NoteRecord>({
    path: `/notes/${noteId}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
