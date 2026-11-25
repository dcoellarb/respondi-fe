import type { ListProductsParams } from "@/api/types";

export const queryKeys = {
  account: {
    root: ["account"] as const,
  },
  addresses: {
    all: ["addresses"] as const,
    detail: (addressId: string) => ["addresses", addressId] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params: ListProductsParams = {}) =>
      ["products", "list", params] as const,
    detail: (productId: string) => ["products", productId] as const,
  },
  faqs: {
    all: ["faqs"] as const,
    detail: (faqId: string) => ["faqs", faqId] as const,
  },
  whatsapp: {
    root: ["whatsapp"] as const,
  },
  session: {
    root: ["session"] as const,
  },
} as const;
