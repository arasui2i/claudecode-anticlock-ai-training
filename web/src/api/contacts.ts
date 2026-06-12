import apiClient from './client';
import type { PagedResult } from './customers';

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum ContactStatus {
  Active = 0,
  Inactive = 1,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ContactSummary {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
}

export interface ContactDetail {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  accountId: string | null;
  accountName: string | null;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactPayload {
  firstName: string;
  lastName?: string | null;
  email: string;
  phone?: string | null;
  accountId?: string | null;
  status: ContactStatus;
}

export type UpdateContactPayload = CreateContactPayload;

export type ContactsPagedResult = PagedResult<ContactSummary>;

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getContacts(params: {
  search?: string;
  page: number;
  pageSize: number;
}): Promise<ContactsPagedResult> {
  const { data } = await apiClient.get<ContactsPagedResult>('/api/contacts', { params });
  return data;
}

export async function getContactById(id: string): Promise<ContactDetail> {
  const { data } = await apiClient.get<ContactDetail>(`/api/contacts/${id}`);
  return data;
}

export async function createContact(payload: CreateContactPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/api/contacts', payload);
  return data;
}

export async function updateContact(id: string, payload: UpdateContactPayload): Promise<void> {
  await apiClient.put(`/api/contacts/${id}`, payload);
}

export async function deleteContact(id: string): Promise<void> {
  await apiClient.delete(`/api/contacts/${id}`);
}
