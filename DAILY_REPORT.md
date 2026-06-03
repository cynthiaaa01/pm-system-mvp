# PM System 開發工作日報 (Daily Work Report)

## 📅 2026 年 5 月 28 日 (工作時數：約 8 小時)
**工作重點：專案底層架構建置與核心模組開發**
- **專案初始化與 UI 設計**：建立 Next.js (App Router) 專案環境，完成全站 Glassmorphism (毛玻璃) 視覺設計風格定義。
- **資料庫架構 (Schema)**：設計並部署 `001_initial_schema.sql`，建立系統核心五大資料表：`profiles`, `clients`, `proposals`, `projects`, `tasks`，並完成 Supabase Row Level Security (RLS) 安全防護設定。
- **會員與客戶模組**：實作登入驗證機制 (`auth.ts`) 與客戶管理功能 (`clients.ts`)，讓使用者可以建檔並管理客戶名單。
- **任務模組基礎**：完成基礎的任務讀寫邏輯 (`tasks.ts`)，為專案的後續進階功能鋪路。

## 📅 2026 年 5 月 29 日 (工作時數：約 7 小時)
**工作重點：報價單管理、雲端儲存與 AI 智慧解析**
- **提案追蹤系統 (CRM)**：完成 `/dashboard/crm` 提案儀表板，支援狀態轉換 (Lead/Negotiating/Won 等)。
- **微軟 OneDrive 整合**：串接 Microsoft Graph API，實作業務上傳報價單時自動存放至雲端硬碟，並於資料庫擴充 `quotation_url` 欄位以儲存永久連結 (`004_add_quotation_url.sql`)。
- **Gemini AI 自動解析**：導入 Google `@google/genai` 模組 (`gemini-2.0-flash` 模型)。在檔案上傳期間，同步讀取檔案內容並透過 AI 抽出「品項、數量、單價」，存入新建立的 `parsed_items` JSONB 欄位 (`002_add_parsed_items.sql`)。
- **欄位擴充與除錯**：為提案表單新增「預計開始 / 預計結束」日期欄位 (`003_add_expected_dates.sql`)，並修復了從提案轉為專案時的快取與 UUID 錯誤。

## 📅 2026 年 6 月 1 日 (今日) (工作時數：約 6 小時)
**工作重點：SOP 任務自動化、專案開案防呆與 OP 預覽介面**
- **資料庫 NOT NULL 限制修復**：修改提案成交 (`markAsWon`) 的邏輯，當轉為正式專案時，將無負責人的情況預設指派給原業務，完美避開 `operations_id` 不得為空的錯誤 (`proposals.ts`)。
- **SOP 任務範本導入**：使用者建置了 `005_task_sop_integration.sql`，系統成功擴充 `quotation_item_templates` 資料表，匯入包含「競賽之盾」、「魔王任務」等數百條 SOP，並為專案增加了基準日等欄位。
- **大腦核心與模糊配對演算法**：完成 `src/lib/task-generation.ts`，根據專案基準日期自動推算各項任務的開始日與截止日，並支援精準度極高的模糊字眼比對。
- **OP 任務預覽與行內編輯 UI**：開發 `src/actions/task-import.ts`，並於專案詳細頁面實作「✨ 匯入報價單任務」按鈕。OP 人員可以透過彈出的預覽視窗，勾選欲匯入的任務，並直接在畫面上即時修改名稱與日期，最後批次自動寫入專案中。
