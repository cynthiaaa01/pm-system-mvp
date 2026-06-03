# PM System 專案交接文件 (AI Handoff Document)

這是一份給下一個 AI 助理 (Claude, Cursor/Codex, 等) 的專案交接指南，協助你快速了解專案架構、目前進度與下一步的開發目標。

## 1. 專案技術棧 (Tech Stack)
- **核心框架**: Next.js 15 (App Router, Turbopack)
- **UI & 樣式**: React 19, Tailwind CSS (純手寫 CSS 變數做 Glassmorphism 風格)
- **資料庫 & 驗證**: Supabase (PostgreSQL, Row Level Security, Supabase Auth)
- **第三方整合**:
  - **Microsoft OneDrive API**: 用於儲存使用者上傳的報價單 (PDF/圖片等)。
  - **Google Gemini AI SDK** (`@google/genai`): 模型使用 `gemini-2.0-flash`，負責解析報價單內容。

## 2. 核心架構與檔案位置
- `src/app/` - Next.js App Router 的頁面，主要在 `/dashboard` 之下。
- `src/actions/` - Next.js Server Actions，處理資料庫寫入與業務邏輯 (如 `proposals.ts`, `clients.ts`)。
- `src/lib/` - 輔助工具，例如 `onedrive.ts` (微軟 API 串接), `ai-parser.ts` (Gemini 解析邏輯), `supabase/` (連線設定)。
- `supabase/migrations/` - 所有的資料庫 Schema (包含 Enum, Tables, RLS, 觸發器、View 以及新增的欄位)。

## 3. 資料庫結構概述 (Database Schema)
所有的關聯皆以 UUID 串接，受 Supabase RLS (Row Level Security) 保護。主要表格包含：
1. `profiles`: 擴充 auth.users 的使用者資料 (包含角色 admin, sales, operations 等)。
2. `clients`: 客戶資料。
3. `proposals`: 提案/報價單。
   - 近期新增欄位：`parsed_items` (JSONB, 儲存 AI 解析出來的報價單品項), `expected_start`, `expected_end`, `quotation_url`。
4. `projects`: 專案 (當 Proposal 狀態轉為 won 時自動建立)。
5. `tasks` / `task_templates`: 專案底下的任務與範本。

## 4. 已經完成的功能 (Completed Work)
✅ **資料庫建立**: Supabase 架構已完整部署，包含 RLS 與 Foreign Keys。
✅ **OneDrive 串接**: 使用者建立提案時若上傳報價單檔案，會自動透過 Microsoft Graph API 取得 Refresh Token 並上傳至雲端，取得永久連結。
✅ **Gemini AI 報價單解析**: 讀取上傳的報價單檔案 Buffer，請 AI 辨識品項名稱、數量、單價，並將 JSON 結構回傳。
✅ **建立提案 (CRM)**: 業務可以在 `/dashboard/crm/new` 填寫表單上傳報價單。系統會：
   1. 上傳檔案至 OneDrive
   2. 呼叫 Gemini 解析
   3. 寫入 Supabase `proposals` 表格 (包含 `parsed_items`)
✅ **提案轉專案 (Mark as Won)**: 
   在提案詳細頁面按下「標記成交」，系統會呼叫 Server Action `markAsWon`。
   - 將 Proposal 狀態改為 won。
   - 自動在 `projects` 建立一筆專案。
   - **注意**：因 `projects` 表格有 `operations_id` (PM) 的 NOT NULL 限制，目前系統在轉換時，會預設先將 `sales_person_id` 填入 `operations_id`，後續可再由系統重新指派。

## 5. 已經完成的功能 (Completed Work - Part 2)
✅ **任務 SOP 整合**: 已建立 `quotation_item_templates` 資料表，並將大量的任務 SOP 匯入。
✅ **預覽與匯入報價單任務**: 
   - 專案詳情頁新增了「✨ 匯入報價單任務」按鈕。
   - 點擊後會呼叫 `previewQuotationTasks`，利用 `fuzzyMatchItems` 自動配對報價單品項與 SOP 任務。
   - 提供 OP (營運人員) 一個預覽 Modal，可以在匯入前勾選特定任務，並直接**行內編輯 (Inline Edit)** 任務名稱、開始日期與截止日期。
   - 確認後呼叫 `importTasks` 寫入至 `tasks` 資料表。

## 6. 接下來的開發目標 (Next Steps)
使用者目前已經成功將「報價單品項」串接到「專案任務產生」！
接下來可能的發展方向：
1. **日曆或甘特圖視圖**：目前的任務是用表格條列，可以考慮引入行事曆或甘特圖元件。
2. **通知系統**：當 OP 指派任務給某人，或是任務快到期時，觸發信件或系統通知。
3. **任務範本管理 UI**：目前 `quotation_item_templates` 是透過 SQL 直接寫入，未來可建立一個後台介面，讓營運主管可以從前端自由新增、修改、刪除這些 SOP 任務範本。

---
*Hello fellow AI! The user is ready to continue. Please read this document, check the `src/actions/proposals.ts` and `src/app/dashboard/crm/[id]/page.tsx` for the current implementation details, and help them with the next steps!*
