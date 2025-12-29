export const ATS_SYSTEM_PROMPT =
  "You are an expert ATS (Applicant Tracking System) analyst. Your role is to analyze resumes against job requirements and provide accurate, unbiased scoring and feedback.";

export const getATSAnalysisPrompt = (
  resumeText: string,
  jobDescription: string,
  requiredSkills: string[],
  experienceRequirement: string,
  qualifications: string[]
) => `Analyze this resume against the job requirements and provide a comprehensive ATS score.

###
Job Description:
${jobDescription}

Required Skills: ${requiredSkills.join(", ")}

Experience Requirement: ${experienceRequirement}

Required Qualifications: ${qualifications.join(", ")}

###
Resume:
${resumeText}

###
Analyze this resume and provide detailed scoring in the following areas:

1. **Overall Score (0-100)**: Provide an overall match score based on:
   - Skills match (40% weight)
   - Experience match (30% weight)
   - Qualifications match (20% weight)
   - Overall presentation and relevance (10% weight)

2. **Overall Feedback (100 words max)**: A concise summary of why the candidate is a good or poor match for the position.

3. **Skills Analysis**:
   - Score (0-100): How well the candidate's skills match the requirements
   - Matched Skills: List of required skills found in the resume
   - Missing Skills: List of required skills NOT found in the resume
   - Additional Skills: Relevant skills the candidate has that weren't explicitly required

4. **Experience Analysis**:
   - Score (0-100): How well the candidate's experience matches the requirement
   - Years Found: Approximate years of relevant experience identified
   - Feedback (50 words): Brief assessment of their experience level and relevance

5. **Qualifications Analysis**:
   - Score (0-100): How well the candidate's qualifications match requirements
   - Matched: List of required qualifications found in the resume
   - Missing: List of required qualifications NOT found in the resume
   - Feedback (50 words): Brief assessment of their educational background

6. **Strengths**: List 3-5 key strengths or standout aspects of the candidate

7. **Concerns**: List 3-5 potential concerns or areas where the candidate may not be a perfect fit

8. **Recommendation**: Provide one of the following recommendations:
   - "reject": Candidate does not meet minimum requirements (score < 40)
   - "maybe": Candidate meets some requirements but has gaps (score 40-59)
   - "shortlist": Candidate is a good match (score 60-79)
   - "strong_yes": Candidate is an excellent match (score 80-100)

###
Provide your analysis in valid JSON format with the following structure:
{
  "overallScore": number (0-100),
  "overallFeedback": string (100 words max),
  "matchingScores": {
    "skills": {
      "score": number (0-100),
      "matchedSkills": string[],
      "missingSkills": string[],
      "additionalSkills": string[]
    },
    "experience": {
      "score": number (0-100),
      "yearsFound": string,
      "feedback": string (50 words max)
    },
    "qualifications": {
      "score": number (0-100),
      "matched": string[],
      "missing": string[],
      "feedback": string (50 words max)
    }
  },
  "strengths": string[] (3-5 items),
  "concerns": string[] (3-5 items),
  "recommendation": "reject" | "maybe" | "shortlist" | "strong_yes"
}

###
Important Guidelines:
- Be objective and fair in your assessment
- Base scores on actual evidence from the resume
- Consider both hard skills and soft skills where relevant
- Look for relevant keywords and phrases
- Account for similar or equivalent skills/qualifications
- Don't penalize for having MORE experience than required
- Consider the overall context and career progression
- Be specific in feedback rather than generic`;
