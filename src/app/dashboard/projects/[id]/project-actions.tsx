"use client";

import { useState } from "react";
import { deleteProject } from "@/actions/projects";
import { useRouter } from "next/navigation";

export default function ProjectActions({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("確定要刪除此專案嗎？這將會一併刪除底下的所有任務與動態，且操作無法復原。")) return;
    
    setLoading(true);
    const res = await deleteProject(projectId);
    if (res?.error) {
      alert("刪除失敗：" + res.error);
      setLoading(false);
    } else {
      router.push("/dashboard/projects");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      style={{
        padding: "8px 12px",
        background: "transparent",
        border: "1px solid rgba(255, 71, 87, 0.5)",
        color: "#ff4757",
        borderRadius: "var(--radius-md)",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "13px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        opacity: loading ? 0.7 : 1,
        transition: "all 0.2s"
      }}
      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(255, 71, 87, 0.1)"; }}
      onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      🗑️ 刪除專案
    </button>
  );
}
