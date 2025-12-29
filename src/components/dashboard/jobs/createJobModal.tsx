"use client";

import React, { useState } from "react";
import Modal from "@/components/dashboard/Modal";
import BasicInfoStep from "./steps/basicInfoStep";
import RequirementsStep from "./steps/requirementsStep";
import CompensationStep from "./steps/compensationStep";
import { JobInsert } from "@/types/job";

interface Props {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  userId: string;
  onJobCreated: () => void;
}

export default function CreateJobModal({
  open,
  onClose,
  organizationId,
  userId,
  onJobCreated,
}: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [jobData, setJobData] = useState<JobInsert>({
    organization_id: organizationId,
    user_id: userId,
    title: "",
    description: "",
    location_type: "remote",
    location_details: "",
    employment_type: "full-time",
    skills: [],
    experience: "",
    qualifications: [],
    salary_min: undefined,
    salary_max: undefined,
    salary_currency: "USD",
    benefits: [],
    deadline: undefined,
    start_date: undefined,
    openings: 1,
  });

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset after animation
      setTimeout(() => {
        setCurrentStep(1);
        setJobData({
          organization_id: organizationId,
          user_id: userId,
          title: "",
          description: "",
          location_type: "remote",
          location_details: "",
          employment_type: "full-time",
          skills: [],
          experience: "",
          qualifications: [],
          salary_min: undefined,
          salary_max: undefined,
          salary_currency: "USD",
          benefits: [],
          deadline: undefined,
          start_date: undefined,
          openings: 1,
        });
      }, 300);
    }
  };

  return (
    <Modal open={open} closeOnOutsideClick={!loading} onClose={handleClose}>
      <div className="max-w-4xl w-[900px] max-h-[85vh] overflow-y-auto py-4 px-2">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-sm font-medium ${currentStep >= 1 ? "text-indigo-600" : "text-gray-400"}`}
              >
                1. Basic Info
              </span>
              <span
                className={`text-sm font-medium ${currentStep >= 2 ? "text-indigo-600" : "text-gray-400"}`}
              >
                2. Requirements
              </span>
              <span
                className={`text-sm font-medium ${currentStep >= 3 ? "text-indigo-600" : "text-gray-400"}`}
              >
                3. Compensation
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <BasicInfoStep
              jobData={jobData}
              setJobData={setJobData}
              onNext={() => setCurrentStep(2)}
              onCancel={handleClose}
            />
          )}

          {currentStep === 2 && (
            <RequirementsStep
              jobData={jobData}
              setJobData={setJobData}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <CompensationStep
              jobData={jobData}
              setJobData={setJobData}
              loading={loading}
              setLoading={setLoading}
              onBack={() => setCurrentStep(2)}
              onClose={handleClose}
              onJobCreated={onJobCreated}
            />
          )}
      </div>
    </Modal>
  );
}
