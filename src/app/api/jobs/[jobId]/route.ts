import { NextResponse } from "next/server";
import { JobService } from "@/services/jobs.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const job = await JobService.getJobById(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (err) {
    console.error("Error getting job:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const body = await req.json();
    const payload = body.jobData;

    const updatedJob = await JobService.updateJob(payload, jobId);

    if (!updatedJob) {
      return NextResponse.json(
        { error: "Failed to update job" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, job: updatedJob },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating job:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    const success = await JobService.deleteJob(jobId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete job" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error deleting job:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
