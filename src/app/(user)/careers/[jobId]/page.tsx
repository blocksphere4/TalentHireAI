"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowLeft,
  Upload,
  FileText,
} from "lucide-react";
import { Job } from "@/types/job";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function JobApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/careers/jobs/${jobId}`);
        setJob(response.data.job);
      } catch (error) {
        console.error("Error fetching job:", error);
        toast.error("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setResume(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim() || !email.trim() || !phone.trim() || !resume) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("resume", resume);
      if (coverLetter.trim()) {
        formData.append("coverLetter", coverLetter.trim());
      }

      const response = await axios.post("/api/careers/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSubmitted(true);
        toast.success("Application submitted successfully!");
      } else {
        toast.error(response.data.error || "Failed to submit application");
      }
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("An error occurred while submitting your application");
    } finally {
      setSubmitting(false);
    }
  };

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

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return null;
    const symbol = currency === "USD" ? "$" : currency;
    if (min && max) {
      return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    } else if (min) {
      return `From ${symbol}${min.toLocaleString()}`;
    } else {
      return `Up to ${symbol}${max?.toLocaleString()}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            This position may have been closed or removed.
          </p>
          <Link href="/careers">
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Careers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Application Submitted!
            </h2>
            <p className="text-gray-600">
              Thank you for applying to{" "}
              <span className="font-semibold">{job.title}</span>. We've received
              your application and will review it shortly.
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/careers" className="block">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                Browse More Positions
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const salaryRange = formatSalary(
    job.salary_min ?? undefined,
    job.salary_max ?? undefined,
    job.salary_currency ?? undefined
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/careers"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all positions
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {job.title}
          </h1>
          <div className="flex flex-wrap gap-3">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getLocationBadge(job.location_type)}`}
            >
              <MapPin className="inline h-4 w-4 mr-1" />
              {job.location_type.charAt(0).toUpperCase() +
                job.location_type.slice(1)}
            </span>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${getEmploymentBadge(job.employment_type)}`}
            >
              <Briefcase className="inline h-4 w-4 mr-1" />
              {formatEmploymentType(job.employment_type)}
            </span>
            {salaryRange && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-emerald-100 text-emerald-800">
                <DollarSign className="inline h-4 w-4 mr-1" />
                {salaryRange}
              </span>
            )}
            <span className="px-3 py-1 text-sm text-gray-600">
              <Clock className="inline h-4 w-4 mr-1" />
              Posted {new Date(job.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Job Description
              </h2>
              <p className="text-gray-700 whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Skills */}
            {job.skills.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {job.experience && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Experience Required
                </h2>
                <p className="text-gray-700">{job.experience}</p>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Qualifications
                </h2>
                <ul className="space-y-2">
                  {job.qualifications.map((qual, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Benefits
                </h2>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column - Application Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Apply for this position
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-sm font-medium mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-sm font-medium mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                {/* Resume Upload */}
                <div>
                  <Label htmlFor="resume" className="text-sm font-medium mb-1">
                    Resume (PDF) <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-1">
                    <label
                      htmlFor="resume"
                      className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                        resume
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:border-indigo-500 bg-gray-50"
                      }`}
                    >
                      <div className="text-center">
                        {resume ? (
                          <>
                            <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-green-700 font-medium">
                              {resume.name}
                            </p>
                            <p className="text-xs text-green-600">
                              {(resume.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              Click to upload resume
                            </p>
                            <p className="text-xs text-gray-500">
                              PDF, max 10MB
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        id="resume"
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <Label
                    htmlFor="coverLetter"
                    className="text-sm font-medium mb-1"
                  >
                    Cover Letter (Optional)
                  </Label>
                  <textarea
                    id="coverLetter"
                    placeholder="Tell us why you're a great fit for this role..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting, you agree to our terms and privacy policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
