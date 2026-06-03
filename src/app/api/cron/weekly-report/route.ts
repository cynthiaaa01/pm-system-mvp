import { NextResponse } from "next/server";
import { generateWeeklyReport } from "@/actions/reports";

// Vercel Cron will call this endpoint based on vercel.json schedule
export async function GET(request: Request) {
  // Check authorization to prevent public triggering (Vercel sets a header)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const result = await generateWeeklyReport();

    if (result.error) {
      return NextResponse.json(
        { message: "Weekly report generation failed", error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Weekly report generated successfully", url: result.url },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
