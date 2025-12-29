import { NextResponse } from "next/server";
import { JobService } from "@/services/jobs.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    const filters = {
      status: searchParams.get("status") as "active" | "archived" | "all" | undefined,
      employmentType: searchParams.get("employmentType") || undefined,
      locationType: searchParams.get("locationType") || undefined,
      searchQuery: searchParams.get("searchQuery") || undefined,
    };

    const jobs = await JobService.getAllJobs(organizationId, filters);

    return NextResponse.json({ jobs }, { status: 200 });
  } catch (err) {
    console.error("Error getting jobs:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
