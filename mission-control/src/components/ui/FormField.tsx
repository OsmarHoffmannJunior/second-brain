'use client';

interface FormFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export function FormField({ label, required, optional, children, hint }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
          {label}
        </label>
        {required && <span className="text-xs text-[var(--accent)]">*</span>}
        {optional && <span className="text-xs text-[var(--text-muted)] italic">(opcional)</span>}
      </div>
      {children}
      {hint && <p className="text-xs text-[var(--text-muted)]">{hint}</p>}
    </div>
  );
}
