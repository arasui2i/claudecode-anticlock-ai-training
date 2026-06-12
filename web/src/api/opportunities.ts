import apiClient from './client';
import type { PagedResult } from './customers';

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum OpportunityStage {
  Prospecting   = 0,
  Qualification = 1,
  Proposal      = 2,
  Negotiation   = 3,
  ClosedWon     = 4,
  ClosedLost    = 5,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OpportunitySummary {
  id: string;
  opportunityName: string;
  accountName: string;
  stage: OpportunityStage;
  expectedRevenue: number | null;
}

export interface OpportunityDetail {
  id: string;
  opportunityName: string;
  accountId: string;
  accountName: string;
  contactId: string | null;
  contactName: string | null;
  stage: OpportunityStage;
  expectedRevenue: number | null;
  closeDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOpportunityPayload {
  opportunityName: string;
  accountId: string;
  contactId?: string | null;
  stage: OpportunityStage;
  expectedRevenue?: number | null;
  closeDate?: string | null;
}

export type UpdateOpportunityPayload = CreateOpportunityPayload;

export type OpportunitiesPagedResult = PagedResult<OpportunitySummary>;

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getOpportunities(params: {
  search?: string;
  page: number;
  pageSize: number;
}): Promise<OpportunitiesPagedResult> {
  const { data } = await apiClient.get<OpportunitiesPagedResult>('/api/opportunities', { params });
  return data;
}

export async function getOpportunityById(id: string): Promise<OpportunityDetail> {
  const { data } = await apiClient.get<OpportunityDetail>(`/api/opportunities/${id}`);
  return data;
}

export async function createOpportunity(payload: CreateOpportunityPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/api/opportunities', payload);
  return data;
}

export async function updateOpportunity(id: string, payload: UpdateOpportunityPayload): Promise<void> {
  await apiClient.put(`/api/opportunities/${id}`, payload);
}

export async function deleteOpportunity(id: string): Promise<void> {
  await apiClient.delete(`/api/opportunities/${id}`);
}
