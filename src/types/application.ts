export interface ATSAnalysis {
  overallScore: number;
  overallFeedback: string;
  matchingScores: {
    skills: {
      score: number;
      matchedSkills: string[];
      missingSkills: string[];
      additionalSkills: string[];
    };
    experience: {
      score: number;
      yearsFound: string;
      feedback: string;
    };
    qualifications: {
      score: number;
      matched: string[];
      missing: string[];
      feedback: string;
    };
  };
  strengths: string[];
  concerns: string[];
  recommendation: 'reject' | 'maybe' | 'shortlist' | 'strong_yes';
}

export interface Application {
  id: string;
  created_at: Date;
  updated_at: Date;
  job_id: string;
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  resume_text: string | null;
  cover_letter: string | null;
  ats_analysis: ATSAnalysis | null;
  ats_score: number | null;
  status: 'new' | 'reviewing' | 'shortlisted' | 'invited' | 'rejected';
  is_viewed: boolean;
  interview_id: string | null;
  source: string;
}

export interface ApplicationInsert {
  job_id: string;
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  resume_text?: string;
  cover_letter?: string;
  ats_analysis?: ATSAnalysis;
  ats_score?: number;
  status?: 'new' | 'reviewing' | 'shortlisted' | 'invited' | 'rejected';
}

export interface ApplicationUpdate {
  name?: string;
  email?: string;
  phone?: string;
  resume_text?: string;
  cover_letter?: string;
  ats_analysis?: ATSAnalysis;
  ats_score?: number;
  status?: 'new' | 'reviewing' | 'shortlisted' | 'invited' | 'rejected';
  is_viewed?: boolean;
  interview_id?: string;
  updated_at?: Date;
}

export interface ApplicationFilters {
  status?: 'new' | 'reviewing' | 'shortlisted' | 'invited' | 'rejected' | 'all';
  minScore?: number;
  maxScore?: number;
  sortBy?: 'score' | 'date' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface ApplicationStats {
  total: number;
  new: number;
  reviewing: number;
  shortlisted: number;
  invited: number;
  rejected: number;
  averageScore: number;
}
