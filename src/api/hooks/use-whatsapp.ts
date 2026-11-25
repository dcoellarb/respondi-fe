"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  connectWhatsApp,
  disconnectWhatsApp,
  getWhatsAppConnection,
} from "@/api/account";
import { queryKeys } from "@/api/query-keys";
import type { WhatsAppConnectRequest } from "@/api/types";

export function useWhatsAppConnection(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.whatsapp.root,
    queryFn: getWhatsAppConnection,
    enabled: options?.enabled ?? true,
  });
}

export function useConnectWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: WhatsAppConnectRequest) => connectWhatsApp(body),
    onSuccess: (connection) => {
      queryClient.setQueryData(queryKeys.whatsapp.root, connection);
      // Profile phone may sync from Meta display number.
      void queryClient.invalidateQueries({ queryKey: queryKeys.account.root });
    },
  });
}

export function useDisconnectWhatsApp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => disconnectWhatsApp(),
    onSuccess: (status) => {
      queryClient.setQueryData(queryKeys.whatsapp.root, status);
    },
  });
}
