"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  confirmForgotPassword,
  forgotPassword,
  refreshToken,
  signin,
  signOut,
  signup,
  socialSignIn,
} from "@/api/auth";
import { queryKeys } from "@/api/query-keys";
import { getRefreshToken } from "@/api/session";
import type {
  ConfirmForgotPasswordBody,
  ForgotPasswordBody,
  SigninBody,
  SignupBody,
  SocialSignInBody,
} from "@/api/types";

function useClearPrivateQueries() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.removeQueries({ queryKey: queryKeys.account.root });
    void queryClient.removeQueries({ queryKey: queryKeys.addresses.all });
    void queryClient.removeQueries({ queryKey: queryKeys.products.all });
    void queryClient.removeQueries({ queryKey: queryKeys.faqs.all });
    void queryClient.removeQueries({ queryKey: queryKeys.session.root });
  };
}

/** Auth mutations for forms. Prefer calling from client entry points. */
export function useSignup() {
  return useMutation({
    mutationFn: (body: SignupBody) => signup(body),
  });
}

export function useSignin() {
  return useMutation({
    mutationFn: (body: SigninBody) => signin(body),
  });
}

export function useSocialSignIn() {
  return useMutation({
    mutationFn: (body: SocialSignInBody) => socialSignIn(body),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (body: ForgotPasswordBody) => forgotPassword(body),
  });
}

export function useConfirmForgotPassword() {
  return useMutation({
    mutationFn: (body: ConfirmForgotPasswordBody) =>
      confirmForgotPassword(body),
  });
}

export function useRefreshSession() {
  return useMutation({
    mutationFn: async () => {
      const token = getRefreshToken();
      if (!token) {
        throw new Error("Missing refresh token.");
      }
      return refreshToken({ refreshToken: token });
    },
  });
}

export function useSignOut() {
  const clearPrivateQueries = useClearPrivateQueries();

  return useMutation({
    mutationFn: () => signOut(),
    onSettled: () => {
      clearPrivateQueries();
    },
  });
}
