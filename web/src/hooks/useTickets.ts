import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  type CreateTicketPayload,
  type UpdateTicketPayload,
} from '../api/tickets';

export const ticketKeys = {
  list: (params: { search?: string; page: number; pageSize: number }) =>
    ['tickets', params] as const,
  detail: (id: string) => ['tickets', id] as const,
};

export function useTickets(params: { search?: string; page: number; pageSize: number }) {
  return useQuery({
    queryKey: ticketKeys.list(params),
    queryFn: () => getTickets(params),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ticketKeys.detail(id),
    queryFn: () => getTicketById(id),
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTicketPayload) => createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTicketPayload }) =>
      updateTicket(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ticketKeys.detail(id) });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}
