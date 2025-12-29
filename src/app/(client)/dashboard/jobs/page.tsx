"use client";

import React, { useState, useEffect } from "react";
import { useOrganization, useUser } from "@clerk/nextjs";
import { Plus, BriefcaseIcon } from "lucide-react";
import { Job } from "@/types/job";
import axios from "axios";
import { Button } from "@/components/ui/button";
import CreateJobModal from "@/components/dashboard/jobs/createJobModal";

function JobsPage() {
  const { organization } = useOrganization();
  const { user } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "archived" | "all">("active");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchJobs = async () => {
    if (!organization?.id) {
      console.log("No organization ID, skipping fetch");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching jobs with:", {
        organizationId: organization.id,
        filter,
      });
      const response = await axios.get("/api/jobs/list", {
        params: {
          organizationId: organization.id,
          status: filter,
        },
      });
      console.log("Jobs response:", response.data);
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization, filter]);

  const JobsLoader = () => (
    <div className="flex flex-row gap-4">
      <div className="h-60 w-80 animate-pulse rounded-xl bg-gray-300" />
      <div className="h-60 w-80 animate-pulse rounded-xl bg-gray-300" />
      <div className="h-60 w-80 animate-pulse rounded-xl bg-gray-300" />
    </div>
  );

  const getLocationBadge = (type: string) => {
    const colors = {
      remote: "bg-green-100 text-green-800",
      onsite: "bg-blue-100 text-blue-800",
      hybrid: "bg-purple-100 text-purple-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getEmploymentBadge = (type: string) => {
    const colors = {
      "full-time": "bg-indigo-100 text-indigo-800",
      "part-time": "bg-yellow-100 text-yellow-800",
      contract: "bg-orange-100 text-orange-800",
      internship: "bg-pink-100 text-pink-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and applications
          </p>
        </div>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === "active"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setFilter("active")}
        >
          Active ({jobs.filter((j) => j.is_active && !j.is_archived).length})
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === "archived"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setFilter("archived")}
        >
          Archived ({jobs.filter((j) => j.is_archived).length})
        </button>
        <button
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            filter === "all"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => setFilter("all")}
        >
          All ({jobs.length})
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <JobsLoader />
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No jobs found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new job posting.
          </p>
          <div className="mt-6">
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => {
                // TODO: Navigate to job details
                window.location.href = `/dashboard/jobs/${job.id}`;
              }}
            >
              {/* Job Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {job.title}
                </h3>
                {!job.is_active && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                    Inactive
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {job.description}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getLocationBadge(job.location_type)}`}
                >
                  {job.location_type.charAt(0).toUpperCase() +
                    job.location_type.slice(1)}
                </span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getEmploymentBadge(job.employment_type)}`}
                >
                  {job.employment_type
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </span>
              </div>

              {/* Stats */}
              <div className="flex justify-between items-center pt-4 border-t text-sm">
                <span className="text-gray-600">
                  {job.application_count || 0} Applications
                </span>
                <span className="text-gray-500">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {organization?.id && user?.id && (
        <CreateJobModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          organizationId={organization.id}
          userId={user.id}
          onJobCreated={fetchJobs}
        />
      )}
    </div>
  );
}

export default JobsPage;
