export const ONBOARDING_SECTIONS = [
  {
    id: "negocio",
    href: "/cuenta/negocio",
    label: "Datos del negocio",
    description: "Nombre, contacto y datos básicos de tu negocio.",
  },
  {
    id: "productos",
    href: "/cuenta/productos",
    label: "Productos y servicios",
    description: "Catálogo de lo que ofreces a tus clientes.",
  },
  {
    id: "direcciones",
    href: "/cuenta/direcciones",
    label: "Direcciones y horarios",
    description: "Ubicaciones y horarios de atención.",
  },
  {
    id: "preguntas",
    href: "/cuenta/preguntas",
    label: "Preguntas frecuentes",
    description: "Respuestas a las consultas más comunes.",
  },
  {
    id: "whatsapp",
    href: "/cuenta/whatsapp",
    label: "Conectar WhatsApp",
    description: "Autoriza Respondi para atender mensajes de tu negocio.",
  },
] as const;

export type OnboardingSectionId = (typeof ONBOARDING_SECTIONS)[number]["id"];

export type OnboardingSectionStatus = "pending" | "done" | "skipped";

export type OnboardingPresence = Record<OnboardingSectionId, boolean>;

/** Data setup steps before WhatsApp (and before payment later). */
export const ONBOARDING_DATA_SECTION_IDS = [
  "negocio",
  "productos",
  "direcciones",
  "preguntas",
] as const satisfies readonly OnboardingSectionId[];

export type OnboardingDataSectionId =
  (typeof ONBOARDING_DATA_SECTION_IDS)[number];

const STORAGE_PREFIX = "respondi.onboarding.skipped.";
const EMPTY_SKIPPED: OnboardingSectionId[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();

/** Cache so useSyncExternalStore getSnapshot stays referentially stable. */
const snapshotCache = new Map<
  string,
  { raw: string | null; value: OnboardingSectionId[] }
>();

function storageKey(ownerId: string) {
  return `${STORAGE_PREFIX}${ownerId}`;
}

function canUseStorage() {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function emit() {
  snapshotCache.clear();
  for (const listener of listeners) listener();
}

export function subscribeOnboardingSkips(listener: Listener) {
  listeners.add(listener);

  if (canUseStorage() && listeners.size === 1) {
    window.addEventListener("storage", onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (canUseStorage() && listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function onStorage(event: StorageEvent) {
  if (!event.key || event.key.startsWith(STORAGE_PREFIX)) {
    emit();
  }
}

function parseSkipped(raw: string | null): OnboardingSectionId[] {
  if (!raw) return EMPTY_SKIPPED;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_SKIPPED;
    const allowed = new Set(
      ONBOARDING_SECTIONS.map((section) => section.id),
    );
    const filtered = parsed.filter(
      (value): value is OnboardingSectionId =>
        typeof value === "string" && allowed.has(value as OnboardingSectionId),
    );
    return filtered.length > 0 ? filtered : EMPTY_SKIPPED;
  } catch {
    return EMPTY_SKIPPED;
  }
}

export function readSkippedSections(ownerId: string): OnboardingSectionId[] {
  if (!canUseStorage() || !ownerId) return EMPTY_SKIPPED;

  try {
    const key = storageKey(ownerId);
    const raw = window.localStorage.getItem(key);
    const cached = snapshotCache.get(ownerId);
    if (cached && cached.raw === raw) return cached.value;

    const value = parseSkipped(raw);
    snapshotCache.set(ownerId, { raw, value });
    return value;
  } catch {
    return EMPTY_SKIPPED;
  }
}

function writeSkippedSections(ownerId: string, ids: OnboardingSectionId[]) {
  if (!canUseStorage() || !ownerId) return;
  window.localStorage.setItem(storageKey(ownerId), JSON.stringify(ids));
  emit();
}

export function skipOnboardingSection(
  ownerId: string,
  sectionId: OnboardingSectionId,
) {
  const current = readSkippedSections(ownerId);
  if (current.includes(sectionId)) return;
  writeSkippedSections(ownerId, [...current, sectionId]);
}

export function unskipOnboardingSection(
  ownerId: string,
  sectionId: OnboardingSectionId,
) {
  writeSkippedSections(
    ownerId,
    readSkippedSections(ownerId).filter((id) => id !== sectionId),
  );
}

export function sectionStatus(
  sectionId: OnboardingSectionId,
  presence: OnboardingPresence,
  skipped: readonly OnboardingSectionId[],
): OnboardingSectionStatus {
  if (presence[sectionId]) return "done";
  if (skipped.includes(sectionId)) return "skipped";
  return "pending";
}

export function isOnboardingComplete(
  presence: OnboardingPresence,
  skipped: readonly OnboardingSectionId[],
) {
  return ONBOARDING_SECTIONS.every(
    (section) => sectionStatus(section.id, presence, skipped) !== "pending",
  );
}

/** True when negocio → preguntas are done or skipped (simulator preview unlock). */
export function areOnboardingDataSectionsReady(
  presence: OnboardingPresence,
  skipped: readonly OnboardingSectionId[],
) {
  return ONBOARDING_DATA_SECTION_IDS.every(
    (id) => sectionStatus(id, presence, skipped) !== "pending",
  );
}
