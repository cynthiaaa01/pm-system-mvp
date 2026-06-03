"use client";

import React, { useState } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Select } from './select';
import { UpdateType } from '@/types/database';

interface UpdateComposerProps {
  taskId: string;
  projectId: string;
  onSubmit: (content: string, type: UpdateType, file?: File) => Promise<void>;
  placeholder?: string;
}

const UPDATE_TYPES: { value: UpdateType; label: string; icon: string }[] = [
  { value: 'progress', label: '進度更新', icon: '📝' },
  { value: 'status_change', label: '狀態變更', icon: '🔄' },
  { value: 'file_upload', label: '檔案上傳', icon: '📎' },
  { value: 'date_change', label: '時間展延', icon: '📅' },
  { value: 'comment', label: '備註留言', icon: '💬' },
  { value: 'milestone', label: '里程碑', icon: '🚩' },
];

export function UpdateComposer({ taskId, projectId, onSubmit, placeholder = '輸入任務最新進度...' }: UpdateComposerProps) {
  const [content, setContent] = useState('');
  const [type, setType] = useState<UpdateType>('progress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, type, file || undefined);
      setContent('');
      setFile(null);
      setType('progress');
    } catch (error) {
      console.error('Failed to submit update', error);
      alert('更新失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{ width: '140px', flexShrink: 0 }}>
          <Select
            value={type}
            onChange={(e) => setType(e.target.value as UpdateType)}
            options={UPDATE_TYPES.map(t => ({
              value: t.value,
              label: `${t.icon} ${t.label}`
            }))}
          />
        </div>
        <div style={{ flexGrow: 1 }}>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={2}
            style={{ minHeight: '60px', resize: 'vertical' }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <input
            type="file"
            id={`file-upload-${taskId}`}
            style={{ display: 'none' }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label 
            htmlFor={`file-upload-${taskId}`}
            style={{ 
              cursor: 'pointer', 
              color: file ? 'var(--accent-blue)' : 'var(--text-muted)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            📎 {file ? file.name : '附加檔案'}
          </label>
        </div>
        
        <Button 
          type="submit" 
          variant="primary" 
          disabled={isSubmitting || (!content.trim() && !file)}
        >
          {isSubmitting ? '發佈中...' : '發佈更新'}
        </Button>
      </div>
    </form>
  );
}
