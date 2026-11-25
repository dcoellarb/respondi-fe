"use client";

import { Formik, type FormikHelpers } from "formik";
import { useState, type KeyboardEvent } from "react";
import * as Yup from "yup";
import { signin, signup } from "@/api/auth";
import { isApiError } from "@/api/errors";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { captureAnalyticsEvent } from "@/lib/analytics";
import {
  ANALYTICS_EVENTS,
  ANALYTICS_PROPS,
} from "@/lib/analytics-events";
import { authErrorMessage } from "@/lib/auth-messages";
import { site } from "@/lib/site";

const PRIVATE_HOME = "/cuenta/negocio";

const passwordSchema = Yup.string()
  .required("Escribe tu contraseña.")
  .min(8, "Usa al menos 8 caracteres.")
  .matches(/[a-z]/, "Incluye al menos una minúscula.")
  .matches(/[A-Z]/, "Incluye al menos una mayúscula.")
  .matches(/\d/, "Incluye al menos un número.")
  .matches(/[^A-Za-z0-9]/, "Incluye al menos un símbolo.");

const signupSchema = Yup.object({
  firstName: Yup.string().trim().required("Escribe tu nombre."),
  lastName: Yup.string().trim().required("Escribe tu apellido."),
  email: Yup.string()
    .trim()
    .email("Escribe un correo válido.")
    .required("Escribe un correo válido."),
  password: passwordSchema,
  acceptedTerms: Yup.boolean().oneOf(
    [true],
    "Acepta los Términos y condiciones para crear la cuenta.",
  ),
  marketing: Yup.boolean().default(false),
});

const signinSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Escribe un correo válido.")
    .required("Escribe un correo válido."),
  password: Yup.string().required("Escribe tu contraseña."),
});

type SignupValues = Yup.InferType<typeof signupSchema>;
type SigninValues = Yup.InferType<typeof signinSchema>;

function goToPrivateHome() {
  // Full navigation so the private shell reads the stored session cleanly.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- auth handoff
  window.location.assign(PRIVATE_HOME);
}

function fieldError(
  touched: boolean | undefined,
  error: string | undefined,
) {
  return touched && error ? error : undefined;
}

function preventNativeSubmit(event: { preventDefault(): void; stopPropagation(): void }) {
  event.preventDefault();
  event.stopPropagation();
}

