import { config } from "dotenv";
import * as path from "path";
import * as fs from "fs";

// 載入 .env.local
config({ path: path.resolve(process.cwd(), ".env.local") });

// 模擬使用 fetch 來建立 Supabase 客戶端 (純後端測試)
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

import { uploadToOneDrive } from "../src/lib/onedrive";
import { parseQuotation } from "../src/lib/ai-parser";

async function runTest() {
  console.log("🚀 開始自動化測試：報價單上傳 -> AI解析 -> 資料庫寫入");

  try {
    // 1. 建立一個假的測試報價單檔案 (使用圖片以測試 Gemini)
    // 為了測試，我們從 src/app/favicon.ico 抓隨便一個檔案來當作測試用上傳
    const testFilePath = path.resolve(process.cwd(), "src/app/favicon.ico");
    const fileBuffer = fs.readFileSync(testFilePath);
    const mimeType = "image/x-icon";
    const fileName = `test_quotation_${Date.now()}.ico`;

    console.log(`\n[1/4] 測試 OneDrive 上傳... (檔案大小: ${fileBuffer.length} bytes)`);
    const quotationUrl = await uploadToOneDrive(fileBuffer, fileName);
    console.log("✅ OneDrive 上傳成功！網址：", quotationUrl);

    console.log("\n[2/4] 測試 Gemini AI 解析...");
    const parsedData = await parseQuotation(fileBuffer, mimeType);
    console.log("✅ AI 解析成功！結果：", JSON.stringify(parsedData, null, 2));

    console.log("\n[3/4] 檢查/建立測試客戶...");
    const clientName = "自動化測試專用客戶";
    let clientId = null;
    const { data: existingClient } = await supabase.from("clients").select("id").eq("name", clientName).single();
    
    if (existingClient) {
      clientId = existingClient.id;
      console.log("✅ 找到既有客戶 ID:", clientId);
    } else {
      const { data: newClient, error: clientErr } = await supabase.from("clients").insert({ name: clientName }).select("id").single();
      if (clientErr) throw new Error(`建立客戶失敗: ${clientErr.message}`);
      clientId = newClient.id;
      console.log("✅ 建立新客戶成功 ID:", clientId);
    }

    console.log("\n[4/4] 寫入 Proposal 資料庫...");
    const insertPayload = {
      title: "自動化測試提案",
      client_id: clientId,
      amount: 10000,
      project_type: "online_event",
      expected_start: "2026-06-01",
      expected_end: "2026-06-30",
      notes: "這是一筆由測試腳本自動建立的提案",
      quotation_url: quotationUrl,
      parsed_items: parsedData,
      sales_person_id: "7cc83bc5-ecb0-469b-b0b3-6e3eeb29579d", // 我們需要一個有效的 UUID，如果 RLS 會擋，這個步驟可能會因為沒有 Auth Token 而報錯，這正是我們要測試的！
      status: "lead"
    };

    const { data, error } = await supabase.from("proposals").insert(insertPayload).select();
    
    if (error) {
      console.error("❌ 寫入資料庫失敗！錯誤詳細資訊：");
      console.error(error);
      return;
    }

    console.log("✅ 資料庫寫入成功！回傳的資料格式為：");
    console.log(data);

    if (Array.isArray(data) && data.length > 0 && data[0].id) {
      console.log(`\n🎉 測試完全成功！新建的提案 ID: ${data[0].id}`);
    } else if (data && !Array.isArray(data) && (data as any).id) {
      console.log(`\n🎉 測試完全成功！新建的提案 ID: ${(data as any).id}`);
    } else {
      console.log(`\n⚠️ 寫入雖然沒報錯，但回傳的資料中找不到 ID 屬性！這就是造成 undefined 的元凶。`);
    }

  } catch (error: any) {
    console.error("\n❌ 測試過程中發生錯誤：", error.message || error);
  }
}

runTest();
