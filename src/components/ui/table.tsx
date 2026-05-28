import React from 'react';

/* ── Table Root ── */
interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div
      className={className}
      style={{
        overflowX: 'auto',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: 0,
        }}
      >
        {children}
      </table>
    </div>
  );
}

/* ── Table Header ── */
interface TableHeaderProps {
  children: React.ReactNode;
}

export function TableHeader({ children }: TableHeaderProps) {
  return <thead>{children}</thead>;
}

/* ── Table Body ── */
interface TableBodyProps {
  children: React.ReactNode;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody>{children}</tbody>;
}

/* ── Table Row ── */
interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className = '' }: TableRowProps) {
  return (
    <tr
      className={className}
      onClick={onClick}
      style={{
        transition: 'var(--transition)',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      {children}
    </tr>
  );
}

/* ── Table Head Cell ── */
interface TableHeadProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export function TableHead({ children, align = 'left', width }: TableHeadProps) {
  return (
    <th
      style={{
        textAlign: align,
        padding: '0.75rem 1rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-glass)',
        whiteSpace: 'nowrap',
        width,
      }}
    >
      {children}
    </th>
  );
}

/* ── Table Cell ── */
interface TableCellProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export function TableCell({ children, align = 'left' }: TableCellProps) {
  return (
    <td
      style={{
        textAlign: align,
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {children}
    </td>
  );
}

/* ── Table Empty State ── */
interface TableEmptyProps {
  colSpan: number;
  message?: string;
  icon?: React.ReactNode;
}

export function TableEmpty({
  colSpan,
  message = 'No data found',
  icon,
}: TableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        style={{
          textAlign: 'center',
          padding: '3rem 1rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          {icon && (
            <span style={{ fontSize: '2rem', opacity: 0.5 }}>{icon}</span>
          )}
          <span>{message}</span>
        </div>
      </td>
    </tr>
  );
}
