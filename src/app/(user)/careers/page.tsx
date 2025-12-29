"use client";

import React, { useState, useEffect } from "react";
import { Search, MapPin, Briefcase, Clock } from "lucide-react";
import { Job } from "@/types/job";
import axios from "axios";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/careers/jobs");
        setJobs(response.data.jobs || []);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skills.some((skill) =>
        skill.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesLocation =
      locationFilter === "all" || job.location_type === locationFilter;

    const matchesType =
      typeFilter === "all" || job.employment_type === typeFilter;

    return matchesSearch && matchesLocation && matchesType;
  });

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

  const formatEmploymentType = (type: string) => {
    return type
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const JobsLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 animate-pulse rounded-xl bg-gray-200" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Join Our Team
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-8">
              Discover opportunities to make an impact
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search jobs by title, skills, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white text-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Jobs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-gray-600" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? (
              "Loading opportunities..."
            ) : (
              <>
                <span className="font-semibold text-gray-900">
                  {filteredJobs.length}
                </span>{" "}
                {filteredJobs.length === 1 ? "position" : "positions"} available
              </>
            )}
          </p>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <JobsLoader />
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No positions found
            </h3>
            <p className="text-gray-600">
              {jobs.length === 0
                ? "We don't have any open positions at the moment. Check back soon!"
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/careers/${job.id}`}
                className="block group"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-200 hover:border-indigo-300 h-full flex flex-col">
                  {/* Job Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {job.description}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getLocationBadge(job.location_type)}`}
                    >
                      {job.location_type.charAt(0).toUpperCase() +
                        job.location_type.slice(1)}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getEmploymentBadge(job.employment_type)}`}
                    >
                      {formatEmploymentType(job.employment_type)}
                    </span>
                  </div>

                  {/* Skills */}
                  {job.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 && (
                          <span className="px-2 py-1 text-xs text-gray-500">
                            +{job.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {job.openings && job.openings > 1 && (
                      <span className="text-indigo-600 font-medium">
                        {job.openings} openings
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
