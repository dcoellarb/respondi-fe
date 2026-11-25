import * as Yup from "yup";
import type { ScheduleWindow } from "@/api/types";

export const WEEK_DAYS = [
  { dayOfWeek: "monday", label: "Lunes" },
  { dayOfWeek: "tuesday", label: "Martes" },
  { dayOfWeek: "wednesday", label: "Miércoles" },
  { dayOfWeek: "thursday", label: "Jueves" },
  { dayOfWeek: "friday", label: "Viernes" },
  { dayOfWeek: "saturday", label: "Sábado" },
  { dayOfWeek: "sunday", label: "Domingo" },
] as const;

export type DayOfWeek = (typeof WEEK_DAYS)[number]["dayOfWeek"];

export type TimeWindowValue = {
  start: string;
  end: string;
  /** Empty string = all services (omit productId on save). */
  productId: string;
};

export type DayHoursValue = {
  dayOfWeek: DayOfWeek;
  enabled: boolean;
  windows: TimeWindowValue[];
};

export const TIME_HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const MAX_SCHEDULE_WINDOWS = 28;

export function defaultTimeWindow(): TimeWindowValue {
  return { start: "09:00", end: "18:00", productId: "" };
}

export function isCatalogService(item: {
  kind?: "product" | "service";
}) {
  // Treat missing kind as service so schedule linking works until products are marked.
  return item.kind !== "product";
}

export function defaultBusinessDays(): DayHoursValue[] {
  return WEEK_DAYS.map(({ dayOfWeek }) => {
    const weekday = dayOfWeek !== "saturday" && dayOfWeek !== "sunday";
    return {
      dayOfWeek,
      enabled: weekday,
      windows: weekday ? [defaultTimeWindow()] : [],
    };
  });
}

export function daysFromHours(
  hours: ScheduleWindow[] | undefined,
): DayHoursValue[] {
  const byDay = new Map<DayOfWeek, TimeWindowValue[]>();

  for (const window of hours ?? []) {
    const list = byDay.get(window.dayOfWeek) ?? [];
    list.push({
      start: window.start,
      end: window.end,
      productId: window.productId ?? "",
    });
    byDay.set(window.dayOfWeek, list);
  }

  return WEEK_DAYS.map(({ dayOfWeek }) => {
    const windows = byDay.get(dayOfWeek) ?? [];
    return {
      dayOfWeek,
      enabled: windows.length > 0,
      windows:
        windows.length > 0
          ? windows.sort((a, b) => a.start.localeCompare(b.start))
          : [],
    };
  });
}

function normalizeTimeHhMm(value: string): string {
  const trimmed = value.trim();
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(trimmed);
  if (!match) return trimmed;
  return `${match[1]}:${match[2]}`;
}

export function hoursFromDays(days: DayHoursValue[]): ScheduleWindow[] {
  const hours: ScheduleWindow[] = [];
  for (const day of days) {
    if (!day.enabled) continue;
    for (const window of day.windows) {
      const productId = window.productId.trim();
      // Omit productId when empty ("all services"). Avoid sending null — some
      // Dynamo writes have failed with INTERNAL_ERROR on nested nulls.
      hours.push({
        dayOfWeek: day.dayOfWeek,
        start: normalizeTimeHhMm(window.start),
        end: normalizeTimeHhMm(window.end),
        ...(productId ? { productId } : {}),
      });
    }
  }
  return hours;
}

export function countScheduleWindows(days: DayHoursValue[]): number {
  return days.reduce(
    (total, day) => total + (day.enabled ? day.windows.length : 0),
    0,
  );
}

const WEEKDAY_COPY_TARGETS: DayOfWeek[] = [
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
];

const ALL_DAYS_COPY_TARGETS: DayOfWeek[] = [
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function cloneWindows(windows: TimeWindowValue[]): TimeWindowValue[] {
  return windows.map((window) => ({ ...window }));
}

/** Copy Monday windows onto the given days (enables them). Monday itself is left unchanged. */
export function replicateMondaySchedule(
  days: DayHoursValue[],
  mode: "weekdays" | "all",
): DayHoursValue[] {
  const monday = days.find((day) => day.dayOfWeek === "monday");
  if (!monday?.enabled || monday.windows.length === 0) return days;

  const targets =
    mode === "weekdays" ? WEEKDAY_COPY_TARGETS : ALL_DAYS_COPY_TARGETS;
  const targetSet = new Set(targets);
  const windows = cloneWindows(monday.windows);

  return days.map((day) => {
    if (!targetSet.has(day.dayOfWeek)) return day;
    return {
      ...day,
      enabled: true,
      windows: cloneWindows(windows),
    };
  });
}

export function canReplicateMondaySchedule(
  days: DayHoursValue[],
  mode: "weekdays" | "all",
): boolean {
  const monday = days.find((day) => day.dayOfWeek === "monday");
  if (!monday?.enabled || monday.windows.length === 0) return false;

  const next = replicateMondaySchedule(days, mode);
  return countScheduleWindows(next) <= MAX_SCHEDULE_WINDOWS;
}

const timeWindowSchema = Yup.object({
  start: Yup.string()
    .required("Indica la hora de inicio.")
    .matches(TIME_HH_MM, "Usa formato HH:mm."),
  end: Yup.string()
    .required("Indica la hora de fin.")
    .matches(TIME_HH_MM, "Usa formato HH:mm.")
    .test(
      "after-start",
      "La hora de fin debe ser posterior al inicio.",
      function afterStart(end) {
        const start = this.parent.start as string | undefined;
        if (!start || !end) return true;
        return end > start;
      },
    ),
  productId: Yup.string().trim(),
});

export const dayHoursSchema = Yup.object({
  dayOfWeek: Yup.string().required(),
  enabled: Yup.boolean().required(),
  windows: Yup.array()
    .of(timeWindowSchema)
    .when("enabled", {
      is: true,
      then: (schema) =>
        schema
          .min(1, "Agrega al menos un horario para este día.")
          .test(
            "no-overlap",
            "Los horarios del mismo día no se pueden solapar.",
            (windows) => {
              if (!windows || windows.length < 2) return true;
              const sorted = [...windows].sort((a, b) =>
                (a?.start ?? "").localeCompare(b?.start ?? ""),
              );
              for (let index = 1; index < sorted.length; index += 1) {
                const previous = sorted[index - 1];
                const current = sorted[index];
                if (!previous?.end || !current?.start) continue;
                if (current.start < previous.end) return false;
              }
              return true;
            },
          ),
      otherwise: (schema) => schema,
    }),
});

export const daysScheduleSchema = Yup.array()
  .of(dayHoursSchema)
  .test(
    "at-least-one-day",
    "Activa al menos un día de atención.",
    (days) => Boolean(days?.some((day) => day?.enabled && day.windows?.length)),
  )
  .test(
    "max-windows",
    `Puedes configurar hasta ${MAX_SCHEDULE_WINDOWS} franjas horarias.`,
    (days) => countScheduleWindows((days ?? []) as DayHoursValue[]) <= MAX_SCHEDULE_WINDOWS,
  );
