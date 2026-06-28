import { InputHTMLAttributes, useId } from "react";

export function Input({
  label, error, id, className = "", ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const auto = useId();
  const inputId = id ?? auto;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm text-muted">{label}</label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-err` : undefined}
        className={`min-h-11 w-full rounded-xl border bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted/60 focus:border-primary focus:outline-none ${
          error ? "border-danger" : "border-border"
        } ${className}`}
        {...props}
      />
      {error && <p id={`${inputId}-err`} className="text-sm text-danger">{error}</p>}
    </div>
  );
}