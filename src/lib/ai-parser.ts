import { GoogleGenAI } from "@google/genai";

// 初始化 Gemini SDK
// 注意：這會在 Server 端執行，所以會自動讀取 process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

export interface ParsedItem {
  name: string;
  quantity: number;
  description: string;
  unit_price: number;
  total_price: number;
}

export interface ParsedQuotation {
  project_name: string;
  estimated_duration_days: number;
  items: ParsedItem[];
}

export async function parseQuotation(fileBuffer: Buffer, mimeType: string): Promise<ParsedQuotation | null> {
  try {
    const base64Data = fileBuffer.toString("base64");
    
    // 建立提示詞 (Prompt) 讓 AI 知道要做什麼，並強迫輸出 JSON 格式
    const prompt = `
      你是一個專業的專案經理助理。請分析這份報價單/合約內容，並將裡面的「報價品項」提取出來。
      請嚴格按照以下 JSON 格式輸出，不要包含任何 markdown 符號或其他文字：
      {
        "project_name": "你從文件中判斷的專案名稱，如果沒有則根據內容自訂一個簡短名稱",
        "estimated_duration_days": 判斷整個專案大約需要的天數 (數字，預設可填 30),
        "items": [
          {
            "name": "品項名稱",
            "quantity": 數量 (數字),
            "description": "該品項的簡短描述",
            "unit_price": 單價 (數字，若無則為 0),
            "total_price": 總價 (數字，若無則為 0)
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    if (!response.text) return null;
    
    // 解析 JSON
    const result = JSON.parse(response.text) as ParsedQuotation;
    return result;
  } catch (error) {
    console.error("AI 解析報價單失敗:", error);
    return null;
  }
}
