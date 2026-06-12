import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  type CreateContactPayload,
  type UpdateContactPayload,
} from '../api/contacts';

export const contactKeys = {
  list: (params: { search?: string; page: number; pageSize: number }) =>
    ['contacts', params] as const,
  detail: (id: string) => ['contacts', id] as const,
};

export function useContacts(params: { search?: string; page: number; pageSize: number }) {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => getContacts(params),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => getContactById(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContactPayload) => createContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateContactPayload }) =>
      updateContact(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
