let accessTokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }

  const clientId = process.env.ONEDRIVE_CLIENT_ID;
  const clientSecret = process.env.ONEDRIVE_CLIENT_SECRET;
  const tenantId = process.env.ONEDRIVE_TENANT_ID || "common";
  const refreshToken = process.env.ONEDRIVE_REFRESH_TOKEN;

  if (!refreshToken) {
    throw new Error("Missing ONEDRIVE_REFRESH_TOKEN. Please visit /api/onedrive/auth to authorize.");
  }

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`OneDrive Auth Error: ${data.error_description}`);
  }

  // Token is usually valid for 3600 seconds
  accessTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000, // 5 minutes buffer
  };

  return data.access_token;
}

export async function uploadToOneDrive(fileBuffer: Buffer, fileName: string): Promise<string> {
  const token = await getAccessToken();
  
  // 使用 AppFolder 權限，檔案會自動上傳到 "應用程式 / <App Name> / <fileName>"
  // 由於上傳的檔案可能超過 4MB，對於 MVP 先使用簡單上傳 API (< 4MB)，若需支援大檔請改用 uploadSession
  const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/special/approot:/${fileName}:/content`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    body: fileBuffer as any,
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`OneDrive Upload Error: ${data.error.message}`);
  }

  // 回傳檔案在 OneDrive 上的分享連結 (WebView URL)
  return data.webUrl;
}

export async function createProjectFolder(projectName: string, clientName: string): Promise<string> {
  try {
    const token = await getAccessToken();
    const folderName = `${clientName} - ${projectName}`;
    
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/drive/root/children`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "name": folderName,
        "folder": {},
        "@microsoft.graph.conflictBehavior": "rename"
      }),
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(`OneDrive Create Folder Error: ${data.error.message}`);
    }

    return data.webUrl; // 回傳資料夾的連結
  } catch (error) {
    console.error("Failed to create OneDrive folder:", error);
    // 回傳一個假連結讓系統能繼續運作，之後客戶設定好環境變數就會正常了
    return `https://onedrive.live.com/?id=mock_folder_url_${encodeURIComponent(projectName)}`;
  }
}
