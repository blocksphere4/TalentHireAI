"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrganization } from "@clerk/nextjs";
import {
  ArrowLeft,
  Users,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { Job } from "@/types/job";
import { Application } from "@/types/application";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import ApplicationDetailsModal from "@/components/dashboard/jobs/applicationDetailsModal";

export default function JobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const { organization } = useOrganization();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    if (!jobId || !organization?.id) return;

    setLoading(true);
    try {
      // Fetch job details
      const jobResponse = await axios.get(`/api/jobs/${jobId}`, {
        params: { organizationId: organization.id },
      });
      setJob(jobResponse.data.job);

      // Fetch applications
      const appsResponse = await axios.get(`/api/jobs/${jobId}/applications`);
      setApplications(appsResponse.data.applications || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobId, organization]);

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    if (sortBy === "score") {
      return (b.ats_score || 0) - (a.ats_score || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const stats = {
    total: applications.length,
    new: applications.filter((a) => a.status === "new").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    invited: applications.filter((a) => a.status === "invited").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      reviewing: "bg-yellow-100 text-yellow-800",
      shortlisted: "bg-green-100 text-green-800",
      invited: "bg-purple-100 text-purple-800",
      rejected: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getScoreBadge = (score: number | null) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            This job may have been deleted or you don't have access to it.
          </p>
          <Link href="/dashboard/jobs">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/jobs"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600 mt-1">
              Manage applications for this position
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New</p>
              <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reviewing</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.reviewing}
              </p>
            </div>
            <Search className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Shortlisted</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.shortlisted}
              </p>
            </div>
            <Star className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Invited</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.invited}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="invited">Invited</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "score")}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by ATS Score</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      {sortedApplications.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600">
            {applications.length === 0
              ? "Applications will appear here once candidates apply."
              : "No applications match your filters."}
          </p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ATS Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedApplications.map((application) => (
                <tr
                  key={application.id}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {application.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {application.email}
                    </div>
                    <div className="text-xs text-gray-500">
                      {application.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {application.ats_score !== null ? (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreBadge(application.ats_score)}`}
                      >
                        {application.ats_score}%
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Analyzing...</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(application.status)}`}
                    >
                      {application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(application.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowModal(true);
                      }}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Application Details Modal */}
      <ApplicationDetailsModal
        application={selectedApplication}
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedApplication(null);
        }}
        onUpdate={fetchData}
      />
    </div>
  );
}
