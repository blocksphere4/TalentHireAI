import { NextResponse } from "next/server";
import { ApplicationService } from "@/services/applications.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const { searchParams } = new URL(req.url);

    const filters = {
      status: searchParams.get("status") as
        | "new"
        | "reviewing"
        | "shortlisted"
        | "invited"
        | "rejected"
        | "all"
        | undefined,
      minScore: searchParams.get("minScore")
        ? parseInt(searchParams.get("minScore")!)
        : undefined,
      maxScore: searchParams.get("maxScore")
        ? parseInt(searchParams.get("maxScore")!)
        : undefined,
      sortBy: searchParams.get("sortBy") as
        | "score"
        | "date"
        | "name"
        | undefined,
      sortOrder: searchParams.get("sortOrder") as "asc" | "desc" | undefined,
    };

    const applications = await ApplicationService.getAllApplications(
      jobId,
      filters
    );

    const stats = await ApplicationService.getApplicationStats(jobId);

    return NextResponse.json({ applications, stats }, { status: 200 });
  } catch (err) {
    console.error("Error getting applications:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
