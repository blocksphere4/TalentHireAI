import { NextResponse } from "next/server";
import { JobService } from "@/services/jobs.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    // Get all active public jobs
    const jobs = await JobService.getActivePublicJobs(
      organizationId || undefined
    );

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (err) {
    console.error("Error getting public jobs:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