export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(
    values: SignupValues,
    helpers: FormikHelpers<SignupValues>,
  ) {
    setFormError(null);
    captureAnalyticsEvent(ANALYTICS_EVENTS.SIGNUP_SUBMIT_CLICK, {
      [ANALYTICS_PROPS.PAGE_PATH]: "/registro",
    });
    try {
      await signup({
        email: values.email.trim(),
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
      });
      captureAnalyticsEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETED, {
        [ANALYTICS_PROPS.PAGE_PATH]: "/registro",
      });
      goToPrivateHome();
    } catch (error) {
      captureAnalyticsEvent(ANALYTICS_EVENTS.SIGNUP_FAILED, {
        [ANALYTICS_PROPS.PAGE_PATH]: "/registro",
        [ANALYTICS_PROPS.ERROR_CODE]: isApiError(error)
          ? error.code || String(error.status)
          : "unknown",
      });
      setFormError(authErrorMessage(error));
      helpers.setSubmitting(false);
    }
  }

  return (
    <Formik<SignupValues>
      initialValues={{
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        acceptedTerms: false,
        marketing: false,
      }}
      validationSchema={signupSchema}
      onSubmit={onSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isSubmitting,
        setFieldValue,
        submitForm,
      }) => {
        function onEnterSubmit(event: KeyboardEvent<HTMLInputElement>) {
          if (event.key !== "Enter") return;
          event.preventDefault();
          event.stopPropagation();
          if (!isSubmitting) void submitForm();
        }

        return (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Nombre"
                name="firstName"
                autoComplete="given-name"
                autoCapitalize="words"
                enterKeyHint="next"
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={onEnterSubmit}
                error={fieldError(touched.firstName, errors.firstName)}
                disabled={isSubmitting}
              />
              <TextField
                label="Apellido"
                name="lastName"
                autoComplete="family-name"
                autoCapitalize="words"
                enterKeyHint="next"
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={onEnterSubmit}
                error={fieldError(touched.lastName, errors.lastName)}
                disabled={isSubmitting}
              />
            </div>
            <TextField
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              enterKeyHint="next"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={onEnterSubmit}
              error={fieldError(touched.email, errors.email)}
              disabled={isSubmitting}
            />
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              enterKeyHint="done"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={onEnterSubmit}
              hint="Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo."
              error={fieldError(touched.password, errors.password)}
              disabled={isSubmitting}
            />

            <div className="flex flex-col gap-2">
              <label className="flex min-h-11 items-start gap-3">
                <input
                  type="checkbox"
                  name="acceptedTerms"
                  checked={values.acceptedTerms}
                  onChange={(event) =>
                    void setFieldValue("acceptedTerms", event.target.checked)
                  }
                  onBlur={handleBlur}
                  className="mt-1 size-5 shrink-0 accent-brand"
                  aria-describedby={
                    fieldError(touched.acceptedTerms, errors.acceptedTerms)
                      ? "terms-error"
                      : undefined
                  }
                  disabled={isSubmitting}
                />
                <span className="text-body text-ink">
                  Acepto los Términos y condiciones, versión {site.termsVersion},
                  con vigencia {site.termsEffectiveDate}.
                </span>
              </label>
              {fieldError(touched.acceptedTerms, errors.acceptedTerms) ? (
                <p
                  id="terms-error"
                  role="alert"
                  className="form-error text-label font-semibold"
                >
                  {errors.acceptedTerms}
                </p>
              ) : null}
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Autorización comercial</legend>
              <label className="flex min-h-11 items-start gap-3">
                <input
                  type="checkbox"
                  name="marketing"
                  checked={values.marketing}
                  onChange={(event) =>
                    void setFieldValue("marketing", event.target.checked)
                  }
                  className="mt-1 size-5 shrink-0 accent-brand"
                  disabled={isSubmitting}
                />
                <span className="text-body text-ink">
                  Quiero recibir novedades comerciales de Respondi. Esta
                  autorización es independiente y no es necesaria para crear la
                  cuenta.
                </span>
              </label>
            </fieldset>

            {formError ? (
              <p role="alert" className="form-error text-label font-semibold">
                {formError}
              </p>
            ) : null}

            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
              onClick={() => {
                void submitForm();
              }}
            >
              {isSubmitting ? "Creando cuenta…" : "Crear mi cuenta"}
            </Button>
          </div>
        );
      }}
    </Formik>
  );
}

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(
    values: SigninValues,
    helpers: FormikHelpers<SigninValues>,
  ) {
    setFormError(null);
    captureAnalyticsEvent(ANALYTICS_EVENTS.LOGIN_SUBMIT_CLICK, {
      [ANALYTICS_PROPS.PAGE_PATH]: "/iniciar-sesion",
    });
    try {
      await signin({
        email: values.email.trim(),
        password: values.password,
      });
      captureAnalyticsEvent(ANALYTICS_EVENTS.LOGIN_COMPLETED, {
        [ANALYTICS_PROPS.PAGE_PATH]: "/iniciar-sesion",
      });
      goToPrivateHome();
    } catch (error) {
      captureAnalyticsEvent(ANALYTICS_EVENTS.LOGIN_FAILED, {
        [ANALYTICS_PROPS.PAGE_PATH]: "/iniciar-sesion",
        [ANALYTICS_PROPS.ERROR_CODE]: isApiError(error)
          ? error.code || String(error.status)
          : "unknown",
      });
      setFormError(authErrorMessage(error));
      helpers.setSubmitting(false);
    }
  }

  return (
    <Formik<SigninValues>
      initialValues={{ email: "", password: "" }}
      validationSchema={signinSchema}
      onSubmit={onSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        isSubmitting,
        submitForm,
      }) => {
        function onEnterSubmit(event: KeyboardEvent<HTMLInputElement>) {
          if (event.key !== "Enter") return;
          preventNativeSubmit(event);
          if (!isSubmitting) void submitForm();
        }

        return (
          <div className="flex flex-col gap-4">
            <TextField
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              enterKeyHint="next"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={onEnterSubmit}
              error={fieldError(touched.email, errors.email)}
              disabled={isSubmitting}
            />
            <TextField
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="current-password"
              enterKeyHint="done"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={onEnterSubmit}
              error={fieldError(touched.password, errors.password)}
              disabled={isSubmitting}
            />

            {formError ? (
              <p role="alert" className="form-error text-label font-semibold">
                {formError}
              </p>
            ) : null}

            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
              onClick={() => {
                void submitForm();
              }}
            >
              {isSubmitting ? "Entrando…" : "Iniciar sesión"}
            </Button>
          </div>
        );
      }}
    </Formik>
  );
}
