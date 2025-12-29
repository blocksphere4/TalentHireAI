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
    const { interviewUrl, companyName } = body;

    if (!interviewUrl || !companyName) {
      return NextResponse.json(
        { error: "Interview URL and company name are required" },
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

    // Update application status to shortlisted
    const updated = await ApplicationService.updateApplication(
      { status: "shortlisted" },
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

    // Send shortlist email
    const emailSent = await EmailService.sendShortlistEmail({
      candidateName: application.name,
      candidateEmail: application.email,
      jobTitle: job.title,
      interviewUrl,
      companyName,
    });

    if (!emailSent) {
      console.warn("Failed to send shortlist email");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Candidate shortlisted successfully",
        emailSent,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error shortlisting candidate:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
