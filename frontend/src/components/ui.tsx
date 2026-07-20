import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  block?: boolean;
};

export function Button({
  variant = "primary",
  block = false,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant}${block ? " button-block" : ""} ${className}`}
      {...props}
    />
  );
}

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`card ${className}`} {...props} />;
}

export function Field({
  label,
  hint,
  error,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  error?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        className="input"
        id={id}
        aria-describedby={
          [hintId, errorId].filter(Boolean).join(" ") || undefined
        }
        aria-invalid={Boolean(error)}
        {...props}
      />
      {hint ? (
        <span className="hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="error-text" id={errorId}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value?: T;
  options: { value: T; label: string; description?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="stack-sm" style={{ border: 0, padding: 0, margin: 0 }}>
      <legend className="legend">{label}</legend>
      <div className="choice-grid">
        {options.map((option) => (
          <button
            key={option.value}
            className="choice"
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
          >
            <span>
              {option.label}
              {option.description ? (
                <small
                  className="muted"
                  style={{ display: "block", fontWeight: 400 }}
                >
                  {option.description}
                </small>
              ) : null}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function Progress({
  current,
  total,
  label,
}: {
  current: number;
  total: number;
  label: string;
}) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="progress-wrap">
      <div className="progress-meta">
        <span>{label}</span>
        <span>
          Étape {current} sur {total}
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div className="progress-value" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function ClinicalProvisional({ children }: { children: ReactNode }) {
  return (
    <div className="notice">
      <span aria-hidden="true">◇</span>
      <div>
        <span className="clinical-label">Contenu clinique provisoire</span>
        <p>{children}</p>
      </div>
    </div>
  );
}

export function MobileNavigation() {
  return (
    <nav className="mobile-nav" aria-label="Navigation principale">
      <a href="#" aria-current="page">
        Aujourd’hui
      </a>
      <a href="#">Programme</a>
      <a href="#">Progression</a>
      <a href="#">Exercices</a>
      <a href="#">Profil</a>
    </nav>
  );
}
