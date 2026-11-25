"use client";

import {
  Formik,
  type FormikErrors,
  type FormikHelpers,
  type FormikTouched,
} from "formik";
import { useMemo, useState } from "react";
import * as Yup from "yup";
import { putFaq } from "@/api/account";
import {
  useAccount,
  useCreateFaq,
  useDeleteFaq,
  useFaqs,
} from "@/api/hooks";
import { queryKeys } from "@/api/query-keys";
import type { Faq, FaqCreate, FaqReplace } from "@/api/types";
import { AccountSectionAnalytics } from "@/components/account/account-section-analytics";
import { accountNav } from "@/components/account/account-nav";
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
import { useQueryClient } from "@tanstack/react-query";

const preguntasNav = accountNav.find(
  (item) => item.href === "/cuenta/preguntas",
)!;

const QUESTION_MAX = 500;
const ANSWER_MAX = 4000;
const FAQS_MAX = 10;

type FaqEntry = {
  clientId: string;
  serverId?: string;
  question: string;
  answer: string;
};

type FaqsFormValues = {
  items: FaqEntry[];
};

function newClientId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyFaqEntry(): FaqEntry {
  return {
    clientId: newClientId(),
    question: "",
    answer: "",
  };
}

function entryFromFaq(faq: Faq): FaqEntry {
  return {
    clientId: faq.id,
    serverId: faq.id,
    question: faq.question,
    answer: faq.answer,
  };
}

function faqTitle(entry: FaqEntry, index: number) {
  return entry.question.trim() || `Pregunta ${index + 1}`;
}

function showError(
  submitCount: number,
  touched: boolean | undefined,
  error: string | undefined,
) {
  return (submitCount > 0 || touched) && error ? error : undefined;
}

const faqEntrySchema = Yup.object({
  question: Yup.string()
    .trim()
    .required("Escribe la pregunta.")
    .max(QUESTION_MAX, `Máximo ${QUESTION_MAX} caracteres.`),
  answer: Yup.string()
    .trim()
    .required("Escribe la respuesta.")
    .max(ANSWER_MAX, `Máximo ${ANSWER_MAX} caracteres.`),
});

