import { NextResponse } from "next/server";
import { JobService } from "@/services/jobs.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const payload = body.jobData;

    if (!payload.organization_id || !payload.user_id || !payload.title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newJob = await JobService.createJob(payload);

    if (!newJob) {
      return NextResponse.json(
        { error: "Failed to create job" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, job: newJob, jobId: newJob.id },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error creating job:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
