import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Application,
  ApplicationInsert,
  ApplicationUpdate,
  ApplicationFilters,
  ApplicationStats,
} from "@/types/application";

const supabase = createClientComponentClient();

const createApplication = async (
  payload: ApplicationInsert
): Promise<Application | null> => {
  try {
    const { error, data } = await supabase
      .from("job_application")
      .insert({ ...payload })
      .select()
      .single();

    if (error) {
      console.error("Error creating application:", error);
      return null;
    }

    return data as Application;
  } catch (error) {
    console.error("Unexpected error creating application:", error);
    return null;
  }
};

const getAllApplications = async (
  jobId: string,
  filters?: ApplicationFilters
): Promise<Application[]> => {
  try {
    let query = supabase
      .from("job_application")
      .select("*")
      .eq("job_id", jobId);

    // Apply filters
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    if (filters?.minScore !== undefined) {
      query = query.gte("ats_score", filters.minScore);
    }

    if (filters?.maxScore !== undefined) {
      query = query.lte("ats_score", filters.maxScore);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "date";
    const sortOrder = filters?.sortOrder || "desc";
    const ascending = sortOrder === "asc";

    if (sortBy === "score") {
      query = query.order("ats_score", { ascending, nullsFirst: false });
    } else if (sortBy === "name") {
      query = query.order("name", { ascending });
    } else {
      query = query.order("created_at", { ascending });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error getting applications:", error);
      return [];
    }

    return (data as Application[]) || [];
  } catch (error) {
    console.error("Unexpected error getting applications:", error);
    return [];
  }
};

const getApplicationById = async (id: string): Promise<Application | null> => {
  try {
    const { data, error } = await supabase
      .from("job_application")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error getting application:", error);
      return null;
    }

    return data as Application;
  } catch (error) {
    console.error("Unexpected error getting application:", error);
    return null;
  }
};

const updateApplication = async (
  payload: ApplicationUpdate,
  id: string
): Promise<Application | null> => {
  try {
    const { error, data } = await supabase
      .from("job_application")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating application:", error);
      return null;
    }

    return data as Application;
  } catch (error) {
    console.error("Unexpected error updating application:", error);
    return null;
  }
};

const deleteApplication = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("job_application")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting application:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error deleting application:", error);
    return false;
  }
};

const updateApplicationStatus = async (
  id: string,
  status: "new" | "reviewing" | "shortlisted" | "invited" | "rejected"
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("job_application")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Error updating application status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error updating application status:", error);
    return false;
  }
};

const markAsViewed = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("job_application")
      .update({ is_viewed: true })
      .eq("id", id);

    if (error) {
      console.error("Error marking application as viewed:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error marking application as viewed:", error);
    return false;
  }
};

const searchApplications = async (
  jobId: string,
  query: string
): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from("job_application")
      .select("*")
      .eq("job_id", jobId)
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error searching applications:", error);
      return [];
    }

    return (data as Application[]) || [];
  } catch (error) {
    console.error("Unexpected error searching applications:", error);
    return [];
  }
};

const getApplicationsByStatus = async (
  jobId: string,
  status: string
): Promise<Application[]> => {
  try {
    const { data, error } = await supabase
      .from("job_application")
      .select("*")
      .eq("job_id", jobId)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting applications by status:", error);
      return [];
    }

    return (data as Application[]) || [];
  } catch (error) {
    console.error("Unexpected error getting applications by status:", error);
    return [];
  }
};

const getApplicationStats = async (
  jobId: string
): Promise<ApplicationStats> => {
  try {
    const { data: applications, error } = await supabase
      .from("job_application")
      .select("status, ats_score")
      .eq("job_id", jobId);

    if (error) {
      console.error("Error getting application stats:", error);
      return {
        total: 0,
        new: 0,
        reviewing: 0,
        shortlisted: 0,
        invited: 0,
        rejected: 0,
        averageScore: 0,
      };
    }

    const total = applications.length;
    const newCount = applications.filter((app) => app.status === "new").length;
    const reviewing = applications.filter(
      (app) => app.status === "reviewing"
    ).length;
    const shortlisted = applications.filter(
      (app) => app.status === "shortlisted"
    ).length;
    const invited = applications.filter(
      (app) => app.status === "invited"
    ).length;
    const rejected = applications.filter(
      (app) => app.status === "rejected"
    ).length;

    const scores = applications
      .filter((app) => app.ats_score !== null)
      .map((app) => app.ats_score);
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    return {
      total,
      new: newCount,
      reviewing,
      shortlisted,
      invited,
      rejected,
      averageScore: Math.round(averageScore),
    };
  } catch (error) {
    console.error("Unexpected error getting application stats:", error);
    return {
      total: 0,
      new: 0,
      reviewing: 0,
      shortlisted: 0,
      invited: 0,
      rejected: 0,
      averageScore: 0,
    };
  }
};

export const ApplicationService = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
  updateApplicationStatus,
  markAsViewed,
  searchApplications,
  getApplicationsByStatus,
  getApplicationStats,
};
