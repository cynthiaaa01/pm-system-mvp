import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { background: string; color: string; dotColor: string }> = {
  success: {
    background: 'var(--success-bg)',
    color: 'var(--success)',
    dotColor: 'var(--success)',
  },
  warning: {
    background: 'var(--warning-bg)',
    color: 'var(--warning)',
    dotColor: 'var(--warning)',
  },
  danger: {
    background: 'var(--danger-bg)',
    color: 'var(--danger)',
    dotColor: 'var(--danger)',
  },
  info: {
    background: 'var(--info-bg)',
    color: 'var(--info)',
    dotColor: 'var(--info)',
  },
  purple: {
    background: 'rgba(108, 92, 231, 0.15)',
    color: 'var(--accent-purple-light)',
    dotColor: 'var(--accent-purple)',
  },
  default: {
    background: 'var(--bg-glass)',
    color: 'var(--text-secondary)',
    dotColor: 'var(--text-muted)',
  },
};

export function Badge({
  variant = 'default',
  dot = false,
  children,
  className = '',
}: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: '0.1875rem 0.625rem',
        fontSize: '0.75rem',
        fontWeight: 500,
        fontFamily: 'var(--font-family)',
        borderRadius: '9999px',
        whiteSpace: 'nowrap',
        lineHeight: 1.5,
        background: styles.background,
        color: styles.color,
        letterSpacing: '0.01em',
      }}
    >
      {dot && (
        <span
          aria-hidden="true"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: styles.dotColor,
            flexShrink: 0,
            boxShadow: `0 0 4px ${styles.dotColor}`,
          }}
        />
      )}
      {children}
    </span>
  );
}
