"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { PROJECT_STATUS_LABELS } from "@/lib/constants";

export default function ProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "";
  const currentSearch = searchParams.get("search") || "";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  return (
    <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
      <div style={{ position: "relative", minWidth: "240px" }}>
        <input
          type="text"
          placeholder="搜尋專案..."
          defaultValue={currentSearch}
          onChange={(e) => {
            const query = createQueryString("search", e.target.value);
            router.push(`${pathname}?${query}`);
          }}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "var(--bg-glass)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        />
      </div>

      <select
        value={currentStatus}
        onChange={(e) => {
          const query = createQueryString("status", e.target.value);
          router.push(`${pathname}?${query}`);
        }}
        style={{
          padding: "8px 12px",
          background: "var(--bg-glass)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-primary)",
          fontSize: "14px",
          minWidth: "160px",
        }}
      >
        <option value="">全部狀態</option>
        {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
