const messages = [
  {
    speaker: "Cliente",
    text: "¿A qué hora abren los sábados?",
    fromBusiness: false,
  },
  {
    speaker: "Gimnasio",
    text: "Abrimos de 8:00 a. m. a 1:00 p. m.",
    fromBusiness: true,
  },
  {
    speaker: "Cliente",
    text: "¿Cuánto cuesta la mensualidad?",
    fromBusiness: false,
  },
  {
    speaker: "Gimnasio",
    text: "La mensualidad cuesta USD 25.",
    fromBusiness: true,
  },
] as const;

export function GymExample({ anchor = false }: { anchor?: boolean }) {
  return (
    <figure
      id={anchor ? "ejemplo" : undefined}
      className="scroll-mt-24 rounded-card border border-border bg-surface p-4 md:p-6"
    >
      <figcaption className="text-label text-ink">Ejemplo ilustrativo</figcaption>
      <p className="mt-2 text-meta text-muted">
        Conversación de un gimnasio ficticio. El precio de esta mensualidad no
        es el precio de Respondi.
      </p>
      <ol className="mt-4 flex flex-col gap-3">
        {messages.map((message) => (
          <li
            key={`${message.speaker}-${message.text}`}
            className={
              message.fromBusiness
                ? "flex max-w-[92%] flex-col items-end gap-1 self-end"
                : "flex max-w-[92%] flex-col items-start gap-1 self-start"
            }
          >
            <span className="text-meta text-muted">{message.speaker}</span>
            <p
              className={
                message.fromBusiness
                  ? "rounded-control bg-mint px-3 py-2 text-body text-ink"
                  : "rounded-control border border-border bg-canvas px-3 py-2 text-body text-ink"
              }
            >
              {message.text}
            </p>
          </li>
        ))}
      </ol>
    </figure>
  );
}
