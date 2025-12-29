import { NextResponse } from "next/server";
import { ApplicationService } from "@/services/applications.service";
import { JobService } from "@/services/jobs.service";
import { uploadResume } from "@/actions/upload-resume";
import { analyzeResume } from "@/services/ats.service";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Extract form fields
    const jobId = formData.get("jobId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const coverLetter = formData.get("coverLetter") as string | null;
    const file = formData.get("resume") as File;

    // Validate required fields
    if (!jobId || !name || !email || !phone || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify job exists and is active
    const job = await JobService.getPublicJobById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: "Job not found or no longer active" },
        { status: 404 }
      );
    }

    // Create temporary application ID for file upload
    const tempId = `temp-${Date.now()}`;

    // Upload resume
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("applicationId", tempId);

    const uploadResult = await uploadResume(uploadFormData);

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || "Failed to upload resume" },
        { status: 500 }
      );
    }

    // Create application
    const application = await ApplicationService.createApplication({
      job_id: jobId,
      name,
      email,
      phone,
      resume_url: uploadResult.url!,
      resume_text: uploadResult.text || undefined,
      cover_letter: coverLetter || undefined,
    });

    if (!application) {
      return NextResponse.json(
        { error: "Failed to create application" },
        { status: 500 }
      );
    }

    // Trigger ATS analysis in the background if resume text was extracted
    if (uploadResult.text && uploadResult.text.trim().length > 0) {
      try {
        const analysis = await analyzeResume({
          resumeText: uploadResult.text,
          jobDescription: job.description,
          requiredSkills: job.skills,
          experienceRequirement: job.experience,
          qualifications: job.qualifications,
        });

        if (analysis) {
          await ApplicationService.updateApplication(
            {
              ats_analysis: analysis,
              ats_score: analysis.overallScore,
            },
            application.id
          );
        }
      } catch (error) {
        console.error("Error in background ATS analysis:", error);
        // Don't fail the application submission if analysis fails
      }
    }

    // Increment application count for the job
    await JobService.incrementApplicationCount(jobId);

    return NextResponse.json(
      {
        success: true,
        applicationId: application.id,
        message: "Application submitted successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error submitting application:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
