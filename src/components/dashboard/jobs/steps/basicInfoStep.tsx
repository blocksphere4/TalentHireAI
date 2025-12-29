"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobInsert } from "@/types/job";

interface Props {
  jobData: JobInsert;
  setJobData: (data: JobInsert) => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function BasicInfoStep({
  jobData,
  setJobData,
  onNext,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(jobData.title);
  const [description, setDescription] = useState(jobData.description);
  const [locationType, setLocationType] = useState(jobData.location_type);
  const [locationDetails, setLocationDetails] = useState(
    jobData.location_details || ""
  );
  const [employmentType, setEmploymentType] = useState(jobData.employment_type);

  const handleNext = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    setJobData({
      ...jobData,
      title: title.trim(),
      description: description.trim(),
      location_type: locationType,
      location_details: locationDetails.trim() || undefined,
      employment_type: employmentType,
    });

    onNext();
  };

  const isValid = title.trim() && description.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-gray-600">
          Let's start with the basic details of the job posting
        </p>
      </div>

      {/* Job Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm font-medium">
          Job Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Senior Full Stack Developer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Job Description <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe the role, responsibilities, and what makes this opportunity unique..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="w-full"
        />
        <p className="text-sm text-gray-500">
          {description.length} characters
        </p>
      </div>

      {/* Location Type */}
      <div className="space-y-2">
        <Label htmlFor="locationType" className="text-sm font-medium">
          Location Type <span className="text-red-500">*</span>
        </Label>
        <Select value={locationType} onValueChange={(value: any) => setLocationType(value)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="onsite">Onsite</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Location Details (conditional) */}
      {(locationType === "onsite" || locationType === "hybrid") && (
        <div className="space-y-2">
          <Label htmlFor="locationDetails" className="text-sm font-medium">
            Location Details
          </Label>
          <Input
            id="locationDetails"
            placeholder="e.g. San Francisco, CA or New York City"
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Employment Type */}
      <div className="space-y-2">
        <Label htmlFor="employmentType" className="text-sm font-medium">
          Employment Type <span className="text-red-500">*</span>
        </Label>
        <Select value={employmentType} onValueChange={(value: any) => setEmploymentType(value)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
