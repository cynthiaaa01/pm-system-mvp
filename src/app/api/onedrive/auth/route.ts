import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.ONEDRIVE_CLIENT_ID;
  const tenantId = process.env.ONEDRIVE_TENANT_ID || "common";
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/onedrive/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "Missing ONEDRIVE_CLIENT_ID in .env.local" });
  }

  const scope = "offline_access Files.ReadWrite.AppFolder";
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(authUrl);
}
