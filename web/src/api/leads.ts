import apiClient from './client';
import type { PagedResult } from './customers';

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum LeadStatus {
  New = 0,
  Contacted = 1,
  Qualified = 2,
  Unqualified = 3,
  Converted = 4,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LeadSummary {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  status: LeadStatus;
}

export interface LeadDetail {
  id: string;
  firstName: string;
  lastName: string | null;
  companyName: string;
  email: string;
  phone: string | null;
  status: LeadStatus;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadPayload {
  firstName: string;
  lastName?: string | null;
  companyName: string;
  email: string;
  phone?: string | null;
  status: LeadStatus;
  ownerId?: string | null;
}

export type UpdateLeadPayload = CreateLeadPayload;

export type LeadsPagedResult = PagedResult<LeadSummary>;

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getLeads(params: {
  search?: string;
  page: number;
  pageSize: number;
}): Promise<LeadsPagedResult> {
  const { data } = await apiClient.get<LeadsPagedResult>('/api/leads', { params });
  return data;
}

export async function getLeadById(id: string): Promise<LeadDetail> {
  const { data } = await apiClient.get<LeadDetail>(`/api/leads/${id}`);
  return data;
}

export async function createLead(payload: CreateLeadPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/api/leads', payload);
  return data;
}

export async function updateLead(id: string, payload: UpdateLeadPayload): Promise<void> {
  await apiClient.put(`/api/leads/${id}`, payload);
}

export async function deleteLead(id: string): Promise<void> {
  await apiClient.delete(`/api/leads/${id}`);
}
