'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = '520px',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [open]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      const rect = dialog.getBoundingClientRect();
      const isInDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!isInDialog) {
        onClose();
      }
    },
    [onClose]
  );

  const handleCancel = useCallback(
    (e: React.SyntheticEvent<HTMLDialogElement>) => {
      e.preventDefault();
      onClose();
    },
    [onClose]
  );

  if (!open) return null;

  return (
    <>
      <dialog
        ref={dialogRef}
        className="pm-modal"
        onClick={handleBackdropClick}
        onCancel={handleCancel}
        style={{
          maxWidth,
          width: '90vw',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-primary)',
          padding: 0,
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(108, 92, 231, 0.1)',
          animation: 'modalIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
        aria-labelledby={title ? 'pm-modal-title' : undefined}
      >
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2
              id="pm-modal-title"
              style={{
                fontSize: '1.0625rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close dialog"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                transition: 'var(--transition)',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                fontSize: '1.125rem',
                fontFamily: 'var(--font-family)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-glass-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </dialog>

      <style jsx>{`
        .pm-modal::backdrop {
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
}
