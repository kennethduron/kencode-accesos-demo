export type NativeTemporalType = "date" | "time" | "datetime-local";

const monthLabels = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sept", "oct", "nov", "dic"] as const;

export function getTemporalPlaceholder(type: NativeTemporalType) {
  if (type === "date") return "Seleccionar fecha";
  if (type === "time") return "Seleccionar hora";
  return "Seleccionar fecha y hora";
}

function formatDatePart(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  const monthLabel = monthLabels[Number(month) - 1];
  if (!monthLabel) return value;
  return `${Number(day)} ${monthLabel} ${year}`;
}

function formatTimePart(value: string) {
  const match = /^(\d{2}):(\d{2})/.exec(value);
  if (!match) return value;
  const hours = Number(match[1]);
  const minutes = match[2];
  if (hours > 23) return value;
  const period = hours >= 12 ? "p. m." : "a. m.";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${period}`;
}

export function formatTemporalDisplayValue(type: NativeTemporalType, value: string) {
  if (!value) return getTemporalPlaceholder(type);
  if (type === "date") return formatDatePart(value);
  if (type === "time") return formatTimePart(value);

  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return value;
  return `${formatDatePart(datePart)} · ${formatTimePart(timePart)}`;
}