async function validateFaqsForm(
  values: FaqsFormValues,
): Promise<FormikErrors<FaqsFormValues>> {
  const errors: FormikErrors<FaqsFormValues> = {};

  if (values.items.length > FAQS_MAX) {
    errors.items =
      `Puedes guardar hasta ${FAQS_MAX} preguntas.` as unknown as FormikErrors<FaqEntry>[];
    return errors;
  }

  const itemErrors: FormikErrors<FaqEntry>[] = [];
  for (const entry of values.items) {
    const entryError: FormikErrors<FaqEntry> = {};
    try {
      await faqEntrySchema.validate(entry, { abortEarly: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        for (const item of error.inner.length ? error.inner : [error]) {
          if (item.path) {
            (entryError as Record<string, string>)[item.path] = item.message;
          }
        }
      }
    }
    itemErrors.push(entryError);
  }

  if (itemErrors.some((entry) => Object.keys(entry).length > 0)) {
    errors.items = itemErrors;
  }

  return errors;
}

export function FaqsPage() {
  const queryClient = useQueryClient();
  const account = useAccount();
  const faqsQuery = useFaqs({ enabled: Boolean(account.data) });
  const createFaq = useCreateFaq();
  const deleteFaq = useDeleteFaq();
  const [formError, setFormError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const initialValues = useMemo<FaqsFormValues>(() => {
    const items = [...(faqsQuery.data?.items ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
    return { items: items.map(entryFromFaq) };
  }, [faqsQuery.data?.items]);

  const initialOpenId = initialValues.items[0]?.clientId ?? null;
  const accordion = useAccordionOpenIds(initialOpenId);

  async function onSubmit(
    values: FaqsFormValues,
    helpers: FormikHelpers<FaqsFormValues>,
  ) {
    setFormError(null);
    setSavedMessage(null);

    if (!account.data) {
      setFormError("Primero guarda los datos del negocio.");
      helpers.setSubmitting(false);
      return;
    }

    try {
      const existing = faqsQuery.data?.items ?? [];
      const keptServerIds = new Set(
        values.items
          .map((entry) => entry.serverId)
          .filter((id): id is string => Boolean(id)),
      );

      for (const faq of existing) {
        if (!keptServerIds.has(faq.id)) {
          await deleteFaq.mutateAsync(faq.id);
        }
      }

      for (let index = 0; index < values.items.length; index += 1) {
        const entry = values.items[index]!;
        const body: FaqCreate & FaqReplace = {
          question: entry.question.trim(),
          answer: entry.answer.trim(),
          sortOrder: index,
        };

        if (entry.serverId) {
          await putFaq(entry.serverId, body);
        } else {
          await createFaq.mutateAsync(body);
        }
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
      await faqsQuery.refetch();
      trackAccountSectionSaveSuccess(ANALYTICS_SECTIONS.PREGUNTAS, {
        pagePath: "/cuenta/preguntas",
        itemCount: values.items.length,
      });
      setSavedMessage("Preguntas frecuentes guardadas.");
      helpers.setSubmitting(false);
    } catch (error) {
      trackAccountSectionSaveFailed(
        ANALYTICS_SECTIONS.PREGUNTAS,
        error,
        "/cuenta/preguntas",
      );
      setFormError(accountErrorMessage(error));
      helpers.setSubmitting(false);
    }
  }

  if (account.isLoading || (account.data && faqsQuery.isLoading)) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{preguntasNav.label}</h1>
        <p className="text-body text-muted">Cargando preguntas…</p>
      </div>
    );
  }

  if (account.isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{preguntasNav.label}</h1>
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(account.error)}
        </p>
      </div>
    );
  }

  if (!account.data) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{preguntasNav.label}</h1>
        <Callout>
          Primero completa y guarda los datos del negocio. Después podrás
          agregar preguntas frecuentes.
        </Callout>
      </div>
    );
  }

  if (faqsQuery.isError) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-page-title">{preguntasNav.label}</h1>
        <p role="alert" className="form-error text-body font-semibold">
          {accountErrorMessage(faqsQuery.error)}
        </p>
        <Button type="button" onClick={() => void faqsQuery.refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AccountSectionAnalytics section={ANALYTICS_SECTIONS.PREGUNTAS} />
      <h1 className="text-page-title">{preguntasNav.label}</h1>
      <p className="text-body text-muted">
        Hasta {FAQS_MAX} preguntas. La pregunta admite máximo {QUESTION_MAX}{" "}
        caracteres y la respuesta máximo {ANSWER_MAX}.
      </p>

      <Formik<FaqsFormValues>
        initialValues={initialValues}
        enableReinitialize
        validate={validateFaqsForm}
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
          const canAdd = values.items.length < FAQS_MAX;

          function addFaq() {
            if (!canAdd) return;
            const entry = emptyFaqEntry();
            void setFieldValue("items", [...values.items, entry]);
            accordion.openOnly(entry.clientId);
          }

          function removeFaq(clientId: string) {
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
              {values.items.length === 0 ? (
                <Callout>
                  Aún no tienes preguntas frecuentes. Agrega las dudas que más
                  te hacen tus clientes.
                </Callout>
              ) : (
                <div className="flex flex-col gap-2">
                  {values.items.map((entry, index) => {
                    const isOpen = accordion.isOpen(entry.clientId);
                    const entryErrors = Array.isArray(errors.items)
                      ? (errors.items[index] as
                          | FormikErrors<FaqEntry>
                          | undefined)
                      : undefined;
                    const entryTouched = Array.isArray(touched.items)
                      ? (touched.items[index] as
                          | FormikTouched<FaqEntry>
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
                          <span className="truncate text-label font-semibold text-ink">
                            {faqTitle(entry, index)}
                          </span>
                          <span className="text-meta text-muted" aria-hidden>
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>

                        {isOpen ? (
                          <div className="flex flex-col gap-5 border-t border-border px-4 py-4">
                            <TextField
                              label="Pregunta"
                              name={`items.${index}.question`}
                              autoCapitalize="sentences"
                              enterKeyHint="next"
                              value={entry.question}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              hint={`Hasta ${QUESTION_MAX} caracteres.`}
                              error={showError(
                                submitCount,
                                entryTouched?.question,
                                entryErrors?.question,
                              )}
                              disabled={isSubmitting}
                              maxLength={QUESTION_MAX}
                            />
                            <TextArea
                              label="Respuesta"
                              name={`items.${index}.answer`}
                              autoCapitalize="sentences"
                              value={entry.answer}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              hint={`Hasta ${ANSWER_MAX} caracteres.`}
                              error={showError(
                                submitCount,
                                entryTouched?.answer,
                                entryErrors?.answer,
                              )}
                              disabled={isSubmitting}
                              maxLength={ANSWER_MAX}
                            />
                            <div>
                              <Button
                                type="button"
                                variant="secondary"
                                disabled={isSubmitting}
                                onClick={() => removeFaq(entry.clientId)}
                              >
                                Eliminar pregunta
                              </Button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}

              <div>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full sm:w-auto"
                  disabled={isSubmitting || !canAdd}
                  onClick={addFaq}
                >
                  + Agregar pregunta
                </Button>
                {!canAdd ? (
                  <p className="mt-2 text-meta text-muted">
                    Alcanzaste el máximo de {FAQS_MAX} preguntas.
                  </p>
                ) : null}
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
                    : "Guardar preguntas frecuentes"}
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}
