import { NextResponse } from "next/server";
import { InterviewService } from "@/services/interviews.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");
    const userId = searchParams.get("userId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }

    // getAllInterviews expects (userId, organizationId)
    // Pass empty string for userId since we're filtering by org only
    const allInterviews = await InterviewService.getAllInterviews(
      userId || "",
      organizationId
    );

    // Filter for active, non-archived interviews
    const interviews = allInterviews.filter(
      (interview: any) => interview.is_active && !interview.is_archived
    );

    return NextResponse.json({ interviews }, { status: 200 });
  } catch (err) {
    console.error("Error fetching interviews:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
