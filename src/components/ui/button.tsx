'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <>
      <button
        className={`pm-btn pm-btn--${variant} pm-btn--${size} ${fullWidth ? 'pm-btn--full' : ''} ${className}`}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <span className="pm-btn__spinner" aria-hidden="true" />
        )}
        <span className={loading ? 'pm-btn__content--loading' : ''}>
          {children}
        </span>
      </button>

      <style jsx>{`
        .pm-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: var(--font-family);
          font-weight: 500;
          border: 1px solid transparent;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
          position: relative;
          overflow: hidden;
          user-select: none;
          letter-spacing: 0.01em;
        }

        .pm-btn:active:not(:disabled) {
          transform: scale(0.97);
        }

        .pm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* ── Sizes ── */
        .pm-btn--sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.8125rem;
          border-radius: var(--radius-sm);
        }

        .pm-btn--md {
          padding: 0.5625rem 1.125rem;
          font-size: 0.875rem;
        }

        .pm-btn--lg {
          padding: 0.75rem 1.5rem;
          font-size: 0.9375rem;
          border-radius: var(--radius-md);
        }

        .pm-btn--full {
          width: 100%;
        }

        /* ── Primary ── */
        .pm-btn--primary {
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
          color: #fff;
          box-shadow: 0 2px 8px rgba(108, 92, 231, 0.3);
        }

        .pm-btn--primary:hover:not(:disabled) {
          box-shadow: 0 4px 20px rgba(108, 92, 231, 0.45);
          transform: translateY(-1px);
        }

        /* ── Secondary ── */
        .pm-btn--secondary {
          background: var(--bg-glass);
          color: var(--text-primary);
          border-color: var(--border);
        }

        .pm-btn--secondary:hover:not(:disabled) {
          background: var(--bg-glass-hover);
          border-color: var(--border-hover);
          transform: translateY(-1px);
        }

        /* ── Danger ── */
        .pm-btn--danger {
          background: var(--danger-bg);
          color: var(--danger);
          border-color: rgba(225, 112, 85, 0.25);
        }

        .pm-btn--danger:hover:not(:disabled) {
          background: rgba(225, 112, 85, 0.25);
          box-shadow: 0 4px 16px rgba(225, 112, 85, 0.2);
          transform: translateY(-1px);
        }

        /* ── Ghost ── */
        .pm-btn--ghost {
          background: transparent;
          color: var(--text-secondary);
        }

        .pm-btn--ghost:hover:not(:disabled) {
          background: var(--bg-glass);
          color: var(--text-primary);
        }

        /* ── Loading Spinner ── */
        .pm-btn__spinner {
          width: 1em;
          height: 1em;
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          flex-shrink: 0;
        }

        .pm-btn__content--loading {
          opacity: 0.75;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
