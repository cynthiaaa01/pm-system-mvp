import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    // 1. Check API Key
    const apiKey = req.headers.get("x-api-key");
    const expectedKey = process.env.INTERNAL_API_KEY;
    
    if (expectedKey && apiKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse body
    const body = await req.json();
    const { event, data } = body;

    const supabase = createAdminClient();

    // 3. Handle events
    switch (event) {
      case "drive.folder.created":
        if (data.projectId && data.folderUrl) {
          const { error } = await supabase
            .from("projects")
            .update({ drive_folder_url: data.folderUrl })
            .eq("id", data.projectId);
            
          if (error) throw error;
        }
        break;

      case "notification.sent":
        console.log(`Notification sent successfully to ${data.target}`);
        break;
        
      case "task.reminder":
        console.log(`Task reminder sent for task ${data.taskId}`);
        break;

      default:
        return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
