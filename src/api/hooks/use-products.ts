"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  patchProduct,
  putProduct,
} from "@/api/account";
import { queryKeys } from "@/api/query-keys";
import type {
  ListProductsParams,
  ProductPatch,
  ProductWrite,
} from "@/api/types";

export function useProducts(
  params: ListProductsParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => listProducts(params),
    enabled: options?.enabled ?? true,
  });
}

export function useProduct(productId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => getProduct(productId),
    enabled: (options?.enabled ?? true) && Boolean(productId),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProductWrite) => createProduct(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function usePutProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProductWrite) => putProduct(productId, body),
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.products.detail(productId), product);
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function usePatchProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProductPatch) => patchProduct(productId, body),
    onSuccess: (product) => {
      queryClient.setQueryData(queryKeys.products.detail(productId), product);
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: (_data, productId) => {
      queryClient.removeQueries({
        queryKey: queryKeys.products.detail(productId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}
