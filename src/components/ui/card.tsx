import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className = '',
  noPadding = false,
  style,
}: CardProps) {
  const hasHeader = title || subtitle || actions;

  return (
    <div
      className={`glass-card ${className}`}
      style={{
        animation: 'fadeIn 0.3s ease-out',
        ...style,
      }}
    >
      {hasHeader && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border)',
            gap: '1rem',
          }}
        >
          <div style={{ minWidth: 0 }}>
            {title && (
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.125rem',
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexShrink: 0,
              }}
            >
              {actions}
            </div>
          )}
        </div>
      )}

      <div style={{ padding: noPadding ? 0 : '1.5rem' }}>
        {children}
      </div>
    </div>
  );
}
