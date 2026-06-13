import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  type CreateActivityPayload,
  type UpdateActivityPayload,
} from '../api/activities';

export const activityKeys = {
  list: (params: { search?: string; page: number; pageSize: number }) =>
    ['activities', params] as const,
  detail: (id: string) => ['activities', id] as const,
};

export function useActivities(params: { search?: string; page: number; pageSize: number }) {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => getActivities(params),
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: activityKeys.detail(id),
    queryFn: () => getActivityById(id),
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateActivityPayload) => createActivity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateActivityPayload }) =>
      updateActivity(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: activityKeys.detail(id) });
    },
  });
}

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteActivity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
