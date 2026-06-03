"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityFeed } from '@/components/ui/activity-feed';
import { Button } from '@/components/ui/button';

interface GroupedUpdates {
  [key: string]: {
    title: string;
    items: any[];
  };
}

export default function ActivityPageClient({ 
  initialViewMode, 
  groupedUpdates 
}: { 
  initialViewMode: "project" | "person";
  groupedUpdates: GroupedUpdates;
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"project" | "person">(initialViewMode);

  const handleViewChange = (mode: "project" | "person") => {
    setViewMode(mode);
    router.push(`/dashboard/activity?view=${mode}`);
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
          📊 動態總覽
        </h1>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-card)', padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
          <button
            onClick={() => handleViewChange('project')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              background: viewMode === 'project' ? 'var(--accent-purple)' : 'transparent',
              color: viewMode === 'project' ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
          >
            按專案看
          </button>
          <button
            onClick={() => handleViewChange('person')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.25rem',
              border: 'none',
              background: viewMode === 'person' ? 'var(--accent-blue)' : 'transparent',
              color: viewMode === 'person' ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
          >
            按人員看
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {Object.entries(groupedUpdates).length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            目前沒有任何動態
          </div>
        ) : (
          Object.entries(groupedUpdates).map(([key, group]) => (
            <div key={key} className="glass-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ 
                fontSize: '1.125rem', 
                fontWeight: 600, 
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {viewMode === 'project' ? '📁' : '👤'} {group.title}
              </h2>
              
              <ActivityFeed 
                items={group.items} 
                viewMode={viewMode}
                emptyMessage="此群組無動態"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
