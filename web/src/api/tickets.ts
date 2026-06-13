import apiClient from './client';
import type { PagedResult } from './customers';

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum TicketPriority {
  Low      = 0,
  Medium   = 1,
  High     = 2,
  Critical = 3,
}

export enum TicketStatus {
  Open       = 0,
  InProgress = 1,
  Resolved   = 2,
  Closed     = 3,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TicketSummary {
  id: string;
  ticketNumber: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
}

export interface TicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  accountId: string | null;
  accountName: string | null;
  contactId: string | null;
  contactName: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketPayload {
  subject: string;
  accountId?: string | null;
  contactId?: string | null;
  priority: TicketPriority;
  status: TicketStatus;
}

export type UpdateTicketPayload = CreateTicketPayload;

export type TicketsPagedResult = PagedResult<TicketSummary>;

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getTickets(params: {
  search?: string;
  page: number;
  pageSize: number;
}): Promise<TicketsPagedResult> {
  const { data } = await apiClient.get<TicketsPagedResult>('/api/tickets', { params });
  return data;
}

export async function getTicketById(id: string): Promise<TicketDetail> {
  const { data } = await apiClient.get<TicketDetail>(`/api/tickets/${id}`);
  return data;
}

export async function createTicket(payload: CreateTicketPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/api/tickets', payload);
  return data;
}

export async function updateTicket(id: string, payload: UpdateTicketPayload): Promise<void> {
  await apiClient.put(`/api/tickets/${id}`, payload);
}

export async function deleteTicket(id: string): Promise<void> {
  await apiClient.delete(`/api/tickets/${id}`);
}
