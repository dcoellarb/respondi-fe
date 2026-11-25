"use client";

import {
  Formik,
  type FormikErrors,
  type FormikHelpers,
  type FormikTouched,
} from "formik";
import { useMemo, useState } from "react";
import * as Yup from "yup";
import { listProducts, putProduct } from "@/api/account";
import {
  useAccount,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
} from "@/api/hooks";
import { queryKeys } from "@/api/query-keys";
import type { Product, ProductWrite } from "@/api/types";
import { accountNav } from "@/components/account/account-nav";
import { AccountSectionAnalytics } from "@/components/account/account-section-analytics";
import { KindHelp } from "@/components/account/kind-help";
import { useAccordionOpenIds } from "@/components/account/use-accordion-open-ids";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { TextArea } from "@/components/ui/text-area";
import { TextField } from "@/components/ui/text-field";
import {
  trackAccountSectionSaveFailed,
  trackAccountSectionSaveSuccess,
} from "@/lib/account-analytics";
import { ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { accountErrorMessage } from "@/lib/account-messages";
import {
  PRICE_DECIMAL_PATTERN,
  formatMinorAsDecimal,
  parseDecimalToMinor,
} from "@/lib/money";
import { parseProductMeta, stripProductMeta } from "@/lib/product-meta";
import { useQueryClient } from "@tanstack/react-query";

const productosNav = accountNav.find(
  (item) => item.href === "/cuenta/productos",
)!;

const NAME_MAX = 160;
const DESCRIPTION_MAX = 4000;
const PLANS_MAX = 10;
const PLAN_NAME_MAX = 80;
const RULES_MAX = 2000;
const DEFAULT_CURRENCY = "USD";

type PlanEntry = {
  name: string;
  price: string;
  rules: string;
};

type ProductEntry = {
  clientId: string;
  serverId?: string;
  kind: "product" | "service";
  name: string;
  description: string;
  price: string;
  priceRules: string;
  pricingRules: string;
  plans: PlanEntry[];
  currency: string;
};

type ProductsFormValues = {
  items: ProductEntry[];
};

function newClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyPlan(): PlanEntry {
  return { name: "", price: "", rules: "" };
}

function emptyProductEntry(
  kind: "product" | "service" = "service",
): ProductEntry {
  return {
    clientId: newClientId(),
    kind,
    name: "",
    description: "",
    price: "",
    priceRules: "",
    pricingRules: "",
    plans: kind === "service" ? [emptyPlan()] : [],
    currency: DEFAULT_CURRENCY,
  };
}

function entryFromProduct(product: Product): ProductEntry {
  const meta = parseProductMeta(product.description);
  const kind =
    product.kind === "product" || product.kind === "service"
      ? product.kind
      : meta?.kind === "product"
        ? "product"
        : "service";
  const plansSource =
    product.plans?.length ? product.plans : meta?.plans?.length ? meta.plans : null;
  const plans =
    kind === "service"
      ? plansSource
        ? plansSource.map((plan) => ({
            name: plan.name,
            price: formatMinorAsDecimal(plan.priceMinor),
            rules: plan.rules ?? "",
          }))
        : [
            {
              name: "Plan",
              price: formatMinorAsDecimal(product.priceMinor),
              rules: "",
            },
          ]
      : [];
  return {
    clientId: product.id,
    serverId: product.id,
    kind,
    name: product.name,
    description: stripProductMeta(product.description ?? ""),
    price:
      kind === "product" ? formatMinorAsDecimal(product.priceMinor) : "",
    priceRules: product.priceRules ?? meta?.priceRules ?? "",
    pricingRules: product.pricingRules ?? meta?.pricingRules ?? "",
    plans,
    currency: product.currency || DEFAULT_CURRENCY,
  };
}

function productTitle(entry: ProductEntry, index: number) {
  return entry.name.trim() || `Ítem ${index + 1}`;
}

function priceSummary(entry: ProductEntry) {
  if (entry.kind === "product") {
    return entry.price.trim()
      ? `${entry.currency} ${entry.price.trim()}`
      : null;
  }
  const priced = entry.plans
    .map((plan) => parseDecimalToMinor(plan.price))
    .filter((value): value is number => value !== null);
  if (priced.length === 0) return null;
  const lowest = Math.min(...priced);
  return `desde ${entry.currency} ${formatMinorAsDecimal(lowest)}`;
}

function toProductWrite(entry: ProductEntry): ProductWrite {
  const currency = entry.currency.trim().toUpperCase() || DEFAULT_CURRENCY;
  const description =
    stripProductMeta(entry.description).trim() || null;

  if (entry.kind === "service") {
    const plans = entry.plans.map((plan) => {
      const priceMinor = parseDecimalToMinor(plan.price);
      if (priceMinor === null) {
        throw new Error("Precio de plan inválido.");
      }
      return {
        name: plan.name.trim(),
        priceMinor,
        rules: plan.rules.trim() || null,
      };
    });
    const priceMinor = Math.min(...plans.map((plan) => plan.priceMinor));
    return {
      name: entry.name.trim(),
      description,
      kind: "service",
      priceMinor,
      priceRules: null,
      pricingRules: entry.pricingRules.trim() || null,
      plans,
      currency,
      imageUrls: [],
    };
  }

  const priceMinor = parseDecimalToMinor(entry.price);
  if (priceMinor === null) {
    throw new Error("Precio inválido.");
  }

  return {
    name: entry.name.trim(),
    description,
    kind: "product",
    priceMinor,
    priceRules: entry.priceRules.trim() || null,
    pricingRules: null,
    plans: [],
    currency,
    imageUrls: [],
  };
}

function showError(
  submitCount: number,
  touched: boolean | undefined,
  error: string | undefined,
) {
  return (submitCount > 0 || touched) && error ? error : undefined;
}

const priceFieldSchema = Yup.string()
  .trim()
  .required("Escribe el precio.")
  .matches(
    PRICE_DECIMAL_PATTERN,
    "Usa un precio válido, por ejemplo 15 o 15.50.",
  )
  .test(
    "parse-price",
    "Usa un precio válido, por ejemplo 15 o 15.50.",
    (value) => (value ? parseDecimalToMinor(value) !== null : false),
  );

const rulesFieldSchema = Yup.string()
  .trim()
  .max(RULES_MAX, `Máximo ${RULES_MAX} caracteres.`);

const planSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Escribe el nombre del plan.")
    .max(PLAN_NAME_MAX, `Máximo ${PLAN_NAME_MAX} caracteres.`),
  price: priceFieldSchema,
  rules: rulesFieldSchema,
});

