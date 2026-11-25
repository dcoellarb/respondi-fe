"use client";

import type { FormikErrors, FormikTouched } from "formik";
import { useId, type ChangeEvent, type FocusEvent } from "react";
import type { Product } from "@/api/types";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { cn } from "@/lib/cn";
import {
  MAX_SCHEDULE_WINDOWS,
  WEEK_DAYS,
  canReplicateMondaySchedule,
  countScheduleWindows,
  defaultTimeWindow,
  replicateMondaySchedule,
  type DayHoursValue,
  type TimeWindowValue,
} from "@/lib/schedule";

type ScheduleFieldsProps = {
  namePrefix: string;
  days: DayHoursValue[];
  services?: Product[];
  disabled?: boolean;
  submitCount: number;
  errors?: string | string[] | FormikErrors<DayHoursValue>[] | undefined;
  touched?: FormikTouched<DayHoursValue>[] | undefined;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: FocusEvent<HTMLInputElement>) => void;
  setFieldValue: (field: string, value: unknown) => void;
};

function showError(
  submitCount: number,
  touched: boolean | undefined,
  error: string | undefined,
) {
  return (submitCount > 0 || touched) && error ? error : undefined;
}

export function ScheduleFields({
  namePrefix,
  days,
  services = [],
  disabled,
  submitCount,
  errors,
  touched,
  onChange,
  onBlur,
  setFieldValue,
}: ScheduleFieldsProps) {
  const arrayError = typeof errors === "string" ? errors : undefined;
  const totalWindows = countScheduleWindows(days);
  const canAddWindow = totalWindows < MAX_SCHEDULE_WINDOWS;
  const showServiceSelect = services.length > 0;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-label text-ink">Horario de atención</legend>
      <p className="text-meta text-muted">
        Puedes agregar varias franjas el mismo día, por ejemplo mañana y tarde.
        {showServiceSelect
          ? " Si quieres, asigna cada franja a un servicio."
          : null}
      </p>
      <div className="flex flex-col gap-3">
        {days.map((day, dayIndex) => {
          const dayLabel =
            WEEK_DAYS.find((entry) => entry.dayOfWeek === day.dayOfWeek)
              ?.label ?? day.dayOfWeek;
          const dayErrors =
            Array.isArray(errors) && typeof errors[dayIndex] === "object"
              ? (errors[dayIndex] as FormikErrors<DayHoursValue>)
              : undefined;
          const dayTouched = Array.isArray(touched) ? touched[dayIndex] : undefined;
          const windowErrors = Array.isArray(dayErrors?.windows)
            ? (dayErrors.windows as FormikErrors<TimeWindowValue>[])
            : undefined;
          const windowsMessage =
            typeof dayErrors?.windows === "string" ? dayErrors.windows : undefined;

          return (
            <div
              key={day.dayOfWeek}
              className={cn(
                "flex flex-col gap-3 rounded-control border border-border bg-surface px-3 py-3",
                !day.enabled && "opacity-70",
              )}
            >
              <label className="flex min-h-11 items-center gap-3">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    void setFieldValue(`${namePrefix}.${dayIndex}.enabled`, enabled);
                    void setFieldValue(
                      `${namePrefix}.${dayIndex}.windows`,
                      enabled
                        ? day.windows.length > 0
                          ? day.windows
                          : [defaultTimeWindow()]
                        : [],
                    );
                  }}
                  className="size-5 shrink-0 accent-brand"
                  disabled={disabled}
                />
                <span className="text-label text-ink">{dayLabel}</span>
              </label>

              {day.enabled ? (
                <div className="flex flex-col gap-3">
                  {day.windows.map((window, windowIndex) => {
                    const windowError = windowErrors?.[windowIndex];
                    const windowTouched = Array.isArray(dayTouched?.windows)
                      ? dayTouched.windows[windowIndex]
                      : undefined;

                    return (
                      <div
                        key={`${day.dayOfWeek}-${windowIndex}`}
                        className="flex flex-col gap-3 rounded-control border border-border/70 px-3 py-3"
                      >
                        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                          <TextField
                            label={
                              windowIndex === 0
                                ? "Desde"
                                : `Desde ${windowIndex + 1}`
                            }
                            name={`${namePrefix}.${dayIndex}.windows.${windowIndex}.start`}
                            type="time"
                            value={window.start}
                            onChange={onChange}
                            onBlur={onBlur}
                            disabled={disabled}
                            error={showError(
                              submitCount,
                              Boolean(windowTouched?.start),
                              windowError?.start,
                            )}
                          />
                          <TextField
                            label={
                              windowIndex === 0
                                ? "Hasta"
                                : `Hasta ${windowIndex + 1}`
                            }
                            name={`${namePrefix}.${dayIndex}.windows.${windowIndex}.end`}
                            type="time"
                            value={window.end}
                            onChange={onChange}
                            onBlur={onBlur}
                            disabled={disabled}
                            error={showError(
                              submitCount,
                              Boolean(windowTouched?.end),
                              windowError?.end,
                            )}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            className="min-h-11"
                            disabled={disabled || day.windows.length <= 1}
                            onClick={() => {
                              const next = day.windows.filter(
                                (_item, index) => index !== windowIndex,
                              );
                              void setFieldValue(
                                `${namePrefix}.${dayIndex}.windows`,
                                next,
                              );
                              if (next.length === 0) {
                                void setFieldValue(
                                  `${namePrefix}.${dayIndex}.enabled`,
                                  false,
                                );
                              }
                            }}
                          >
                            Quitar
                          </Button>
                        </div>

                        {showServiceSelect ? (
                          <ServiceSelect
                            label="Servicio"
                            name={`${namePrefix}.${dayIndex}.windows.${windowIndex}.productId`}
                            value={window.productId}
                            services={services}
                            disabled={disabled}
                            onChange={(productId) =>
                              void setFieldValue(
                                `${namePrefix}.${dayIndex}.windows.${windowIndex}.productId`,
                                productId,
                              )
                            }
                          />
                        ) : null}
                      </div>
                    );
                  })}

                  {windowsMessage && submitCount > 0 ? (
                    <p role="alert" className="form-error text-label font-semibold">
                      {windowsMessage}
                    </p>
                  ) : null}

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    disabled={disabled || !canAddWindow}
                    onClick={() => {
                      void setFieldValue(`${namePrefix}.${dayIndex}.windows`, [
                        ...day.windows,
                        defaultTimeWindow(),
                      ]);
                    }}
                  >
                    + Agregar franja
                  </Button>

                  {day.dayOfWeek === "monday" ? (
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-9 w-full px-3 py-1.5 text-meta sm:w-auto"
                        disabled={
                          disabled ||
                          !canReplicateMondaySchedule(days, "weekdays")
                        }
                        onClick={() => {
                          void setFieldValue(
                            namePrefix,
                            replicateMondaySchedule(days, "weekdays"),
                          );
                        }}
                      >
                        Replicar hasta el viernes
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-9 w-full px-3 py-1.5 text-meta sm:w-auto"
                        disabled={
                          disabled || !canReplicateMondaySchedule(days, "all")
                        }
                        onClick={() => {
                          void setFieldValue(
                            namePrefix,
                            replicateMondaySchedule(days, "all"),
                          );
                        }}
                      >
                        Replicar todos los días
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {arrayError && submitCount > 0 ? (
        <p role="alert" className="form-error text-label font-semibold">
          {arrayError}
        </p>
      ) : null}
    </fieldset>
  );
}

function ServiceSelect({
  label,
  name,
  value,
  services,
  disabled,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  services: Product[];
  disabled?: boolean;
  onChange: (productId: string) => void;
}) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "min-h-11 w-full rounded-control border border-border bg-surface px-3 text-body text-ink",
          "focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <option value="">Todos los servicios</option>
        {services.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>
    </div>
  );
}
