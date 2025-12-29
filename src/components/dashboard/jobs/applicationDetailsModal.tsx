"use client";

import { useState } from "react";
import Modal from "@/components/dashboard/Modal";
import { Application } from "@/types/application";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ThumbsUp,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useOrganization } from "@clerk/nextjs";
import SelectInterviewModal from "./selectInterviewModal";

interface Props {
  application: Application | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ApplicationDetailsModal({
  application,
  open,
  onClose,
  onUpdate,
}: Props) {
  const { organization } = useOrganization();
  const [loading, setLoading] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const handleReject = async () => {
    if (!application) return;

    if (
      !confirm(
        `Are you sure you want to reject ${application.name}'s application?`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `/api/applications/${application.id}/reject`,
        {
          companyName: organization?.name || "Our Company",
        }
      );

      if (response.data.success) {
        toast.success(
          `Candidate rejected. ${response.data.emailSent ? "Email sent successfully." : "Email sending failed."}`
        );
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      toast.error("Failed to reject candidate");
    } finally {
      setLoading(false);
    }
  };

  if (!application) return null;

  const analysis = application.ats_analysis;
  const score = application.ats_score;

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-gray-600";
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendationBadge = (rec?: string) => {
    const badges = {
      strong_yes: { color: "bg-green-100 text-green-800", label: "Strong Yes" },
      shortlist: { color: "bg-blue-100 text-blue-800", label: "Shortlist" },
      maybe: { color: "bg-yellow-100 text-yellow-800", label: "Maybe" },
      reject: { color: "bg-red-100 text-red-800", label: "Reject" },
    };
    return (
      badges[rec as keyof typeof badges] || {
        color: "bg-gray-100 text-gray-800",
        label: "Unknown",
      }
    );
  };

  return (
    <Modal open={open} closeOnOutsideClick={!loading} onClose={onClose}>
      <div className="max-w-6xl w-[1200px] max-h-[90vh] overflow-y-auto py-4 px-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Candidate Info & ATS Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Information */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {application.name}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-700">
                  <Mail className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{application.email}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Phone className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{application.phone}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                  <span>
                    Applied: {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-gray-700">
                  <FileText className="h-5 w-5 mr-2 text-gray-400" />
                  <span className="capitalize">{application.status}</span>
                </div>
              </div>

              {application.cover_letter && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Cover Letter
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {application.cover_letter}
                  </p>
                </div>
              )}
            </div>

            {/* ATS Analysis */}
            {analysis && (
              <div className="bg-white rounded-lg p-6 border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    ATS Analysis
                  </h2>
                  {score !== null && (
                    <div className="text-center">
                      <div
                        className={`text-4xl font-bold ${getScoreColor(score)}`}
                      >
                        {score}%
                      </div>
                      <p className="text-sm text-gray-600">Overall Score</p>
                    </div>
                  )}
                </div>

                {/* Recommendation */}
                {analysis.recommendation && (
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRecommendationBadge(analysis.recommendation).color}`}
                    >
                      {getRecommendationBadge(analysis.recommendation).label}
                    </span>
                  </div>
                )}

                {/* Overall Feedback */}
                {analysis.overallFeedback && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Overall Feedback
                    </h3>
                    <p className="text-gray-700">{analysis.overallFeedback}</p>
                  </div>
                )}

                {/* Matching Scores */}
                {analysis.matchingScores && (
                  <div className="space-y-4">
                    {/* Skills */}
                    {analysis.matchingScores.skills && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">Skills</h3>
                          <span className="text-lg font-bold text-gray-900">
                            {analysis.matchingScores.skills.score}%
                          </span>
                        </div>
                        {analysis.matchingScores.skills.matchedSkills.length >
                          0 && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-1">
                              Matched:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.matchingScores.skills.matchedSkills.map(
                                (skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                        {analysis.matchingScores.skills.missingSkills.length >
                          0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              Missing:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.matchingScores.skills.missingSkills.map(
                                (skill, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Experience */}
                    {analysis.matchingScores.experience && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Experience
                          </h3>
                          <span className="text-lg font-bold text-gray-900">
                            {analysis.matchingScores.experience.score}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {analysis.matchingScores.experience.feedback}
                        </p>
                      </div>
                    )}

                    {/* Qualifications */}
                    {analysis.matchingScores.qualifications && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Qualifications
                          </h3>
                          <span className="text-lg font-bold text-gray-900">
                            {analysis.matchingScores.qualifications.score}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {analysis.matchingScores.qualifications.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Strengths & Concerns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {analysis.strengths && analysis.strengths.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <ThumbsUp className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">
                          Strengths
                        </h3>
                      </div>
                      <ul className="space-y-1">
                        {analysis.strengths.map((strength, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 flex items-start"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {analysis.concerns && analysis.concerns.length > 0 && (
                    <div>
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Concerns</h3>
                      </div>
                      <ul className="space-y-1">
                        {analysis.concerns.map((concern, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 flex items-start"
                          >
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Resume Preview & Actions */}
          <div className="space-y-6">
            {/* Resume Preview */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="font-semibold text-gray-900 mb-4">Resume</h3>
              {application.resume_url ? (
                <div className="space-y-4">
                  <a
                    href={application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button variant="outline" className="w-full">
                      <FileText className="mr-2 h-4 w-4" />
                      View Resume (PDF)
                    </Button>
                  </a>
                  {application.resume_text && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Resume Text Preview
                      </h4>
                      <div className="text-xs text-gray-600 max-h-64 overflow-y-auto bg-gray-50 p-3 rounded border">
                        <pre className="whitespace-pre-wrap font-sans">
                          {application.resume_text.slice(0, 1000)}
                          {application.resume_text.length > 1000 && "..."}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No resume uploaded</p>
              )}
            </div>

            {/* Actions */}
            {application.status !== "shortlisted" &&
              application.status !== "rejected" && (
                <div className="bg-white rounded-lg p-6 border space-y-3">
                  <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>

                  <Button
                    onClick={() => setShowInterviewModal(true)}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Shortlist & Send Interview
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={loading}
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Candidate
                  </Button>
                </div>
              )}

          </div>
        </div>
      </div>

      {/* Interview Selection Modal */}
      <SelectInterviewModal
        application={application}
        open={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onSuccess={() => {
          setShowInterviewModal(false);
          onUpdate();
          onClose();
        }}
      />
    </Modal>
  );
}
