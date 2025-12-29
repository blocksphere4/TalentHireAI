"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/dashboard/Modal";
import { Interview } from "@/types/interview";
import { Application } from "@/types/application";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Users, CheckCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useOrganization } from "@clerk/nextjs";

interface Props {
  application: Application | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SelectInterviewModal({
  application,
  open,
  onClose,
  onSuccess,
}: Props) {
  const { organization } = useOrganization();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(false);

  useEffect(() => {
    if (open && organization?.id) {
      fetchInterviews();
    }
  }, [open, organization]);

  const fetchInterviews = async () => {
    if (!organization?.id) return;

    setLoadingInterviews(true);
    try {
      const response = await axios.get("/api/interviews/list", {
        params: { organizationId: organization.id },
      });
      setInterviews(response.data.interviews || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to load interviews");
    } finally {
      setLoadingInterviews(false);
    }
  };

  const handleSubmit = async () => {
    if (!application || !selectedInterview) {
      toast.error("Please select an interview");
      return;
    }

    const interview = interviews.find((i) => i.id === selectedInterview);
    if (!interview) {
      toast.error("Interview not found");
      return;
    }

    setLoading(true);
    try {
      const interviewUrl = `${window.location.origin}/call/${interview.id}`;

      const response = await axios.post(
        `/api/applications/${application.id}/shortlist`,
        {
          interviewUrl,
          companyName: organization?.name || "Our Company",
        }
      );

      if (response.data.success) {
        toast.success(
          `${application.name} has been shortlisted!`,
          {
            description: response.data.emailSent
              ? "Interview invitation email sent successfully."
              : "Failed to send email. Please contact the candidate manually.",
            duration: 5000,
          }
        );
        onSuccess();
        handleClose();
      }
    } catch (error) {
      console.error("Error shortlisting candidate:", error);
      toast.error("Failed to shortlist candidate");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedInterview("");
    onClose();
  };

  if (!application) return null;

  const selectedInterviewData = interviews.find(
    (i) => i.id === selectedInterview
  );

  return (
    <Modal open={open} closeOnOutsideClick={!loading} onClose={handleClose}>
      <div className="max-w-2xl w-[600px] py-6 px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Send Interview Invitation
          </h2>
          <p className="text-gray-600">
            Select an interview to send to <strong>{application.name}</strong>
          </p>
        </div>

        {loadingInterviews ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading interviews...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Interviews Available
            </h3>
            <p className="text-gray-600 mb-6">
              Please create an interview first before shortlisting candidates.
            </p>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Interview Selection */}
            <div>
              <Label htmlFor="interview" className="text-sm font-medium mb-2">
                Choose an Interview
              </Label>
              <div className="space-y-3 mt-3 max-h-96 overflow-y-auto">
                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    onClick={() => setSelectedInterview(interview.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedInterview === interview.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {interview.name}
                        </h4>
                        {interview.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {interview.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created{" "}
                            {new Date(interview.created_at).toLocaleDateString()}
                          </span>
                          {interview.is_active && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedInterview === interview.id && (
                        <CheckCircle className="h-6 w-6 text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Interview Preview */}
            {selectedInterviewData && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-2">
                  Email Preview
                </h4>
                <div className="text-sm text-indigo-800 space-y-1">
                  <p>
                    <strong>To:</strong> {application.email}
                  </p>
                  <p>
                    <strong>Subject:</strong> 🎉 You've been shortlisted for{" "}
                    {application.name}
                  </p>
                  <p className="mt-3 text-indigo-700">
                    The email will include a personalized interview invitation
                    with a direct link to: <br />
                    <span className="font-mono text-xs bg-white px-2 py-1 rounded mt-1 inline-block">
                      {window.location.origin}/call/{selectedInterviewData.id}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!selectedInterview || loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Send Interview Invitation
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
