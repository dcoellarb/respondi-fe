import type { components } from "@/api/schema";

export type Schemas = components["schemas"];

export type ErrorBody = Schemas["Error"];
export type ScheduleWindow = Schemas["ScheduleWindow"];
export type Profile = Schemas["Profile"];
export type ProfileWrite = Schemas["ProfileWrite"];
export type ProfilePatch = Schemas["ProfilePatch"];
export type Address = Schemas["Address"];
export type AddressWrite = Schemas["AddressWrite"];
export type AddressPatch = Schemas["AddressPatch"];
export type AddressList = Schemas["AddressList"];
export type PricePlan = Schemas["PricePlan"];
export type Product = Schemas["Product"];
export type ProductWrite = Schemas["ProductWrite"];
export type ProductPatch = Schemas["ProductPatch"];
export type ProductPage = Schemas["ProductPage"];
export type Faq = Schemas["Faq"];
export type FaqCreate = Schemas["FaqCreate"];
export type FaqReplace = Schemas["FaqReplace"];
export type FaqPatch = Schemas["FaqPatch"];
export type FaqList = Schemas["FaqList"];
export type Deleted = Schemas["Deleted"];
export type Message = Schemas["Message"];
export type AuthTokens = Schemas["AuthTokens"];
export type AuthUser = Schemas["AuthUser"];
export type AuthSession = Schemas["AuthSession"];
export type SocialAuthSession = Schemas["SocialAuthSession"];
export type RefreshSession = Schemas["RefreshSession"];

export type DataEnvelope<T> = {
  data: T;
};

export type SignupBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type SigninBody = {
  email: string;
  password: string;
};

export type ForgotPasswordBody = {
  email: string;
};

export type ConfirmForgotPasswordBody = {
  email: string;
  confirmationCode: string;
  newPassword: string;
};

export type RefreshTokenBody = {
  refreshToken: string;
};

export type SocialSignInBody = {
  provider: "google";
  idToken: string;
  firstName?: string;
  lastName?: string;
};

export type ListProductsParams = {
  limit?: number;
  cursor?: string;
};

/** Connected WhatsApp Cloud API link (token never included). */
export type WhatsAppConnection = {
  connected: true;
  wabaId: string;
  phoneNumberId: string;
  phoneE164: string;
  connectedAt: string;
  updatedAt: string;
};

export type WhatsAppDisconnected = {
  connected: false;
};

export type WhatsAppConnectionStatus =
  | WhatsAppConnection
  | WhatsAppDisconnected;

export type WhatsAppConnectRequest = {
  code: string;
  wabaId: string;
  phoneNumberId: string;
  pin?: string;
  skipRegister?: boolean;
};
