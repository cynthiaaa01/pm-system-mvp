import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({
  label,
  error,
  hint,
  id,
  className = '',
  rows = 4,
  ...props
}: TextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && (
        <label
          htmlFor={textareaId}
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

      <textarea
        id={textareaId}
        className={className}
        rows={rows}
        style={{
          width: '100%',
          padding: '0.625rem 0.875rem',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-family)',
          color: 'var(--text-primary)',
          background: 'var(--bg-glass)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-md)',
          outline: 'none',
          transition: 'var(--transition)',
          resize: 'vertical',
          lineHeight: 1.6,
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
        {...props}
      />

      {hint && !error && (
        <p
          id={`${textareaId}-hint`}
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
          id={`${textareaId}-error`}
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
