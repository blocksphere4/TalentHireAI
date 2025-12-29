import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Job, JobInsert, JobUpdate, JobFilters, JobStats } from "@/types/job";

const supabase = createClientComponentClient();

const createJob = async (payload: JobInsert): Promise<Job | null> => {
  try {
    const { error, data } = await supabase
      .from("job")
      .insert({ ...payload })
      .select()
      .single();

    if (error) {
      console.error("Error creating job:", error);
      return null;
    }

    return data as Job;
  } catch (error) {
    console.error("Unexpected error creating job:", error);
    return null;
  }
};

const getAllJobs = async (
  organizationId: string,
  filters?: JobFilters
): Promise<Job[]> => {
  try {
    let query = supabase
      .from("job")
      .select("*")
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters?.status === "active") {
      query = query.eq("is_active", true).eq("is_archived", false);
    } else if (filters?.status === "archived") {
      query = query.eq("is_archived", true);
    }

    if (filters?.employmentType) {
      query = query.eq("employment_type", filters.employmentType);
    }

    if (filters?.locationType) {
      query = query.eq("location_type", filters.locationType);
    }

    if (filters?.searchQuery) {
      query = query.or(
        `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error getting jobs:", error);
      return [];
    }

    return (data as Job[]) || [];
  } catch (error) {
    console.error("Unexpected error getting jobs:", error);
    return [];
  }
};

const getJobById = async (id: string): Promise<Job | null> => {
  try {
    const { data, error } = await supabase
      .from("job")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting job:", error);
      return null;
    }

    return data as Job;
  } catch (error) {
    console.error("Unexpected error getting job:", error);
    return null;
  }
};

const updateJob = async (
  payload: JobUpdate,
  id: string
): Promise<Job | null> => {
  try {
    const { error, data } = await supabase
      .from("job")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating job:", error);
      return null;
    }

    return data as Job;
  } catch (error) {
    console.error("Unexpected error updating job:", error);
    return null;
  }
};

const deleteJob = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("job")
      .update({ is_archived: true, is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Error deleting job:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting job:", error);
    return false;
  }
};

const archiveJob = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("job")
      .update({ is_archived: true, is_active: false })
      .eq("id", id);

    if (error) {
      console.error("Error archiving job:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error archiving job:", error);
    return false;
  }
};

const getActivePublicJobs = async (
  organizationId?: string
): Promise<Job[]> => {
  try {
    let query = supabase
      .from("job")
      .select("*")
      .eq("is_active", true)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error getting public jobs:", error);
      return [];
    }

    return (data as Job[]) || [];
  } catch (error) {
    console.error("Unexpected error getting public jobs:", error);
    return [];
  }
};

const getPublicJobById = async (id: string): Promise<Job | null> => {
  try {
    const { data, error } = await supabase
      .from("job")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .eq("is_archived", false)
      .single();

    if (error) {
      console.error("Error getting public job:", error);
      return null;
    }

    return data as Job;
  } catch (error) {
    console.error("Unexpected error getting public job:", error);
    return null;
  }
};

const getJobStats = async (jobId: string): Promise<JobStats> => {
  try {
    const { data: applications, error } = await supabase
      .from("job_application")
      .select("status, ats_score")
      .eq("job_id", jobId);

    if (error) {
      console.error("Error getting job stats:", error);
      return {
        totalApplications: 0,
        newApplications: 0,
        shortlistedApplications: 0,
        invitedApplications: 0,
        averageAtsScore: 0,
      };
    }

    const total = applications.length;
    const newApps = applications.filter((app) => app.status === "new").length;
    const shortlisted = applications.filter(
      (app) => app.status === "shortlisted"
    ).length;
    const invited = applications.filter(
      (app) => app.status === "invited"
    ).length;

    const scores = applications
      .filter((app) => app.ats_score !== null)
      .map((app) => app.ats_score);
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    return {
      totalApplications: total,
      newApplications: newApps,
      shortlistedApplications: shortlisted,
      invitedApplications: invited,
      averageAtsScore: Math.round(averageScore),
    };
  } catch (error) {
    console.error("Unexpected error getting job stats:", error);
    return {
      totalApplications: 0,
      newApplications: 0,
      shortlistedApplications: 0,
      invitedApplications: 0,
      averageAtsScore: 0,
    };
  }
};

const incrementApplicationCount = async (jobId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc("increment_application_count", {
      job_id: jobId,
    });

    // If RPC doesn't exist, fall back to manual increment
    if (error) {
      const job = await getJobById(jobId);
      if (job) {
        await updateJob(
          { application_count: (job.application_count || 0) + 1 },
          jobId
        );
      }
    }
  } catch (error) {
    console.error("Error incrementing application count:", error);
  }
};

export const JobService = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  archiveJob,
  getActivePublicJobs,
  getPublicJobById,
  getJobStats,
  incrementApplicationCount,
};
