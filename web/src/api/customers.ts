import apiClient from './client';

// ── Enums ─────────────────────────────────────────────────────────────────────

// Values mirror the backend C# enum integer serialization
export enum CustomerStatus {
  Lead = 0,
  Prospect = 1,
  Active = 2,
  Inactive = 3,
}

export enum Gender {
  Male = 0,
  Female = 1,
  Other = 2,
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CustomerSummary {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  email: string;
  status: CustomerStatus;
  jobTitle: string | null;
  createdAt: string;
}

export interface CustomerDetail {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  status: CustomerStatus;
  jobTitle: string | null;
  gender: Gender | null;
  age: number | null;
  email: string;
  phoneNumber: string | null;
  industry: string | null;
  annualIncome: number | null;
  employeeCount: number | null;
  headquartersAddress: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  firstName: string;
  lastName: string;
  company?: string | null;
  status: CustomerStatus;
  jobTitle?: string | null;
  gender?: Gender | null;
  age?: number | null;
  email: string;
  phoneNumber?: string | null;
  industry?: string | null;
  annualIncome?: number | null;
  employeeCount?: number | null;
  headquartersAddress?: string | null;
}

export type UpdateCustomerPayload = CreateCustomerPayload;

// ── API calls ─────────────────────────────────────────────────────────────────

export async function getCustomers(params: {
  search?: string;
  page: number;
  pageSize: number;
}): Promise<PagedResult<CustomerSummary>> {
  const { data } = await apiClient.get<PagedResult<CustomerSummary>>('/api/customers', { params });
  return data;
}

export async function getCustomerById(id: string): Promise<CustomerDetail> {
  const { data } = await apiClient.get<CustomerDetail>(`/api/customers/${id}`);
  return data;
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/api/customers', payload);
  return data;
}

export async function updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<void> {
  await apiClient.put(`/api/customers/${id}`, payload);
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/api/customers/${id}`);
}
