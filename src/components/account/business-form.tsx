"use client";

import { Formik, type FormikHelpers } from "formik";
import { useMemo, useState } from "react";
import * as Yup from "yup";
import { useAccount, usePatchAccount, usePutAccount } from "@/api/hooks";
import { readAuthSession } from "@/api/session";
import type { Profile, ProfilePatch, ProfileWrite } from "@/api/types";
import { AccountSectionAnalytics } from "@/components/account/account-section-analytics";
import { accountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { TextField } from "@/components/ui/text-field";
import {
  trackAccountSectionSaveFailed,
  trackAccountSectionSaveSuccess,
} from "@/lib/account-analytics";
import { ANALYTICS_SECTIONS } from "@/lib/analytics-events";
import { accountErrorMessage } from "@/lib/account-messages";
import { isE164Phone, normalizePhone } from "@/lib/phone";

const negocioNav = accountNav.find((item) => item.href === "/cuenta/negocio")!;

const E164_HINT =
  "Usa formato internacional E.164, por ejemplo +593991234567.";

type BusinessFormValues = {
  businessName: string;
  phone: string;
  whatsappBusinessInUse: boolean;
  contactName: string;
  contactPhone: string;
};

const phoneRequired = Yup.string()
  .trim()
  .required("Escribe el WhatsApp del negocio.")
  .test("e164", E164_HINT, (value) => Boolean(value && isE164Phone(value)));

const contactPhoneRequired = Yup.string()
  .trim()
  .required("Escribe el teléfono de contacto.")
  .test("e164", E164_HINT, (value) => Boolean(value && isE164Phone(value)));

const businessSchema = Yup.object({
  businessName: Yup.string()
    .trim()
    .required("Escribe el nombre del negocio.")
    .max(120, "Máximo 120 caracteres."),
  phone: phoneRequired,
  whatsappBusinessInUse: Yup.boolean().required(),
  contactName: Yup.string()
    .trim()
    .required("Escribe el nombre de contacto.")
    .max(120, "Máximo 120 caracteres."),
  contactPhone: contactPhoneRequired,
});

function valuesFromProfile(
  profile: Profile | null | undefined,
  fallbackContactName: string,
): BusinessFormValues {
  if (!profile) {
    return {
      businessName: "",
      phone: "",
      whatsappBusinessInUse: false,
      contactName: fallbackContactName,
      contactPhone: "",
    };
  }

  return {
    businessName: profile.businessName,
    phone: profile.phone,
    whatsappBusinessInUse: profile.whatsappBusinessInUse,
    contactName: profile.contactName,
    contactPhone: profile.contactPhone ?? "",
  };
}

function toContactFields(values: BusinessFormValues): ProfilePatch {
  return {
    businessName: values.businessName.trim(),
    phone: normalizePhone(values.phone)!,
    whatsappBusinessInUse: values.whatsappBusinessInUse,
    contactName: values.contactName.trim(),
    contactPhone: normalizePhone(values.contactPhone),
  };
}

/** First profile create: hours live on Direcciones; default mode leaves hours empty. */
function toCreateProfile(values: BusinessFormValues): ProfileWrite {
  const fields = toContactFields(values);
  return {
    businessName: fields.businessName!,
    phone: fields.phone!,
    whatsappBusinessInUse: fields.whatsappBusinessInUse!,
    contactName: fields.contactName!,
    contactPhone: fields.contactPhone,
    scheduleMode: "per_address",
    hours: [],
  };
}

function showError(
  submitCount: number,
  touched: boolean | undefined,
  error: string | undefined,
) {
  return (submitCount > 0 || touched) && error ? error : undefined;
}

function sessionContactName() {
  const user = readAuthSession()?.user;
  if (!user) return "";
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
}

function sessionEmail() {
  return readAuthSession()?.user?.email ?? "";
}

export function BusinessProfilePage() {
  const account = useAccount();
  const putAccount = usePutAccount();
  const patchAccount = usePatchAccount();
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const email = account.data?.email || sessionEmail();
  const initialValues = useMemo(
    () => valuesFromProfile(account.data, sessionContactName()),
    [account.data],
  );

  async function onSubmit(
    values: BusinessFormValues,
    helpers: FormikHelpers<BusinessFormValues>,
  ) {
    setFormError(null);
    setSavedMessage(null);

    const phone = normalizePhone(values.phone);
    const contactPhone = normalizePhone(values.contactPhone);
    if (!phone || !contactPhone) {
      helpers.setSubmitting(false);
      return;
    }

    const normalized: BusinessFormValues = {
      ...values,
      businessName: values.businessName.trim(),
      phone,
      contactName: values.contactName.trim(),
      contactPhone,
    };
    helpers.setValues(normalized);

    try {
      if (account.data) {
        await patchAccount.mutateAsync(toContactFields(normalized));
      } else {
        await putAccount.mutateAsync(toCreateProfile(normalized));
      }
      trackAccountSectionSaveSuccess(ANALYTICS_SECTIONS.NEGOCIO, {
        pagePath: "/cuenta/negocio",
      });
      setSavedMessage("Datos del negocio guardados.");
      helpers.setSubmitting(false);
    } catch (error) {
      trackAccountSectionSaveFailed(
        ANALYTICS_SECTIONS.NEGOCIO,
        error,
        "/cuenta/negocio",
      );
      setFormError(accountErrorMessage(error));
      helpers.setSubmitting(false);
    }
  }

  if (account.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <AccountSectionAnalytics section={ANALYTICS_SECTIONS.NEGOCIO} />
        <h1 className="text-page-title">{negocioNav.label}</h1>
        <p className="text-body text-muted">Cargando datos del negocio…</p>
      </div>
    );
  }

  if (account.isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{negocioNav.label}</h1>
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(account.error)}
        </p>
        <Button type="button" onClick={() => void account.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const isNewProfile = !account.data;

  return (
    <div className="flex flex-col gap-6">
      <AccountSectionAnalytics section={ANALYTICS_SECTIONS.NEGOCIO} />
      <header className="flex flex-col gap-2">
        <h1 className="text-page-title">{negocioNav.label}</h1>
        <p className="max-w-xl text-body text-muted">{negocioNav.description}</p>
      </header>

      {isNewProfile ? (
        <Callout>
          Completa estos datos para que Respondi pueda atender a tus clientes.
          El correo de la cuenta no se puede cambiar aquí. Los horarios se
          configuran en Direcciones y horarios.
        </Callout>
      ) : null}

      <Formik<BusinessFormValues>
        initialValues={initialValues}
        enableReinitialize
        validationSchema={businessSchema}
        validateOnBlur
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
          isValid,
          setFieldValue,
          submitCount,
        }) => {
          const showFormValidationError = submitCount > 0 && !isValid;

          return (
            <form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
              noValidate
            >
              <TextField
                label="Correo de la cuenta"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                readOnly
                disabled
                hint="El correo viene de tu registro y no se puede editar."
              />

              <TextField
                label="Nombre del negocio"
                name="businessName"
                autoComplete="organization"
                autoCapitalize="words"
                enterKeyHint="next"
                value={values.businessName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError(
                  submitCount,
                  touched.businessName,
                  errors.businessName,
                )}
                disabled={isSubmitting}
                maxLength={120}
                required
              />

              <TextField
                label="WhatsApp del negocio"
                name="phone"
                type="tel"
                autoComplete="tel"
                enterKeyHint="next"
                placeholder="+593991234567"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                hint="Número en formato internacional (E.164). Se usa para reconocer mensajes entrantes."
                error={showError(submitCount, touched.phone, errors.phone)}
                disabled={isSubmitting}
                required
              />

              <label className="flex min-h-11 items-start gap-3">
                <input
                  type="checkbox"
                  name="whatsappBusinessInUse"
                  checked={values.whatsappBusinessInUse}
                  onChange={(event) =>
                    void setFieldValue(
                      "whatsappBusinessInUse",
                      event.target.checked,
                    )
                  }
                  className="mt-1 size-5 shrink-0 accent-brand"
                  disabled={isSubmitting}
                />
                <span className="text-body text-ink">
                  Ya uso WhatsApp Business en este número.
                </span>
              </label>

              <TextField
                label="Nombre de contacto"
                name="contactName"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                value={values.contactName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={showError(
                  submitCount,
                  touched.contactName,
                  errors.contactName,
                )}
                disabled={isSubmitting}
                maxLength={120}
                required
              />

              <TextField
                label="Teléfono de contacto"
                name="contactPhone"
                type="tel"
                autoComplete="tel"
                enterKeyHint="done"
                placeholder="+593991234567"
                value={values.contactPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                hint="Número en formato internacional (E.164). No se usa para emparejar mensajes de WhatsApp."
                error={showError(
                  submitCount,
                  touched.contactPhone,
                  errors.contactPhone,
                )}
                disabled={isSubmitting}
                required
              />

              {showFormValidationError ? (
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
                  {isSubmitting ? "Guardando…" : "Guardar datos del negocio"}
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
