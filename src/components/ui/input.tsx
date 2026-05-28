import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  hint?: string;
}

export function Input({
  label,
  error,
  icon,
  hint,
  id,
  className = '',
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="pm-input-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              fontSize: '1rem',
            }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        <input
          id={inputId}
          className={className}
          style={{
            width: '100%',
            padding: icon ? '0.625rem 0.875rem 0.625rem 2.5rem' : '0.625rem 0.875rem',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-family)',
            color: 'var(--text-primary)',
            background: 'var(--bg-glass)',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            transition: 'var(--transition)',
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      </div>

      {hint && !error && (
        <p
          id={`${inputId}-hint`}
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.125rem',
          }}
        >
          {hint}
        </p>
      )}

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: 'var(--danger)',
            marginTop: '0.125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
            <path d="M6 3.5V6.5" stroke="currentColor" strokeLinecap="round" />
            <circle cx="6" cy="8.25" r="0.5" fill="currentColor" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
