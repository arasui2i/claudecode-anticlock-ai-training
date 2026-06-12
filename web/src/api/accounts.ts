import apiClient from './client';
import type { PagedResult } from './customers';

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum AccountStatus {
  Active = 0,
  Inactive = 1,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AccountSummary {
  id: string;
  accountName: string;
  industry: string | null;
  phone: string | null;
}

export interface AccountDetail {
  id: string;
  accountName: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountPayload {
  accountName: string;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  status: AccountStatus;
}

export type UpdateAccountPayload = CreateAccountPayload;

export type AccountsPagedResult = PagedResult<AccountSummary>;

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getAccounts(params: {
  search?: string;
  page: number;
  pageSize: number;
}): Promise<AccountsPagedResult> {
  const { data } = await apiClient.get<AccountsPagedResult>('/api/accounts', { params });
  return data;
}

export async function getAccountById(id: string): Promise<AccountDetail> {
  const { data } = await apiClient.get<AccountDetail>(`/api/accounts/${id}`);
  return data;
}

export async function createAccount(payload: CreateAccountPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/api/accounts', payload);
  return data;
}

export async function updateAccount(id: string, payload: UpdateAccountPayload): Promise<void> {
  await apiClient.put(`/api/accounts/${id}`, payload);
}

export async function deleteAccount(id: string): Promise<void> {
  await apiClient.delete(`/api/accounts/${id}`);
}
