import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1.5rem',
        animation: 'fadeIn 0.4s ease-out',
      }}
    >
      {icon && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--bg-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            fontSize: '1.75rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          {icon}
        </div>
      )}

      <h3
        style={{
          fontSize: '1.0625rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '0.375rem',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            maxWidth: '360px',
            lineHeight: 1.6,
            marginBottom: action ? '1.25rem' : 0,
          }}
        >
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}
