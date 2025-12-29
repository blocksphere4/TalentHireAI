import { NextResponse } from "next/server";
import { ApplicationService } from "@/services/applications.service";
import { EmailService } from "@/services/email.service";
import { JobService } from "@/services/jobs.service";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await req.json();
    const { companyName } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Get application details
    const application = await ApplicationService.getApplicationById(
      applicationId
    );

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Update application status to rejected
    const updated = await ApplicationService.updateApplication(
      { status: "rejected" },
      applicationId
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    // Get job details
    const job = await JobService.getJobById(application.job_id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Send rejection email
    const emailSent = await EmailService.sendRejectionEmail({
      candidateName: application.name,
      candidateEmail: application.email,
      jobTitle: job.title,
      companyName,
    });

    if (!emailSent) {
      console.warn("Failed to send rejection email");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Candidate rejected successfully",
        emailSent,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error rejecting candidate:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