const baseEntrySchema = Yup.object({
  kind: Yup.mixed<"product" | "service">()
    .oneOf(["product", "service"])
    .required(),
  name: Yup.string()
    .trim()
    .required("Escribe el nombre.")
    .max(NAME_MAX, `Máximo ${NAME_MAX} caracteres.`),
  description: Yup.string()
    .trim()
    .required("Escribe la descripción.")
    .max(DESCRIPTION_MAX, `Máximo ${DESCRIPTION_MAX} caracteres.`),
  currency: Yup.string()
    .trim()
    .required("Escribe la moneda.")
    .length(3, "Usa el código de 3 letras, por ejemplo USD."),
});

const productEntrySchema = baseEntrySchema.shape({
  price: priceFieldSchema,
  priceRules: rulesFieldSchema,
  pricingRules: Yup.string().trim(),
  plans: Yup.array().max(0),
});

const serviceEntrySchema = baseEntrySchema.shape({
  price: Yup.string().trim(),
  priceRules: Yup.string().trim(),
  pricingRules: rulesFieldSchema,
  plans: Yup.array()
    .of(planSchema)
    .min(1, "Agrega al menos un plan.")
    .max(PLANS_MAX, `Máximo ${PLANS_MAX} planes.`),
});

function assignYupErrors(
  error: Yup.ValidationError,
  entryError: FormikErrors<ProductEntry>,
) {
  for (const item of error.inner.length ? error.inner : [error]) {
    if (!item.path) {
      if (item.message) {
        entryError.plans = item.message as unknown as FormikErrors<PlanEntry>[];
      }
      continue;
    }

    const planMatch =
      /^plans(?:\[(\d+)\]|\.(\d+))\.(name|price|rules)$/.exec(item.path);
    if (planMatch) {
      const planIndex = Number(planMatch[1] ?? planMatch[2]);
      const field = planMatch[3] as "name" | "price" | "rules";
      const plans = Array.isArray(entryError.plans)
        ? [...(entryError.plans as FormikErrors<PlanEntry>[])]
        : [];
      plans[planIndex] = {
        ...plans[planIndex],
        [field]: item.message,
      };
      entryError.plans = plans;
      continue;
    }

    if (item.path === "plans") {
      entryError.plans = item.message as never;
      continue;
    }

    (entryError as Record<string, string>)[item.path] = item.message;
  }
}

