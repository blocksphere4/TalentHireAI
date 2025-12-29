import { NextResponse } from "next/server";
import { ApplicationService } from "@/services/applications.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

    const application = await ApplicationService.getApplicationById(
      applicationId
    );

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Mark as viewed when accessed
    await ApplicationService.markAsViewed(applicationId);

    return NextResponse.json({ application }, { status: 200 });
  } catch (err) {
    console.error("Error getting application:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await req.json();
    const payload = body.applicationData;

    const updatedApplication = await ApplicationService.updateApplication(
      payload,
      applicationId
    );

    if (!updatedApplication) {
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, application: updatedApplication },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error updating application:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;

    const success = await ApplicationService.deleteApplication(applicationId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete application" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error deleting application:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
