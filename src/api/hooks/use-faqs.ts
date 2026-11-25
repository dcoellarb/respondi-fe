"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFaq,
  deleteFaq,
  getFaq,
  listFaqs,
  patchFaq,
  putFaq,
} from "@/api/account";
import { queryKeys } from "@/api/query-keys";
import type { FaqCreate, FaqPatch, FaqReplace } from "@/api/types";

export function useFaqs(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.faqs.all,
    queryFn: listFaqs,
    enabled: options?.enabled ?? true,
  });
}

export function useFaq(faqId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.faqs.detail(faqId),
    queryFn: () => getFaq(faqId),
    enabled: (options?.enabled ?? true) && Boolean(faqId),
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FaqCreate) => createFaq(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
  });
}

export function usePutFaq(faqId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FaqReplace) => putFaq(faqId, body),
    onSuccess: (faq) => {
      queryClient.setQueryData(queryKeys.faqs.detail(faqId), faq);
      void queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
  });
}

export function usePatchFaq(faqId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: FaqPatch) => patchFaq(faqId, body),
    onSuccess: (faq) => {
      queryClient.setQueryData(queryKeys.faqs.detail(faqId), faq);
      void queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (faqId: string) => deleteFaq(faqId),
    onSuccess: (_data, faqId) => {
      queryClient.removeQueries({ queryKey: queryKeys.faqs.detail(faqId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
  });
}
