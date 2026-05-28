'use client';

import React from 'react';

interface ProgressBarProps {
  value: number;      // 0–100
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ProgressBar({
  value,
  showLabel = true,
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const height = size === 'sm' ? '6px' : '8px';

  return (
    <>
      <div className={`pm-progress ${className}`}>
        {showLabel && (
          <div className="pm-progress__header">
            <span className="pm-progress__label">{Math.round(clamped)}%</span>
          </div>
        )}
        <div className="pm-progress__track">
          <div
            className="pm-progress__fill"
            role="progressbar"
            aria-valuenow={clamped}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: `${clamped}%`, height }}
          />
        </div>
      </div>

      <style jsx>{`
        .pm-progress {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          width: 100%;
        }

        .pm-progress__header {
          display: flex;
          justify-content: flex-end;
        }

        .pm-progress__label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          font-variant-numeric: tabular-nums;
        }

        .pm-progress__track {
          width: 100%;
          height: ${height};
          background: var(--bg-glass);
          border-radius: 9999px;
          overflow: hidden;
        }

        .pm-progress__fill {
          height: 100%;
          border-radius: 9999px;
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-blue-light));
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          animation: progressFill 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .pm-progress__fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.15) 50%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s ease-in-out infinite;
        }

        @keyframes progressFill {
          from {
            width: 0%;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </>
  );
}
