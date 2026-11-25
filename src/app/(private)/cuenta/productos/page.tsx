import type { Metadata } from "next";
import { ProductsPage } from "@/components/account/products-form";

export const metadata: Metadata = {
  title: "Productos y servicios",
};

export default function ProductosPage() {
  return <ProductsPage />;
}
