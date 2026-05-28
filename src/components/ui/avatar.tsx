'use client';

import React, { useState } from 'react';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeMap: Record<AvatarSize, { dimension: string; fontSize: string }> = {
  sm: { dimension: '28px', fontSize: '0.6875rem' },
  md: { dimension: '36px', fontSize: '0.8125rem' },
  lg: { dimension: '48px', fontSize: '1rem' },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    'linear-gradient(135deg, #0984e3, #74b9ff)',
    'linear-gradient(135deg, #00b894, #55efc4)',
    'linear-gradient(135deg, #e17055, #fab1a0)',
    'linear-gradient(135deg, #fdcb6e, #ffeaa7)',
    'linear-gradient(135deg, #6c5ce7, #0984e3)',
    'linear-gradient(135deg, #e17055, #6c5ce7)',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export function Avatar({
  src,
  alt,
  name = '',
  size = 'md',
  className = '',
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const { dimension, fontSize } = sizeMap[size];
  const showImage = src && !imgError;
  const initials = name ? getInitials(name) : '?';

  return (
    <div
      className={className}
      role="img"
      aria-label={alt || name || 'Avatar'}
      style={{
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize,
        fontWeight: 600,
        color: '#fff',
        background: showImage ? 'var(--bg-tertiary)' : getGradient(name),
        overflow: 'hidden',
        position: 'relative',
        border: '2px solid var(--border)',
        userSelect: 'none',
        letterSpacing: '0.02em',
      }}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
