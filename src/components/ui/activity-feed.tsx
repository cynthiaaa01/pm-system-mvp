"use client";

import React from 'react';
import { Avatar } from './avatar';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { UserRole } from '@/types/database';

export interface ActivityItem {
  id: string;
  content: string;
  update_type: string;
  created_at: string;
  metadata?: any;
  author?: {
    full_name: string;
    avatar_url?: string | null;
    role: UserRole;
  };
  task?: {
    title: string;
  };
  project?: {
    name: string;
  };
}

interface ActivityFeedProps {
  items: ActivityItem[];
  viewMode?: 'project' | 'person';
  emptyMessage?: string;
}

export function ActivityFeed({ items, viewMode = 'project', emptyMessage = '尚無任何動態' }: ActivityFeedProps) {
  if (!items || items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        {emptyMessage}
      </div>
    );
  }

  const getRoleColor = (role?: UserRole) => {
    switch (role) {
      case 'sales': return 'var(--accent-purple)';
      case 'operations': return 'var(--accent-green)';
      case 'marketing': return 'var(--accent-blue)';
      default: return 'var(--text-muted)';
    }
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'progress': return '📝';
      case 'status_change': return '🔄';
      case 'file_upload': return '📎';
      case 'date_change': return '📅';
      case 'milestone': return '🚩';
      default: return '💬';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {items.map((item) => (
        <div 
          key={item.id}
          className="glass-card"
          style={{ 
            padding: '1rem', 
            display: 'flex', 
            gap: '1rem',
            borderLeft: `4px solid ${getRoleColor(item.author?.role)}`
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <Avatar 
              name={item.author?.full_name || 'System'} 
              src={item.author?.avatar_url || undefined} 
              size="sm" 
            />
          </div>
          
          <div style={{ flexGrow: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
              <div style={{ fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {item.author?.full_name || '系統'}
                </span>
                
                <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>•</span>
                
                <span style={{ color: 'var(--text-secondary)' }}>
                  {viewMode === 'person' && item.project ? (
                    <span style={{ fontWeight: 500 }}>[{item.project.name}] </span>
                  ) : null}
                  {item.task?.title}
                </span>
              </div>
              
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: zhTW })}
              </div>
            </div>
            
            <div style={{ 
              fontSize: '0.9375rem', 
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <span>{getUpdateIcon(item.update_type)}</span>
              <span style={{ marginTop: '0.1rem' }}>{item.content}</span>
            </div>
            
            {item.metadata?.file_url && (
              <a 
                href={item.metadata.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginTop: '0.75rem',
                  padding: '0.25rem 0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  textDecoration: 'none'
                }}
              >
                📎 {item.metadata.file_name || '附件檔案'}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
