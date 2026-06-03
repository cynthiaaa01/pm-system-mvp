# PM System 專案進化史 (Project History & Changelog)

這是一份紀錄本專案從無到有，一步步長成現在這樣強大、具備 AI 自動化能力的開發里程碑回顧。

---

## 📅 階段一：底層基礎建置 (Foundation & UI)
**目標：建立穩固的後端資料庫與現代化的前端介面**
- **建立專案環境**：初始化 Next.js 15 (App Router)、設定 Turbopack 以提供極致的開發體驗。
- **UI 視覺系統設計**：導入全域純手寫的 **Glassmorphism (毛玻璃)** 風格，捨棄死板的傳統版面，以漸層背景與半透明卡片打造具備未來感的頂級質感。
- **資料庫與驗證 (Supabase)**：
  - 建立 `001_initial_schema.sql`，完成基礎架構。
  - 導入 Supabase Auth，確保系統登入與權限安全。
  - 設計 `profiles` (人員)、`clients` (客戶)、`proposals` (提案)、`projects` (專案)、`tasks` (任務) 之間的 UUID 關聯。
  - 完成嚴密的 RLS (Row Level Security) 防護，確保資料只對授權的人員開放。

## 📅 階段二：客戶與提案管理 (CRM Core)
**目標：讓業務可以流暢地建立與追蹤潛在案件**
- **客戶列表與建檔**：開發客戶管理介面，紀錄客戶基本資料。
- **提案管理 (CRM)**：實作 `/dashboard/crm` 頁面，包含狀態追蹤 (Lead -> Negotiating -> Won -> Lost)。
- **Server Actions 實作**：全面採用 Next.js 最新的 Server Actions 架構，不用寫任何 API Routes，直接在後端與 Supabase 進行極速溝通，避免客戶端外洩資料。

## 📅 階段三：雲端硬碟與 AI 解析整合 (OneDrive + Gemini AI)
**目標：將傳統繁瑣的紙本/PDF 報價單化為結構化數據**
- **Microsoft OneDrive 串接**：
  - 申請 Azure 應用程式權限，撰寫 Oauth2 Refresh Token 邏輯。
  - 實作業務建立提案時，可以夾帶報價單檔案，系統會自動上傳至 OneDrive 並取得永久共用連結 (`quotation_url`)。
- **Google Gemini AI 整合**：
  - 導入 `@google/genai` (模型：`gemini-2.0-flash`)。
  - 在檔案上傳途中，同步將 Buffer 交由 AI 解析，精準萃取出報價單內的「品項名稱」、「數量」、「單價」。
- **資料庫擴充**：
  - 新增 `002`, `003`, `004` 階段遷移檔。
  - 為 `proposals` 加入 `parsed_items` (JSONB) 欄位來存放 AI 解析結果。

## 📅 階段四：專案啟動與任務 SOP 自動化 (Project & Task SOP)
**目標：打通業務與營運的最後一哩路，實現「一鍵開案」**
- **提案轉專案 (Mark as Won)**：
  - 開發將提案一鍵轉換為正式專案的功能，自動將原業務設定為初始負責人，避免資料庫關聯衝突。
- **SOP 任務範本資料庫 (`005_task_sop_integration.sql`)**：
  - 建立 `quotation_item_templates`，匯入數百條龐大的 PaGamO 競賽之盾、魔王任務等 SOP 標準流程。
- **大腦核心：自動排程演算法 (`src/lib/task-generation.ts`)**：
  - 寫入「模糊比對」演算法，讓 AI 抓出的品項名稱就算稍有誤差，也能精準配對到 SOP。
  - 開發基準日 (專案啟動日、活動上線日) 的自動推算公式 (Offset & Duration)。
- **OP 專屬預覽與行內編輯 UI**：
  - 在專案詳情頁開發「✨ 匯入報價單任務」功能。
  - 透過彈出式預覽 Modal，讓 OP 可以預覽 AI 配對結果、進行打勾篩選，甚至直接在畫面上修改「任務名稱」、「開始/截止日」，實現半自動的高效控管。

---

> **總結**：從單純的介面與資料表，我們成功把這個專案進化成了**「結合微軟雲端空間」**以及**「Google 先進語言模型」**的自動化利器。不僅介面美觀，還徹底打破了業務跟營運之間手動填單的壁壘！
