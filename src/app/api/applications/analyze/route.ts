import { NextResponse } from "next/server";
import { ApplicationService } from "@/services/applications.service";
import { JobService } from "@/services/jobs.service";
import { analyzeResume } from "@/services/ats.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "Application ID is required" },
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

    // If already analyzed, return existing analysis
    if (application.ats_analysis && application.ats_score) {
      return NextResponse.json(
        {
          analysis: application.ats_analysis,
          score: application.ats_score,
          cached: true,
        },
        { status: 200 }
      );
    }

    // Get job details
    const job = await JobService.getJobById(application.job_id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check if resume text exists
    if (!application.resume_text) {
      return NextResponse.json(
        { error: "Resume text not available for analysis" },
        { status: 400 }
      );
    }

    // Perform ATS analysis
    const analysis = await analyzeResume({
      resumeText: application.resume_text,
      jobDescription: job.description,
      requiredSkills: job.skills,
      experienceRequirement: job.experience,
      qualifications: job.qualifications,
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Failed to analyze resume" },
        { status: 500 }
      );
    }

    // Update application with analysis
    await ApplicationService.updateApplication(
      {
        ats_analysis: analysis,
        ats_score: analysis.overallScore,
      },
      applicationId
    );

    return NextResponse.json(
      {
        analysis,
        score: analysis.overallScore,
        cached: false,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error analyzing application:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
