import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error });
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code provided" });
  }

  const clientId = process.env.ONEDRIVE_CLIENT_ID;
  const clientSecret = process.env.ONEDRIVE_CLIENT_SECRET;
  const tenantId = process.env.ONEDRIVE_TENANT_ID || "common";
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/onedrive/callback`;

  try {
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      return NextResponse.json(data);
    }

    return new NextResponse(`
      <html>
        <body style="font-family: sans-serif; padding: 40px; line-height: 1.6;">
          <h2 style="color: #2e7d32;">授權成功！</h2>
          <p>請將以下 <b>Refresh Token</b> 複製並貼到您的 <code>.env.local</code> 檔案中：</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; word-break: break-all; border: 1px solid #ddd;">
            <code>ONEDRIVE_REFRESH_TOKEN=${data.refresh_token}</code>
          </div>
          <p>存檔後，請重新啟動伺服器 (npm run dev)，系統就能自動把檔案上傳到 OneDrive 的應用程式資料夾了！</p>
        </body>
      </html>
    `, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });

  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch token", details: String(err) });
  }
}
