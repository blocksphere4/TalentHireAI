import { NextResponse } from "next/server";
import { JobService } from "@/services/jobs.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const stats = await JobService.getJobStats(jobId);

    return NextResponse.json({ stats }, { status: 200 });
  } catch (err) {
    console.error("Error getting job stats:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
