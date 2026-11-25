"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAddress,
  deleteAddress,
  getAddress,
  listAddresses,
  patchAddress,
  putAddress,
} from "@/api/account";
import { queryKeys } from "@/api/query-keys";
import type { AddressPatch, AddressWrite } from "@/api/types";

export function useAddresses(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.addresses.all,
    queryFn: listAddresses,
    enabled: options?.enabled ?? true,
  });
}

export function useAddress(addressId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.addresses.detail(addressId),
    queryFn: () => getAddress(addressId),
    enabled: (options?.enabled ?? true) && Boolean(addressId),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddressWrite) => createAddress(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function usePutAddress(addressId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddressWrite) => putAddress(addressId, body),
    onSuccess: (address) => {
      queryClient.setQueryData(queryKeys.addresses.detail(addressId), address);
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function usePatchAddress(addressId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddressPatch) => patchAddress(addressId, body),
    onSuccess: (address) => {
      queryClient.setQueryData(queryKeys.addresses.detail(addressId), address);
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressId: string) => deleteAddress(addressId),
    onSuccess: (_data, addressId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.addresses.detail(addressId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.addresses.all });
    },
  });
}
