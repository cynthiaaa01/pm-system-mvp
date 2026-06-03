"use client";

import { useState, useEffect } from "react";
import { searchKnowledgeBase } from "@/actions/search";
import { PREDEFINED_TAGS, PROJECT_STATUS_LABELS } from "@/lib/constants";
import Link from "next/link";
import type { ProjectStatus } from "@/types/database";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // If no query and no tags, don't search automatically unless we want to show all
    if (query === "" && selectedTags.length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 500); // debounce

    return () => clearTimeout(timer);
  }, [query, selectedTags]);

  const performSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    const data = await searchKnowledgeBase(query, selectedTags);
    setResults(data);
    setLoading(false);
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px" }}>
          知識庫與全域搜尋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "16px", marginBottom: "32px" }}>
          在此搜尋專案名稱、描述、標籤，或是任何包含該關鍵字的任務。
        </p>

        {/* Search Bar */}
        <div style={{ position: "relative", maxWidth: "600px", margin: "0 auto" }}>
          <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", color: "var(--text-muted)" }}>
            🔍
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="輸入專案名稱、客戶名稱或任何任務關鍵字..."
            style={{
              width: "100%", padding: "16px 16px 16px 48px", borderRadius: "100px",
              background: "var(--bg-glass)", border: "1px solid var(--border)",
              color: "var(--text-primary)", fontSize: "16px", outline: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)", backdropFilter: "blur(12px)"
            }}
          />
        </div>

        {/* Tag Filters */}
        <div style={{ maxWidth: "800px", margin: "24px auto 0", display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
          {PREDEFINED_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{
                padding: "6px 14px", borderRadius: "100px", fontSize: "13px", cursor: "pointer", transition: "all 0.2s",
                background: selectedTags.includes(tag) ? "var(--accent-purple)" : "var(--bg-tertiary)",
                color: selectedTags.includes(tag) ? "white" : "var(--text-secondary)",
                border: selectedTags.includes(tag) ? "1px solid var(--accent-purple)" : "1px solid var(--border)",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div style={{ marginTop: "20px" }}>
          <h2 style={{ fontSize: "18px", color: "var(--text-primary)", marginBottom: "16px" }}>
            搜尋結果 <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "400" }}>({results.length} 筆相符專案)</span>
            {loading && <span style={{ marginLeft: "12px", fontSize: "14px", color: "var(--accent-purple-light)" }}>搜尋中...</span>}
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
            {results.map(project => {
              // 找出匹配的任務
              const q = query.toLowerCase().trim();
              const matchedTasks = q ? project.tasks?.filter((t: any) => t.title.toLowerCase().includes(q)) : [];

              return (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`} style={{ textDecoration: "none" }}>
                  <div className="glass-card hover-scale" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                          {project.name}
                          <span style={{ fontSize: "12px", padding: "2px 8px", background: "var(--bg-tertiary)", borderRadius: "100px", color: "var(--text-secondary)" }}>
                            {PROJECT_STATUS_LABELS[project.status as ProjectStatus] || project.status}
                          </span>
                        </h3>
                        <p style={{ margin: 0, fontSize: "14px", color: "var(--text-secondary)" }}>{project.project_number}</p>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "300px" }}>
                        {(project.tags || []).map((t: string) => (
                          <span key={t} style={{ 
                            fontSize: "11px", padding: "2px 8px", borderRadius: "4px",
                            background: "rgba(108, 92, 231, 0.1)", color: "var(--accent-purple-light)"
                          }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {matchedTasks && matchedTasks.length > 0 && (
                      <div style={{ background: "var(--bg-tertiary)", padding: "12px", borderRadius: "var(--radius-sm)", marginTop: "8px" }}>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 8px 0" }}>找到相符的任務：</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          {matchedTasks.slice(0, 3).map((t: any) => (
                            <div key={t.id} style={{ fontSize: "13px", color: "var(--text-primary)", display: "flex", gap: "8px" }}>
                              <span style={{ color: "var(--accent-green)" }}>✓</span> {t.title}
                            </div>
                          ))}
                          {matchedTasks.length > 3 && (
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>...還有 {matchedTasks.length - 3} 個相符項目</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}

            {!loading && results.length === 0 && (
              <div className="glass-card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                <p>找不到符合條件的結果，請嘗試其他關鍵字或標籤組合。</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
