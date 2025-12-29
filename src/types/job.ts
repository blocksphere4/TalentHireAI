export interface Job {
  id: string;
  created_at: Date;
  updated_at: Date;
  organization_id: string;
  user_id: string;
  title: string;
  description: string;
  location_type: 'remote' | 'onsite' | 'hybrid';
  location_details: string | null;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  skills: string[];
  experience: string;
  qualifications: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  benefits: string[] | null;
  deadline: Date | null;
  start_date: Date | null;
  openings: number;
  is_active: boolean;
  is_archived: boolean;
  application_count: number;
}

export interface JobInsert {
  organization_id: string;
  user_id: string;
  title: string;
  description: string;
  location_type: 'remote' | 'onsite' | 'hybrid';
  location_details?: string;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  skills: string[];
  experience: string;
  qualifications: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  benefits?: string[];
  deadline?: Date;
  start_date?: Date;
  openings: number;
}

export interface JobUpdate {
  title?: string;
  description?: string;
  location_type?: 'remote' | 'onsite' | 'hybrid';
  location_details?: string;
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'internship';
  skills?: string[];
  experience?: string;
  qualifications?: string[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  benefits?: string[];
  deadline?: Date;
  start_date?: Date;
  openings?: number;
  is_active?: boolean;
  is_archived?: boolean;
  application_count?: number;
  updated_at?: Date;
}

export interface JobFilters {
  status?: 'active' | 'archived' | 'all';
  employmentType?: string;
  locationType?: string;
  searchQuery?: string;
}

export interface JobStats {
  totalApplications: number;
  newApplications: number;
  shortlistedApplications: number;
  invitedApplications: number;
  averageAtsScore: number;
}
