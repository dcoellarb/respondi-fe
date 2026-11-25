import { apiData } from "@/api/client";
import {
  clearAuthSession,
  persistAuthSession,
  persistRefreshedTokens,
} from "@/api/session";
import type {
  AuthSession,
  ConfirmForgotPasswordBody,
  ForgotPasswordBody,
  Message,
  RefreshSession,
  RefreshTokenBody,
  SigninBody,
  SignupBody,
  SocialAuthSession,
  SocialSignInBody,
} from "@/api/types";

export async function signup(body: SignupBody) {
  const data = await apiData<AuthSession>("/auth/signup", {
    method: "POST",
    body,
  });
  persistAuthSession(data);
  return data;
}

export async function signin(body: SigninBody) {
  const data = await apiData<AuthSession>("/auth/signin", {
    method: "POST",
    body,
  });
  persistAuthSession(data);
  return data;
}

export async function socialSignIn(body: SocialSignInBody) {
  const data = await apiData<SocialAuthSession>("/auth/social", {
    method: "POST",
    body,
  });
  persistAuthSession(data);
  return data;
}

export async function forgotPassword(body: ForgotPasswordBody) {
  return apiData<Message>("/auth/forgot-password", {
    method: "POST",
    body,
  });
}

export async function confirmForgotPassword(body: ConfirmForgotPasswordBody) {
  return apiData<Message>("/auth/confirm-forgot-password", {
    method: "POST",
    body,
  });
}

export async function refreshToken(body: RefreshTokenBody) {
  const data = await apiData<RefreshSession>("/auth/refresh", {
    method: "POST",
    body,
  });
  persistRefreshedTokens(data.authResponse);
  return data;
}

export async function signOut() {
  try {
    await apiData<Message>("/auth/signout", {
      method: "POST",
      auth: true,
    });
  } finally {
    clearAuthSession();
  }
}
