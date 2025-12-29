import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { ApplicationService } from "@/services/applications.service";
import { JobService } from "@/services/jobs.service";
import { InterviewService } from "@/services/interviews.service";
import axios from "axios";

const base_url = process.env.NEXT_PUBLIC_LIVE_URL;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await req.json();
    const { interviewerId, customQuestions, autoGenerate, interviewName } =
      body;

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

    // Get job details
    const job = await JobService.getJobById(application.job_id);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Generate questions if requested
    let questions = customQuestions;
    if (autoGenerate) {
      try {
        const questionData = {
          name: job.title,
          objective: job.description,
          number: 5,
          context: `Required skills: ${job.skills.join(", ")}\nExperience: ${job.experience}\nQualifications: ${job.qualifications.join(", ")}`,
          model: "gemini",
        };

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_LIVE_URL}/api/generate-interview-questions`,
          questionData
        );

        const generated = JSON.parse(response.data.response);
        questions = generated.questions;
      } catch (error) {
        console.error("Error generating questions:", error);
        // Fall back to custom questions if generation fails
      }
    }

    // Create interview
    const url_id = nanoid();
    const url = `${base_url}/call/${url_id}`;

    const interviewPayload = {
      user_id: job.user_id,
      organization_id: job.organization_id,
      name: interviewName || `${job.title} - ${application.name}`,
      interviewer_id: interviewerId,
      objective: job.description,
      questions: questions,
      question_count: questions.length,
      time_duration: "10",
      is_anonymous: false,
      description: `Interview for job application: ${applicationId}`,
      url: url,
      id: url_id,
      readable_slug: null,
    };

    const interview = await InterviewService.createInterview(interviewPayload);

    if (!interview || interview.length === 0) {
      return NextResponse.json(
        { error: "Failed to create interview" },
        { status: 500 }
      );
    }

    // Update application with interview link and status
    await ApplicationService.updateApplication(
      {
        interview_id: url_id,
        status: "invited",
      },
      applicationId
    );

    return NextResponse.json(
      {
        success: true,
        interviewId: url_id,
        interviewUrl: url,
        message: "Interview created successfully",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error inviting to interview:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
