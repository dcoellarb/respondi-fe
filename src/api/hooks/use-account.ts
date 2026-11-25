"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAccount,
  patchAccount,
  putAccount,
} from "@/api/account";
import { isApiError } from "@/api/errors";
import { queryKeys } from "@/api/query-keys";
import type { Profile, ProfilePatch, ProfileWrite } from "@/api/types";

async function fetchAccountOrNull(): Promise<Profile | null> {
  try {
    return await getAccount();
  } catch (error) {
    if (isApiError(error) && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export function useAccount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.account.root,
    queryFn: fetchAccountOrNull,
    enabled: options?.enabled ?? true,
  });
}

export function usePutAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProfileWrite) => putAccount(body),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.account.root, profile);
    },
  });
}

export function usePatchAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProfilePatch) => patchAccount(body),
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.account.root, profile);
    },
  });
}
