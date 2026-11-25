"use client";

import {
  Formik,
  type FormikErrors,
  type FormikHelpers,
  type FormikTouched,
} from "formik";
import { useMemo, useState } from "react";
import * as Yup from "yup";
import { putAddress } from "@/api/account";
import {
  useAccount,
  useAddresses,
  useCreateAddress,
  useDeleteAddress,
  usePatchAccount,
  useProducts,
} from "@/api/hooks";
import { queryKeys } from "@/api/query-keys";
import type { Address, AddressWrite, ScheduleWindow } from "@/api/types";
import {
  AddressFields,
  emptyAddressFields,
  type AddressFormValues,
} from "@/components/account/address-fields";
import { AccountSectionAnalytics } from "@/components/account/account-section-analytics";
import { accountNav } from "@/components/account/account-nav";
import { ScheduleFields } from "@/components/account/schedule-fields";
import { useAccordionOpenIds } from "@/components/account/use-accordion-open-ids";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  trackAccountSectionSaveFailed,
  trackAccountSectionSaveSuccess,
} from "@/lib/account-analytics";
import { ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { accountErrorMessage } from "@/lib/account-messages";
import { cn } from "@/lib/cn";
import {
  daysFromHours,
  daysScheduleSchema,
  defaultBusinessDays,
  hoursFromDays,
  isCatalogService,
  type DayHoursValue,
  type TimeWindowValue,
} from "@/lib/schedule";
import { useQueryClient } from "@tanstack/react-query";

const direccionesNav = accountNav.find(
  (item) => item.href === "/cuenta/direcciones",
)!;

type AddressEntry = AddressFormValues & {
  clientId: string;
  serverId?: string;
  days: DayHoursValue[];
};

type AddressesFormValues = {
  manyAddresses: boolean;
  uniqueSchedule: boolean;
  addresses: AddressEntry[];
  sharedDays: DayHoursValue[];
};

function newClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyAddressEntry(hours?: ScheduleWindow[]): AddressEntry {
  return {
    clientId: newClientId(),
    ...emptyAddressFields(),
    days: hours ? daysFromHours(hours) : defaultBusinessDays(),
  };
}

function mapsUrlFromAddress(address: Address) {
  const candidate = address.region?.trim() || address.label?.trim() || "";
  if (/^https?:\/\//i.test(candidate)) return candidate;
  return "";
}

function entryFromAddress(address: Address): AddressEntry {
  return {
    clientId: address.id,
    serverId: address.id,
    line1: address.line1,
    line2: address.line2 ?? "",
    mapsUrl: mapsUrlFromAddress(address),
    days: daysFromHours(address.hours),
  };
}

function addressTitle(entry: AddressEntry, index: number) {
  return entry.line1.trim() || `Dirección ${index + 1}`;
}

function toAddressWrite(
  entry: AddressEntry,
  hours: ScheduleWindow[],
): AddressWrite {
  const mapsUrl = entry.mapsUrl.trim();
  return {
    label: null,
    line1: entry.line1.trim(),
    line2: entry.line2.trim() || null,
    // API still requires city/country; UI collects Maps link instead of city.
    city: "Ecuador",
    region: mapsUrl || null,
    postalCode: null,
    country: "EC",
    hours,
  };
}

const addressFieldsSchema = Yup.object({
  line1: Yup.string()
    .trim()
    .required("Escribe la dirección.")
    .max(200, "Máximo 200 caracteres."),
  line2: Yup.string().trim().max(200, "Máximo 200 caracteres."),
  mapsUrl: Yup.string()
    .trim()
    .required("Pega el enlace de Google Maps.")
    .url("Escribe un enlace válido, por ejemplo https://maps.app.goo.gl/…")
    .max(80, "Usa el enlace corto de Google Maps (máximo 80 caracteres)."),
});

function yupToFieldErrors(
  error: Yup.ValidationError,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const item of error.inner.length ? error.inner : [error]) {
    if (item.path && !result[item.path]) {
      result[item.path] = item.message;
    }
  }
  return result;
}

function dayErrorsFromYup(
  error: Yup.ValidationError,
  length: number,
): FormikErrors<DayHoursValue>[] | string {
  const nested: FormikErrors<DayHoursValue>[] = Array.from(
    { length },
    () => ({}),
  );
  let hasNested = false;
  let topMessage: string | undefined;

  for (const item of error.inner.length ? error.inner : [error]) {
    if (!item.path) {
      topMessage = item.message;
      continue;
    }

    const windowMatch =
      /^\[?(\d+)\]?\.windows(?:\[(\d+)\]|\.(\d+))\.(start|end)$/.exec(
        item.path,
      );
    if (windowMatch) {
      const dayIndex = Number(windowMatch[1]);
      const windowIndex = Number(windowMatch[2] ?? windowMatch[3]);
      const field = windowMatch[4] as "start" | "end";
      const dayError = nested[dayIndex] ?? {};
      const windows = Array.isArray(dayError.windows)
        ? [...(dayError.windows as FormikErrors<TimeWindowValue>[])]
        : [];
      windows[windowIndex] = {
        ...windows[windowIndex],
        [field]: item.message,
      };
      nested[dayIndex] = { ...dayError, windows };
      hasNested = true;
      continue;
    }

    const dayWindowsMatch = /^\[?(\d+)\]?\.windows$/.exec(item.path);
    if (dayWindowsMatch) {
      const dayIndex = Number(dayWindowsMatch[1]);
      nested[dayIndex] = {
        ...nested[dayIndex],
        windows: item.message,
      };
      hasNested = true;
      continue;
    }

    const dayFieldMatch = /^\[?(\d+)\]?\.(\w+)$/.exec(item.path);
    if (dayFieldMatch) {
      const dayIndex = Number(dayFieldMatch[1]);
      const field = dayFieldMatch[2] as keyof DayHoursValue;
      nested[dayIndex] = {
        ...nested[dayIndex],
        [field]: item.message,
      };
      hasNested = true;
      continue;
    }

    topMessage = item.message;
  }

  if (hasNested) return nested;
  return topMessage ?? error.message;
}

async function validateAddressesForm(
  values: AddressesFormValues,
): Promise<FormikErrors<AddressesFormValues>> {
  const errors: FormikErrors<AddressesFormValues> = {};
  const uniqueSchedule = !values.manyAddresses || values.uniqueSchedule;
  const visible = values.manyAddresses
    ? values.addresses
    : values.addresses.slice(0, 1);

  const addressErrors: FormikErrors<AddressEntry>[] = [];

  for (let index = 0; index < visible.length; index += 1) {
    const entry = visible[index]!;
    const entryError: FormikErrors<AddressEntry> = {};
    try {
      await addressFieldsSchema.validate(entry, { abortEarly: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        Object.assign(entryError, yupToFieldErrors(error));
      }
    }

    if (!uniqueSchedule) {
      try {
        await daysScheduleSchema.validate(entry.days, { abortEarly: false });
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          entryError.days = dayErrorsFromYup(
            error,
            entry.days.length,
          ) as unknown as string;
        }
      }
    }

    addressErrors.push(entryError);
  }

  if (addressErrors.some((entry) => Object.keys(entry).length > 0)) {
    errors.addresses = addressErrors;
  }

  if (uniqueSchedule) {
    try {
      await daysScheduleSchema.validate(values.sharedDays, {
        abortEarly: false,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const nestedErrors = dayErrorsFromYup(
          error,
          values.sharedDays.length,
        );
        errors.sharedDays =
          (nestedErrors as unknown as string) ?? error.message;
      }
    }
  }

  return errors;
}

function valuesFromData(
  addresses: Address[] | undefined,
  scheduleMode: "business" | "per_address" | undefined,
  profileHours: ScheduleWindow[] | undefined,
): AddressesFormValues {
  const items = addresses ?? [];
  const manyAddresses = items.length > 1;
  const uniqueSchedule =
    scheduleMode !== "per_address" || items.length <= 1;

  if (items.length === 0) {
    return {
      manyAddresses: false,
      uniqueSchedule: true,
      addresses: [emptyAddressEntry()],
      sharedDays: defaultBusinessDays(),
    };
  }

  const sharedSource =
    scheduleMode === "business" ? profileHours : items[0]?.hours;
  const sharedDays = daysFromHours(sharedSource);

  return {
    manyAddresses,
    uniqueSchedule,
    addresses: items.map(entryFromAddress),
    sharedDays: sharedDays.some(
      (day) => day.enabled && day.windows.length > 0,
    )
      ? sharedDays
      : defaultBusinessDays(),
  };
}

export function AddressesPage() {
  const queryClient = useQueryClient();
  const account = useAccount();
  const addressesQuery = useAddresses({ enabled: Boolean(account.data) });
  const productsQuery = useProducts(
    { limit: 50 },
    { enabled: Boolean(account.data) },
  );
  const patchAccount = usePatchAccount();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const services = useMemo(
    () => (productsQuery.data?.items ?? []).filter(isCatalogService),
    [productsQuery.data?.items],
  );

  const initialValues = useMemo(
    () =>
      valuesFromData(
        addressesQuery.data?.items,
        account.data?.scheduleMode,
        account.data?.hours,
      ),
    [
      addressesQuery.data?.items,
      account.data?.scheduleMode,
      account.data?.hours,
    ],
  );

  const initialOpenId = initialValues.addresses[0]?.clientId ?? null;
  const accordion = useAccordionOpenIds(initialOpenId);

  async function onSubmit(
    values: AddressesFormValues,
    helpers: FormikHelpers<AddressesFormValues>,
  ) {
    setFormError(null);
    setSavedMessage(null);

    if (!account.data) {
      setFormError("Primero guarda los datos del negocio.");
      helpers.setSubmitting(false);
      return;
    }

    const uniqueSchedule = !values.manyAddresses || values.uniqueSchedule;
    const scheduleMode = uniqueSchedule ? "business" : "per_address";
    const sharedHours = hoursFromDays(values.sharedDays);
    const entries = values.manyAddresses
      ? values.addresses
      : values.addresses.slice(0, 1);

    try {
      await patchAccount.mutateAsync({
        scheduleMode,
        hours: scheduleMode === "business" ? sharedHours : [],
      });

      const keptServerIds = new Set(
        entries
          .map((entry) => entry.serverId)
          .filter((id): id is string => Boolean(id)),
      );
      const existingIds = (addressesQuery.data?.items ?? []).map(
        (address) => address.id,
      );

      // Upsert first so a failed write never leaves the account without addresses.
      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index]!;
        const hours =
          scheduleMode === "per_address" ? hoursFromDays(entry.days) : [];
        const body = toAddressWrite(entry, hours);

        if (entry.serverId) {
          await putAddress(entry.serverId, body);
        } else {
          const created = await createAddress.mutateAsync(body);
          entry.serverId = created.id;
          keptServerIds.add(created.id);
        }
      }

      for (const id of existingIds) {
        if (!keptServerIds.has(id)) {
          await deleteAddress.mutateAsync(id);
        }
      }

      await queryClient.invalidateQueries({
        queryKey: queryKeys.addresses.all,
      });
      await addressesQuery.refetch();
      trackAccountSectionSaveSuccess(ANALYTICS_SECTIONS.DIRECCIONES, {
        pagePath: "/cuenta/direcciones",
        itemCount: entries.length,
      });
      setSavedMessage("Direcciones y horarios guardados.");
      helpers.setSubmitting(false);
    } catch (error) {
      trackAccountSectionSaveFailed(
        ANALYTICS_SECTIONS.DIRECCIONES,
        error,
        "/cuenta/direcciones",
      );
      setFormError(accountErrorMessage(error));
      helpers.setSubmitting(false);
    }
  }

  if (account.isLoading || (account.data && addressesQuery.isLoading)) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{direccionesNav.label}</h1>
        <p className="text-body text-muted">Cargando direcciones…</p>
      </div>
    );
  }

  if (account.isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{direccionesNav.label}</h1>
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(account.error)}
        </p>
      </div>
    );
  }

  if (!account.data) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{direccionesNav.label}</h1>
        <Callout>
          Primero completa y guarda los datos del negocio. Después podrás
          agregar direcciones y horarios.
        </Callout>
      </div>
    );
  }

  if (addressesQuery.isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{direccionesNav.label}</h1>
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(addressesQuery.error)}
        </p>
        <Button type="button" onClick={() => void addressesQuery.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AccountSectionAnalytics section={ANALYTICS_SECTIONS.DIRECCIONES} />
      <h1 className="text-page-title">{direccionesNav.label}</h1>

      <Formik<AddressesFormValues>
        initialValues={initialValues}
        enableReinitialize
        validate={validateAddressesForm}
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
          const uniqueSchedule =
            !values.manyAddresses || values.uniqueSchedule;
          const visibleAddresses = values.manyAddresses
            ? values.addresses
            : values.addresses.slice(0, 1);
          function addAddress() {
            const entry = emptyAddressEntry();
            void setFieldValue("addresses", [...values.addresses, entry]);
            accordion.openOnly(entry.clientId);
          }

          function removeAddress(clientId: string) {
            if (values.addresses.length <= 1) return;
            const next = values.addresses.filter(
              (entry) => entry.clientId !== clientId,
            );
            void setFieldValue("addresses", next);
            accordion.close(clientId);
          }

          return (
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
              noValidate
            >
              <fieldset className="flex flex-col gap-3">
                <legend className="sr-only">Modo de direcciones</legend>
                <label className="flex min-h-11 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={values.manyAddresses}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      void setFieldValue("manyAddresses", checked);
                      if (!checked) {
                        void setFieldValue("uniqueSchedule", true);
                        if (values.addresses.length > 1) {
                          void setFieldValue(
                            "addresses",
                            values.addresses.slice(0, 1),
                          );
                        }
                      }
                    }}
                    className="mt-1 size-5 shrink-0 accent-brand"
                    disabled={isSubmitting}
                  />
                  <span className="text-body text-ink">
                    Mi negocio tiene muchas direcciones
                  </span>
                </label>
                <label
                  className={cn(
                    "flex min-h-11 items-start gap-3",
                    !values.manyAddresses && "opacity-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={values.uniqueSchedule}
                    onChange={(event) =>
                      void setFieldValue("uniqueSchedule", event.target.checked)
                    }
                    className="mt-1 size-5 shrink-0 accent-brand"
                    disabled={isSubmitting || !values.manyAddresses}
                  />
                  <span className="text-body text-ink">
                    Tengo un horario de atención único
                  </span>
                </label>
              </fieldset>

              {!values.manyAddresses ? (
                <div className="flex flex-col gap-5">
                  <AddressFields
                    namePrefix="addresses.0"
                    values={visibleAddresses[0]!}
                    disabled={isSubmitting}
                    submitCount={submitCount}
                    errors={
                      Array.isArray(errors.addresses)
                        ? (errors.addresses[0] as FormikErrors<AddressEntry>)
                        : undefined
                    }
                    touched={
                      Array.isArray(touched.addresses)
                        ? (touched.addresses[0] as FormikTouched<AddressEntry>)
                        : undefined
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  <ScheduleFields
                    namePrefix="sharedDays"
                    days={values.sharedDays}
                    services={services}
                    disabled={isSubmitting}
                    submitCount={submitCount}
                    errors={
                      errors.sharedDays as
                        | FormikErrors<DayHoursValue>[]
                        | string
                        | undefined
                    }
                    touched={
                      Array.isArray(touched.sharedDays)
                        ? touched.sharedDays
                        : undefined
                    }
                    onChange={handleChange}
                    onBlur={handleBlur}
                    setFieldValue={setFieldValue}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    {visibleAddresses.map((entry, index) => {
                      const isOpen = accordion.isOpen(entry.clientId);
                      const entryErrors = Array.isArray(errors.addresses)
                        ? (errors.addresses[index] as
                            | FormikErrors<AddressEntry>
                            | undefined)
                        : undefined;
                      const entryTouched = Array.isArray(touched.addresses)
                        ? (touched.addresses[index] as
                            | FormikTouched<AddressEntry>
                            | undefined)
                        : undefined;

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
                            <span className="text-label font-semibold text-ink">
                              {addressTitle(entry, index)}
                            </span>
                            <span className="text-meta text-muted" aria-hidden>
                              {isOpen ? "−" : "+"}
                            </span>
                          </button>
                          {isOpen ? (
                            <div className="flex flex-col gap-5 border-t border-border px-4 py-4">
                              <AddressFields
                                namePrefix={`addresses.${index}`}
                                values={entry}
                                disabled={isSubmitting}
                                submitCount={submitCount}
                                errors={entryErrors}
                                touched={entryTouched}
                                onChange={handleChange}
                                onBlur={handleBlur}
                              />
                              {!uniqueSchedule ? (
                                <ScheduleFields
                                  namePrefix={`addresses.${index}.days`}
                                  days={entry.days}
                                  services={services}
                                  disabled={isSubmitting}
                                  submitCount={submitCount}
                                  errors={
                                    entryErrors?.days as
                                      | FormikErrors<DayHoursValue>[]
                                      | string
                                      | undefined
                                  }
                                  touched={
                                    Array.isArray(entryTouched?.days)
                                      ? entryTouched.days
                                      : undefined
                                  }
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  setFieldValue={setFieldValue}
                                />
                              ) : null}
                              {values.addresses.length > 1 ? (
                                <div>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={isSubmitting}
                                    onClick={() =>
                                      removeAddress(entry.clientId)
                                    }
                                  >
                                    Eliminar dirección
                                  </Button>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    disabled={isSubmitting}
                    onClick={addAddress}
                  >
                    + Agregar dirección
                  </Button>

                  {uniqueSchedule ? (
                    <ScheduleFields
                      namePrefix="sharedDays"
                      days={values.sharedDays}
                      services={services}
                      disabled={isSubmitting}
                      submitCount={submitCount}
                      errors={
                        errors.sharedDays as
                          | FormikErrors<DayHoursValue>[]
                          | string
                          | undefined
                      }
                      touched={
                        Array.isArray(touched.sharedDays)
                          ? touched.sharedDays
                          : undefined
                      }
                      onChange={handleChange}
                      onBlur={handleBlur}
                      setFieldValue={setFieldValue}
                    />
                  ) : null}
                </div>
              )}

              {submitCount > 0 &&
              (errors.addresses || errors.sharedDays) &&
              !formError ? (
                <p role="alert" className="form-error text-label font-semibold">
                  Revisa los campos marcados en rojo.
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
                    : "Guardar direcciones y horarios"}
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