async function validateProductsForm(
  values: ProductsFormValues,
): Promise<FormikErrors<ProductsFormValues>> {
  const errors: FormikErrors<ProductsFormValues> = {};
  const itemErrors: FormikErrors<ProductEntry>[] = [];

  if (values.items.length === 0) {
    errors.items =
      "Agrega al menos un producto o servicio." as unknown as FormikErrors<ProductEntry>[];
    return errors;
  }

  for (const entry of values.items) {
    const entryError: FormikErrors<ProductEntry> = {};
    const schema =
      entry.kind === "service" ? serviceEntrySchema : productEntrySchema;
    try {
      await schema.validate(entry, { abortEarly: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        assignYupErrors(error, entryError);
      }
    }
    itemErrors.push(entryError);
  }

  if (itemErrors.some((entry) => Object.keys(entry).length > 0)) {
    errors.items = itemErrors;
  }

  return errors;
}
async function fetchAllProducts() {
  const items: Product[] = [];
  let cursor: string | undefined;
  do {
    const page = await listProducts({ limit: 50, cursor });
    items.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return items;
}

export function ProductsPage() {
  const queryClient = useQueryClient();
  const account = useAccount();
  const productsQuery = useProducts(
    { limit: 50 },
    { enabled: Boolean(account.data) },
  );
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const initialValues = useMemo<ProductsFormValues>(() => {
    const items = productsQuery.data?.items ?? [];
    if (items.length === 0) {
      return { items: [emptyProductEntry()] };
    }
    return { items: items.map(entryFromProduct) };
  }, [productsQuery.data?.items]);

  const initialOpenId = initialValues.items[0]?.clientId ?? null;
  const accordion = useAccordionOpenIds(initialOpenId);

  async function onSubmit(
    values: ProductsFormValues,
    helpers: FormikHelpers<ProductsFormValues>,
  ) {
    setFormError(null);
    setSavedMessage(null);

    if (!account.data) {
      setFormError("Primero guarda los datos del negocio.");
      helpers.setSubmitting(false);
      return;
    }

    try {
      const existing = await fetchAllProducts();
      const keptServerIds = new Set(
        values.items
          .map((entry) => entry.serverId)
          .filter((id): id is string => Boolean(id)),
      );

      // Create / update first so a failed write never leaves the catalog empty.
      for (const entry of values.items) {
        const body = toProductWrite(entry);
        if (entry.serverId) {
          await putProduct(entry.serverId, body);
        } else {
          const created = await createProduct.mutateAsync(body);
          entry.serverId = created.id;
          keptServerIds.add(created.id);
        }
      }

      for (const product of existing) {
        if (!keptServerIds.has(product.id)) {
          await deleteProduct.mutateAsync(product.id);
        }
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.products.all,
      });
      await productsQuery.refetch();
      trackAccountSectionSaveSuccess(ANALYTICS_SECTIONS.PRODUCTOS, {
        pagePath: "/cuenta/productos",
        itemCount: values.items.length,
      });
      setSavedMessage("Productos y servicios guardados.");
      helpers.setSubmitting(false);
    } catch (error) {
      trackAccountSectionSaveFailed(
        ANALYTICS_SECTIONS.PRODUCTOS,
        error,
        "/cuenta/productos",
      );
      setFormError(accountErrorMessage(error));
      helpers.setSubmitting(false);
    }
  }

  if (account.isLoading || (account.data && productsQuery.isLoading)) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{productosNav.label}</h1>
        <p className="text-body text-muted">Cargando productos y servicios…</p>
      </div>
    );
  }

  if (account.isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{productosNav.label}</h1>
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(account.error)}
        </p>
      </div>
    );
  }

  if (!account.data) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{productosNav.label}</h1>
        <Callout>
          Primero completa y guarda los datos del negocio. Después podrás
          agregar productos y servicios.
        </Callout>
      </div>
    );
  }

  if (productsQuery.isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{productosNav.label}</h1>
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(productsQuery.error)}
        </p>
        <Button type="button" onClick={() => void productsQuery.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AccountSectionAnalytics section={ANALYTICS_SECTIONS.PRODUCTOS} />
      <h1 className="text-page-title">{productosNav.label}</h1>

      <Formik<ProductsFormValues>
        initialValues={initialValues}
        enableReinitialize
        validate={validateProductsForm}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={onSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          setFieldValue,
          submitCount,
        }) => {
          function addItem(kind: "product" | "service") {
            const entry = emptyProductEntry(kind);
            void setFieldValue("items", [...values.items, entry]);
            accordion.openOnly(entry.clientId);
          }

          function removeItem(clientId: string) {
            if (values.items.length <= 1) {
              const replacement = emptyProductEntry();
              void setFieldValue("items", [replacement]);
              accordion.replaceOpenIds([replacement.clientId]);
              return;
            }
            const next = values.items.filter(
              (entry) => entry.clientId !== clientId,
            );
            void setFieldValue("items", next);
            accordion.close(clientId);
          }

          return (
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="flex flex-col gap-2">
                {values.items.map((entry, index) => {
                  const isOpen = accordion.isOpen(entry.clientId);
                  const entryErrors = Array.isArray(errors.items)
                    ? (errors.items[index] as
                        | FormikErrors<ProductEntry>
                        | undefined)
                    : undefined;
                  const entryTouched = Array.isArray(touched.items)
                    ? (touched.items[index] as
                        | FormikTouched<ProductEntry>
                        | undefined)
                    : undefined;
                  const summary = priceSummary(entry);

                  return (
                    <div
                      key={entry.clientId}
                      className="overflow-hidden rounded-control border border-border bg-surface"
                    >
                      <button
                        type="button"
                        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
                        aria-expanded={isOpen}
                        onClick={() => accordion.toggleOpen(entry.clientId)}
                      >
                        <span className="flex min-w-0 flex-col gap-1">
                          <span className="truncate text-label font-semibold text-ink">
                            {productTitle(entry, index)}
                          </span>
                          <span className="text-meta text-muted">
                            {entry.kind === "service"
                              ? "Servicio"
                              : "Producto"}
                            {summary ? ` · ${summary}` : null}
                          </span>
                        </span>
                        <span className="text-meta text-muted" aria-hidden>
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen ? (
                        <div className="flex flex-col gap-5 border-t border-border px-4 py-4">
                          <fieldset className="flex flex-col gap-3">
                            <legend className="sr-only">Tipo</legend>
                            <div className="flex items-center gap-2">
                              <span className="text-label text-ink">Tipo</span>
                              <KindHelp />
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                              <label className="flex min-h-11 items-center gap-3">
                                <input
                                  type="radio"
                                  name={`items.${index}.kind`}
                                  checked={entry.kind === "service"}
                                  onChange={() => {
                                    void setFieldValue(
                                      `items.${index}.kind`,
                                      "service",
                                    );
                                    void setFieldValue(
                                      `items.${index}.plans`,
                                      entry.plans.length > 0
                                        ? entry.plans
                                        : [emptyPlan()],
                                    );
                                    void setFieldValue(
                                      `items.${index}.price`,
                                      "",
                                    );
                                  }}
                                  className="size-5 accent-brand"
                                  disabled={isSubmitting}
                                />
                                <span className="text-body text-ink">
                                  Servicio
                                </span>
                              </label>
                              <label className="flex min-h-11 items-center gap-3">
                                <input
                                  type="radio"
                                  name={`items.${index}.kind`}
                                  checked={entry.kind === "product"}
                                  onChange={() => {
                                    void setFieldValue(
                                      `items.${index}.kind`,
                                      "product",
                                    );
                                    void setFieldValue(
                                      `items.${index}.plans`,
                                      [],
                                    );
                                  }}
                                  className="size-5 accent-brand"
                                  disabled={isSubmitting}
                                />
                                <span className="text-body text-ink">
                                  Producto
                                </span>
                              </label>
                            </div>
                          </fieldset>

                          <TextField
                            label="Nombre"
                            name={`items.${index}.name`}
                            autoCapitalize="sentences"
                            enterKeyHint="next"
                            value={entry.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={showError(
                              submitCount,
                              entryTouched?.name,
                              entryErrors?.name,
                            )}
                            disabled={isSubmitting}
                            maxLength={NAME_MAX}
                          />

                          <TextArea
                            label="Descripción"
                            name={`items.${index}.description`}
                            autoCapitalize="sentences"
                            value={entry.description}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            hint={`Hasta ${DESCRIPTION_MAX} caracteres.`}
                            error={showError(
                              submitCount,
                              entryTouched?.description,
                              entryErrors?.description,
                            )}
                            disabled={isSubmitting}
                            maxLength={DESCRIPTION_MAX}
                          />

                          <TextField
                            label="Moneda"
                            name={`items.${index}.currency`}
                            autoCapitalize="characters"
                            enterKeyHint="next"
                            value={entry.currency}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            hint="Código ISO, por ejemplo USD."
                            error={showError(
                              submitCount,
                              entryTouched?.currency,
                              entryErrors?.currency,
                            )}
                            disabled={isSubmitting}
                            maxLength={3}
                            className="sm:max-w-40"
                          />

                          {entry.kind === "product" ? (
                            <div className="flex flex-col gap-4">
                              <TextField
                                label="Precio unitario"
                                name={`items.${index}.price`}
                                inputMode="decimal"
                                enterKeyHint="next"
                                placeholder="15.00"
                                value={entry.price}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                hint="Usa punto o coma para decimales."
                                error={showError(
                                  submitCount,
                                  entryTouched?.price,
                                  entryErrors?.price,
                                )}
                                disabled={isSubmitting}
                              />
                              <TextArea
                                label="Reglas del precio"
                                name={`items.${index}.priceRules`}
                                autoCapitalize="sentences"
                                value={entry.priceRules}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                hint={`Opcional. Indicaciones para el agente de IA, por ejemplo descuentos. Hasta ${RULES_MAX} caracteres.`}
                                error={showError(
                                  submitCount,
                                  entryTouched?.priceRules,
                                  entryErrors?.priceRules,
                                )}
                                disabled={isSubmitting}
                                maxLength={RULES_MAX}
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-5">
                              <TextArea
                                label="Reglas generales de precios"
                                name={`items.${index}.pricingRules`}
                                autoCapitalize="sentences"
                                value={entry.pricingRules}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                hint={`Opcional. Aplica a todo el servicio, por ejemplo inscripción anual. Hasta ${RULES_MAX} caracteres.`}
                                error={showError(
                                  submitCount,
                                  entryTouched?.pricingRules,
                                  entryErrors?.pricingRules,
                                )}
                                disabled={isSubmitting}
                                maxLength={RULES_MAX}
                              />
                              <fieldset className="flex flex-col gap-3">
                                <legend className="text-label text-ink">
                                  Planes y precios
                                </legend>
                                <p className="text-meta text-muted">
                                  Un servicio puede tener varios planes, por
                                  ejemplo Mensual o 8 clases. Hasta {PLANS_MAX}.
                                </p>
                                {entry.plans.map((plan, planIndex) => {
                                  const planErrors = Array.isArray(
                                    entryErrors?.plans,
                                  )
                                    ? (entryErrors.plans[
                                        planIndex
                                      ] as FormikErrors<PlanEntry> | undefined)
                                    : undefined;
                                  const planTouched = Array.isArray(
                                    entryTouched?.plans,
                                  )
                                    ? entryTouched.plans[planIndex]
                                    : undefined;

                                  return (
                                    <div
                                      key={`${entry.clientId}-plan-${planIndex}`}
                                      className="flex flex-col gap-3 rounded-control border border-border px-3 py-3"
                                    >
                                      <div className="grid gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-end">
                                        <TextField
                                          label="Nombre del plan"
                                          name={`items.${index}.plans.${planIndex}.name`}
                                          autoCapitalize="sentences"
                                          enterKeyHint="next"
                                          placeholder="Mensual"
                                          value={plan.name}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          error={showError(
                                            submitCount,
                                            Boolean(planTouched?.name),
                                            planErrors?.name,
                                          )}
                                          disabled={isSubmitting}
                                          maxLength={PLAN_NAME_MAX}
                                        />
                                        <TextField
                                          label="Precio"
                                          name={`items.${index}.plans.${planIndex}.price`}
                                          inputMode="decimal"
                                          enterKeyHint="next"
                                          placeholder="15.00"
                                          value={plan.price}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          error={showError(
                                            submitCount,
                                            Boolean(planTouched?.price),
                                            planErrors?.price,
                                          )}
                                          disabled={isSubmitting}
                                        />
                                        <Button
                                          type="button"
                                          variant="secondary"
                                          disabled={
                                            isSubmitting ||
                                            entry.plans.length <= 1
                                          }
                                          onClick={() => {
                                            const next = entry.plans.filter(
                                              (_item, i) => i !== planIndex,
                                            );
                                            void setFieldValue(
                                              `items.${index}.plans`,
                                              next.length > 0
                                                ? next
                                                : [emptyPlan()],
                                            );
                                          }}
                                        >
                                          Quitar
                                        </Button>
                                      </div>
                                      <TextArea
                                        label="Reglas del plan"
                                        name={`items.${index}.plans.${planIndex}.rules`}
                                        autoCapitalize="sentences"
                                        value={plan.rules}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        hint={`Opcional. Condiciones de este plan para el agente de IA. Hasta ${RULES_MAX} caracteres.`}
                                        error={showError(
                                          submitCount,
                                          Boolean(planTouched?.rules),
                                          planErrors?.rules,
                                        )}
                                        disabled={isSubmitting}
                                        maxLength={RULES_MAX}
                                      />
                                    </div>
                                  );
                                })}
                                {typeof entryErrors?.plans === "string" &&
                                submitCount > 0 ? (
                                  <p
                                    role="alert"
                                    className="form-error text-label font-semibold"
                                  >
                                    {entryErrors.plans}
                                  </p>
                                ) : null}
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="w-full sm:w-auto"
                                  disabled={
                                    isSubmitting ||
                                    entry.plans.length >= PLANS_MAX
                                  }
                                  onClick={() =>
                                    void setFieldValue(
                                      `items.${index}.plans`,
                                      [...entry.plans, emptyPlan()],
                                    )
                                  }
                                >
                                  + Agregar plan
                                </Button>
                              </fieldset>
                            </div>
                          )}

                          <div>
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={isSubmitting}
                              onClick={() => removeItem(entry.clientId)}
                            >
                              Eliminar ítem
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={() => addItem("service")}
                >
                  + Agregar servicio
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSubmitting}
                  onClick={() => addItem("product")}
                >
                  + Agregar producto
                </Button>
              </div>

              {submitCount > 0 && errors.items && !formError ? (
                <p role="alert" className="form-error text-label font-semibold">
                  {typeof errors.items === "string"
                    ? errors.items
                    : "Revisa los campos marcados en rojo."}
                </p>
              ) : null}

              {formError ? (
                <p role="alert" className="form-error text-label font-semibold">
                  {formError}
                </p>
              ) : null}

              {savedMessage ? (
                <p role="status" className="text-label text-ink">
                  {savedMessage}
                </p>
              ) : null}

              <div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Guardando…"
                    : "Guardar productos y servicios"}
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
