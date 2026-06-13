import apiClient from './client';
import type { PagedResult } from './customers';

// ── Enums ─────────────────────────────────────────────────────────────────────

export enum ActivityType {
  Call    = 0,
  Email   = 1,
  Meeting = 2,
  Task    = 3,
  Note    = 4,
}

export enum ActivityStatus {
  Open       = 0,
  InProgress = 1,
  Completed  = 2,
  Cancelled  = 3,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ActivitySummary {
  id: string;
  subject: string;
  activityType: ActivityType;
  dueDate: string;
  status: ActivityStatus;
}

export interface ActivityDetail {
  id: string;
  subject: string;
  activityType: ActivityType;
  dueDate: string;
  status: ActivityStatus;
  assignedTo: string | null;
  assignedUserName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivityPayload {
  subject: string;
  activityType: ActivityType;
  dueDate: string;
  status: ActivityStatus;
}

export type UpdateActivityPayload = CreateActivityPayload;

export type ActivitiesPagedResult = PagedResult<ActivitySummary>;

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getActivities(params: {
  search?: string;
  page: number;
  pageSize: number;
}): Promise<ActivitiesPagedResult> {
  const { data } = await apiClient.get<ActivitiesPagedResult>('/api/activities', { params });
  return data;
}

export async function getActivityById(id: string): Promise<ActivityDetail> {
  const { data } = await apiClient.get<ActivityDetail>(`/api/activities/${id}`);
  return data;
}

export async function createActivity(payload: CreateActivityPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/api/activities', payload);
  return data;
}

export async function updateActivity(id: string, payload: UpdateActivityPayload): Promise<void> {
  await apiClient.put(`/api/activities/${id}`, payload);
}

export async function deleteActivity(id: string): Promise<void> {
  await apiClient.delete(`/api/activities/${id}`);
}
