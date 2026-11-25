import { apiData } from "@/api/client";
import type {
  Address,
  AddressList,
  AddressPatch,
  AddressWrite,
  Deleted,
  Faq,
  FaqCreate,
  FaqList,
  FaqPatch,
  FaqReplace,
  ListProductsParams,
  Product,
  ProductPage,
  ProductPatch,
  ProductWrite,
  Profile,
  ProfilePatch,
  ProfileWrite,
  WhatsAppConnectRequest,
  WhatsAppConnection,
  WhatsAppConnectionStatus,
  WhatsAppDisconnected,
} from "@/api/types";

export function getAccount() {
  return apiData<Profile>("/account", { auth: true });
}

export function putAccount(body: ProfileWrite) {
  return apiData<Profile>("/account", {
    method: "PUT",
    body,
    auth: true,
  });
}

export function patchAccount(body: ProfilePatch) {
  return apiData<Profile>("/account", {
    method: "PATCH",
    body,
    auth: true,
  });
}

export function listAddresses() {
  return apiData<AddressList>("/account/addresses", { auth: true });
}

export function createAddress(body: AddressWrite) {
  return apiData<Address>("/account/addresses", {
    method: "POST",
    body,
    auth: true,
  });
}

export function getAddress(addressId: string) {
  return apiData<Address>(`/account/addresses/${addressId}`, { auth: true });
}

export function putAddress(addressId: string, body: AddressWrite) {
  return apiData<Address>(`/account/addresses/${addressId}`, {
    method: "PUT",
    body,
    auth: true,
  });
}

export function patchAddress(addressId: string, body: AddressPatch) {
  return apiData<Address>(`/account/addresses/${addressId}`, {
    method: "PATCH",
    body,
    auth: true,
  });
}

export function deleteAddress(addressId: string) {
  return apiData<Deleted>(`/account/addresses/${addressId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function listProducts(params: ListProductsParams = {}) {
  return apiData<ProductPage>("/account/products", {
    auth: true,
    query: {
      limit: params.limit,
      cursor: params.cursor,
    },
  });
}

export function createProduct(body: ProductWrite) {
  return apiData<Product>("/account/products", {
    method: "POST",
    body,
    auth: true,
  });
}

export function getProduct(productId: string) {
  return apiData<Product>(`/account/products/${productId}`, { auth: true });
}

export function putProduct(productId: string, body: ProductWrite) {
  return apiData<Product>(`/account/products/${productId}`, {
    method: "PUT",
    body,
    auth: true,
  });
}

export function patchProduct(productId: string, body: ProductPatch) {
  return apiData<Product>(`/account/products/${productId}`, {
    method: "PATCH",
    body,
    auth: true,
  });
}

export function deleteProduct(productId: string) {
  return apiData<Deleted>(`/account/products/${productId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function listFaqs() {
  return apiData<FaqList>("/account/faqs", { auth: true });
}

export function createFaq(body: FaqCreate) {
  return apiData<Faq>("/account/faqs", {
    method: "POST",
    body,
    auth: true,
  });
}

export function getFaq(faqId: string) {
  return apiData<Faq>(`/account/faqs/${faqId}`, { auth: true });
}

export function putFaq(faqId: string, body: FaqReplace) {
  return apiData<Faq>(`/account/faqs/${faqId}`, {
    method: "PUT",
    body,
    auth: true,
  });
}

export function patchFaq(faqId: string, body: FaqPatch) {
  return apiData<Faq>(`/account/faqs/${faqId}`, {
    method: "PATCH",
    body,
    auth: true,
  });
}

export function deleteFaq(faqId: string) {
  return apiData<Deleted>(`/account/faqs/${faqId}`, {
    method: "DELETE",
    auth: true,
  });
}

export function getWhatsAppConnection() {
  return apiData<WhatsAppConnectionStatus>("/account/whatsapp", {
    auth: true,
  });
}

export function connectWhatsApp(body: WhatsAppConnectRequest) {
  return apiData<WhatsAppConnection>("/account/whatsapp/connect", {
    method: "POST",
    body,
    auth: true,
  });
}

export function disconnectWhatsApp() {
  return apiData<WhatsAppDisconnected>("/account/whatsapp", {
    method: "DELETE",
    auth: true,
  });
}
