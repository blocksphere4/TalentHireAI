import { NextResponse } from "next/server";
import { JobService } from "@/services/jobs.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await JobService.getPublicJobById(jobId);

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or no longer active" },
        { status: 404 }
      );
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (err) {
    console.error("Error getting public job:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
