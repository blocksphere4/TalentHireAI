import { NextResponse } from "next/server";
import { ApplicationService } from "@/services/applications.service";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await req.json();
    const { status } = body;

    if (
      !status ||
      !["new", "reviewing", "shortlisted", "invited", "rejected"].includes(
        status
      )
    ) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const success = await ApplicationService.updateApplicationStatus(
      applicationId,
      status
    );

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update application status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error updating application status:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
