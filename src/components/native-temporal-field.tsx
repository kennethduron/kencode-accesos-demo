import { CalendarDays, CalendarRange, Clock3 } from "lucide-react";
import type { ChangeEventHandler, InputHTMLAttributes, ReactNode } from "react";
import { formatTemporalDisplayValue, type NativeTemporalType } from "@/lib/temporal-field";

interface NativeTemporalFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "value" | "onChange"> {
  id: string;
  type: NativeTemporalType;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  label: ReactNode;
  error?: string | undefined;
  containerClassName?: string;
}

const icons = {
  date: CalendarDays,
  time: Clock3,
  "datetime-local": CalendarRange,
} as const;

export function NativeTemporalField({
  type,
  id,
  value,
  onChange,
  label,
  error,
  containerClassName = "",
  disabled,
  className = "",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...inputProps
}: NativeTemporalFieldProps) {
  const Icon = icons[type];
  const invalid = Boolean(error) || ariaInvalid === true || ariaInvalid === "true";
  const errorId = `${id}-error`;
  const describedBy = error
    ? Array.from(new Set([...(ariaDescribedBy?.split(/\s+/).filter(Boolean) ?? []), errorId])).join(" ")
    : ariaDescribedBy;

  return (
    <div className={`min-w-0 max-w-full ${containerClassName}`}>
      <label htmlFor={id} className="form-label">{label}</label>
      <div className={`temporal-field-shell ${invalid ? "temporal-field-shell-invalid" : ""} ${disabled ? "temporal-field-shell-disabled" : ""}`}>
        <span aria-hidden="true" className={`temporal-field-display ${value ? "text-slate-900" : "text-slate-500"}`}>
          {formatTemporalDisplayValue(type, value)}
        </span>
        <Icon aria-hidden="true" className="temporal-field-icon" />
        <input
          {...inputProps}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-describedby={describedBy}
          aria-invalid={invalid ? true : ariaInvalid}
          className={`form-control temporal-field-input ${className}`}
        />
      </div>
      {error ? <p id={errorId} role="alert" className="mt-2 text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
