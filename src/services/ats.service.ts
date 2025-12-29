import { GoogleGenerativeAI } from "@google/generative-ai";
import { ATSAnalysis } from "@/types/application";
import {
  getATSAnalysisPrompt,
  ATS_SYSTEM_PROMPT,
} from "@/lib/prompts/ats-analysis";
import { ApplicationService } from "@/services/applications.service";

export const analyzeResume = async (payload: {
  resumeText: string;
  jobDescription: string;
  requiredSkills: string[];
  experienceRequirement: string;
  qualifications: string[];
}): Promise<ATSAnalysis | null> => {
  const {
    resumeText,
    jobDescription,
    requiredSkills,
    experienceRequirement,
    qualifications,
  } = payload;

  try {
    // Validate input
    if (!resumeText || !jobDescription) {
      console.error("Missing required fields for ATS analysis");
      return null;
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      },
    });

    const prompt = getATSAnalysisPrompt(
      resumeText,
      jobDescription,
      requiredSkills,
      experienceRequirement,
      qualifications
    );

    const fullPrompt = `${ATS_SYSTEM_PROMPT}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const content = response.text();

    if (!content) {
      console.error("No content returned from Gemini");
      return null;
    }

    const analysis: ATSAnalysis = JSON.parse(content);

    return analysis;
  } catch (error) {
    console.error("Error in ATS analysis:", error);
    return null;
  }
};

export const analyzeApplication = async (
  applicationId: string
): Promise<ATSAnalysis | null> => {
  try {
    const application = await ApplicationService.getApplicationById(
      applicationId
    );

    if (!application) {
      console.error("Application not found");
      return null;
    }

    // If already analyzed, return existing analysis
    if (application.ats_analysis) {
      return application.ats_analysis;
    }

    // Get job details (we'll need to fetch this)
    // For now, this is a placeholder - will be implemented in API route
    // as it needs the job details

    return null;
  } catch (error) {
    console.error("Error analyzing application:", error);
    return null;
  }
};

export const reanalyzeApplications = async (
  jobId: string
): Promise<boolean> => {
  try {
    // Get all applications for the job
    const applications = await ApplicationService.getAllApplications(jobId);

    // Re-analyze each application
    // This would be implemented when we have the full job context
    // For now, this is a placeholder

    console.log(
      `Would re-analyze ${applications.length} applications for job ${jobId}`
    );

    return true;
  } catch (error) {
    console.error("Error re-analyzing applications:", error);
    return false;
  }
};

export const ATSService = {
  analyzeResume,
  analyzeApplication,
  reanalyzeApplications,
};
