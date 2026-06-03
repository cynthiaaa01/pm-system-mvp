"use client";

import { useState } from "react";
import { PREDEFINED_TAGS } from "@/lib/constants";
import { updateProjectTags } from "@/actions/search";

interface TagManagerProps {
  projectId: string;
  initialTags: string[];
}

export function TagManager({ projectId, initialTags }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>(initialTags || []);
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTag = async (tag: string) => {
    if (!tag.trim() || tags.includes(tag.trim())) return;
    
    const updatedTags = [...tags, tag.trim()];
    setTags(updatedTags);
    
    setLoading(true);
    await updateProjectTags(projectId, updatedTags);
    setLoading(false);
    setNewTag("");
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter(t => t !== tagToRemove);
    setTags(updatedTags);
    
    setLoading(true);
    await updateProjectTags(projectId, updatedTags);
    setLoading(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
        {tags.length > 0 ? tags.map((tag) => (
          <span key={tag} style={{ 
            padding: "4px 10px", borderRadius: "100px", fontSize: "12px", fontWeight: "500",
            background: "rgba(108, 92, 231, 0.15)", color: "var(--accent-purple-light)",
            display: "flex", alignItems: "center", gap: "6px",
            border: "1px solid rgba(108, 92, 231, 0.3)"
          }}>
            {tag}
            <button 
              onClick={() => handleRemoveTag(tag)}
              disabled={loading}
              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0, fontSize: "12px", lineHeight: 1 }}
            >
              ×
            </button>
          </span>
        )) : (
          <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>未設定</span>
        )}
        
        <button 
          onClick={() => setIsEditing(!isEditing)}
          style={{ background: "transparent", border: "1px dashed var(--border)", borderRadius: "100px", padding: "2px 8px", fontSize: "12px", color: "var(--text-secondary)", cursor: "pointer" }}
        >
          {isEditing ? "完成" : "+ 新增標籤"}
        </button>
      </div>

      {isEditing && (
        <div style={{ 
          position: "absolute", top: "100%", left: 0, marginTop: "8px", zIndex: 10,
          background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
          padding: "12px", width: "300px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)"
        }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--text-secondary)" }}>快速選擇預設標籤</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "150px", overflowY: "auto", marginBottom: "12px" }}>
            {PREDEFINED_TAGS.map(preset => (
              <button
                key={preset}
                onClick={() => handleAddTag(preset)}
                disabled={tags.includes(preset) || loading}
                style={{ 
                  padding: "4px 8px", borderRadius: "4px", fontSize: "11px", cursor: "pointer",
                  background: tags.includes(preset) ? "var(--bg-tertiary)" : "transparent",
                  border: "1px solid var(--border)",
                  color: tags.includes(preset) ? "var(--text-muted)" : "var(--text-primary)"
                }}
              >
                {preset}
              </button>
            ))}
          </div>
          
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "12px", color: "var(--text-secondary)" }}>或輸入自訂標籤</h4>
            <div style={{ display: "flex", gap: "8px" }}>
              <input 
                type="text" 
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddTag(newTag)}
                placeholder="輸入後按 Enter..."
                style={{ 
                  flex: 1, padding: "6px 8px", borderRadius: "4px", border: "1px solid var(--border)", 
                  background: "var(--bg-tertiary)", color: "var(--text-primary)", fontSize: "12px", outline: "none"
                }}
              />
              <button 
                onClick={() => handleAddTag(newTag)}
                disabled={!newTag.trim() || loading}
                className="btn-primary"
                style={{ padding: "4px 10px", fontSize: "12px" }}
              >
                新增
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
