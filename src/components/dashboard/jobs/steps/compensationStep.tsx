"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import { JobInsert } from "@/types/job";
import axios from "axios";
import { toast } from "sonner";

interface Props {
  jobData: JobInsert;
  setJobData: (data: JobInsert) => void;
  onBack: () => void;
  onClose: () => void;
  setLoading: (loading: boolean) => void;
  loading: boolean;
  onJobCreated: () => void;
}

export default function CompensationStep({
  jobData,
  setJobData,
  onBack,
  onClose,
  setLoading,
  loading,
  onJobCreated,
}: Props) {
  const [showSalary, setShowSalary] = useState(
    !!(jobData.salary_min || jobData.salary_max)
  );
  const [salaryMin, setSalaryMin] = useState(
    jobData.salary_min?.toString() || ""
  );
  const [salaryMax, setSalaryMax] = useState(
    jobData.salary_max?.toString() || ""
  );
  const [benefits, setBenefits] = useState<string[]>(jobData.benefits || []);
  const [benefitInput, setBenefitInput] = useState("");
  const [deadline, setDeadline] = useState(
    jobData.deadline ? new Date(jobData.deadline).toISOString().split("T")[0] : ""
  );
  const [startDate, setStartDate] = useState(
    jobData.start_date
      ? new Date(jobData.start_date).toISOString().split("T")[0]
      : ""
  );
  const [openings, setOpenings] = useState(jobData.openings.toString());

  const addBenefit = () => {
    const trimmed = benefitInput.trim();
    if (trimmed && !benefits.includes(trimmed)) {
      setBenefits([...benefits, trimmed]);
      setBenefitInput("");
    }
  };

  const removeBenefit = (benefit: string) => {
    setBenefits(benefits.filter((b) => b !== benefit));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const finalJobData: JobInsert = {
      ...jobData,
      salary_min: showSalary && salaryMin ? parseInt(salaryMin) : undefined,
      salary_max: showSalary && salaryMax ? parseInt(salaryMax) : undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      deadline: deadline ? new Date(deadline) : undefined,
      start_date: startDate ? new Date(startDate) : undefined,
      openings: parseInt(openings) || 1,
    };

    try {
      const response = await axios.post("/api/jobs/create", {
        jobData: finalJobData,
      });

      if (response.data.success) {
        toast.success("Job created successfully!", {
          position: "bottom-right",
          duration: 3000,
        });
        onJobCreated();
        onClose();
      } else {
        toast.error("Failed to create job", {
          position: "bottom-right",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("An error occurred while creating the job", {
        position: "bottom-right",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const isValid = parseInt(openings) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Compensation & Details</h2>
        <p className="text-gray-600">
          Set salary range and additional details (optional)
        </p>
      </div>

      {/* Show Salary Toggle */}
      <div className="flex items-center space-x-2">
        <Switch
          id="show-salary"
          checked={showSalary}
          onCheckedChange={setShowSalary}
        />
        <Label htmlFor="show-salary" className="text-sm font-medium">
          Include salary range (optional)
        </Label>
      </div>

      {/* Salary Range */}
      {showSalary && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salaryMin" className="text-sm font-medium">
              Minimum Salary
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="salaryMin"
                type="number"
                placeholder="50000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salaryMax" className="text-sm font-medium">
              Maximum Salary
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="salaryMax"
                type="number"
                placeholder="80000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="pl-7"
              />
            </div>
          </div>
        </div>
      )}

      {/* Benefits */}
      <div className="space-y-2">
        <Label htmlFor="benefits" className="text-sm font-medium">
          Benefits (optional)
        </Label>
        <div className="flex gap-2">
          <Input
            id="benefits"
            placeholder="e.g. Health Insurance, 401k, Remote Work"
            value={benefitInput}
            onChange={(e) => setBenefitInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addBenefit();
              }
            }}
            className="flex-1"
          />
          <Button type="button" onClick={addBenefit} variant="outline">
            Add
          </Button>
        </div>
        {benefits.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {benefits.map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {benefit}
                <button
                  onClick={() => removeBenefit(benefit)}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Application Deadline */}
      <div className="space-y-2">
        <Label htmlFor="deadline" className="text-sm font-medium">
          Application Deadline (optional)
        </Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label htmlFor="startDate" className="text-sm font-medium">
          Expected Start Date (optional)
        </Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      {/* Number of Openings */}
      <div className="space-y-2">
        <Label htmlFor="openings" className="text-sm font-medium">
          Number of Openings <span className="text-red-500">*</span>
        </Label>
        <Input
          id="openings"
          type="number"
          min="1"
          value={openings}
          onChange={(e) => setOpenings(e.target.value)}
          className="w-32"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!isValid || loading}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {loading ? "Creating..." : "Create Job"}
        </Button>
      </div>
    </div>
  );
}
