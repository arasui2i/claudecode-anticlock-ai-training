import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  type CreateOpportunityPayload,
  type UpdateOpportunityPayload,
} from '../api/opportunities';

export const opportunityKeys = {
  list: (params: { search?: string; page: number; pageSize: number }) =>
    ['opportunities', params] as const,
  detail: (id: string) => ['opportunities', id] as const,
};

export function useOpportunities(params: { search?: string; page: number; pageSize: number }) {
  return useQuery({
    queryKey: opportunityKeys.list(params),
    queryFn: () => getOpportunities(params),
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: () => getOpportunityById(id),
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOpportunityPayload) => createOpportunity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOpportunityPayload }) =>
      updateOpportunity(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(id) });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOpportunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}
