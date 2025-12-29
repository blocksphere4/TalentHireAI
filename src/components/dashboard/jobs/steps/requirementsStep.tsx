"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { JobInsert } from "@/types/job";

interface Props {
  jobData: JobInsert;
  setJobData: (data: JobInsert) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function RequirementsStep({
  jobData,
  setJobData,
  onNext,
  onBack,
}: Props) {
  const [skills, setSkills] = useState<string[]>(jobData.skills);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState(jobData.experience);
  const [qualifications, setQualifications] = useState<string[]>(
    jobData.qualifications
  );
  const [qualificationInput, setQualificationInput] = useState("");

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const addQualification = () => {
    const trimmed = qualificationInput.trim();
    if (trimmed && !qualifications.includes(trimmed)) {
      setQualifications([...qualifications, trimmed]);
      setQualificationInput("");
    }
  };

  const removeQualification = (qual: string) => {
    setQualifications(qualifications.filter((q) => q !== qual));
  };

  const handleNext = () => {
    if (skills.length === 0 || !experience.trim() || qualifications.length === 0) {
      return;
    }

    setJobData({
      ...jobData,
      skills,
      experience: experience.trim(),
      qualifications,
    });

    onNext();
  };

  const isValid =
    skills.length > 0 && experience.trim() && qualifications.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Requirements</h2>
        <p className="text-gray-600">
          Define the skills, experience, and qualifications needed
        </p>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label htmlFor="skills" className="text-sm font-medium">
          Required Skills <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="skills"
            placeholder="e.g. JavaScript, React, Node.js"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            className="flex-1"
          />
          <Button type="button" onClick={addSkill} variant="outline">
            Add
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500">{skills.length} skills added</p>
      </div>

      {/* Experience */}
      <div className="space-y-2">
        <Label htmlFor="experience" className="text-sm font-medium">
          Experience Requirement <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="experience"
          placeholder="e.g. 3-5 years of experience in full-stack development, including 2+ years with React and Node.js"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          rows={3}
          className="w-full"
        />
        <p className="text-sm text-gray-500">
          Describe the years and type of experience needed
        </p>
      </div>

      {/* Qualifications */}
      <div className="space-y-2">
        <Label htmlFor="qualifications" className="text-sm font-medium">
          Required Qualifications <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="qualifications"
            placeholder="e.g. Bachelor's degree in Computer Science"
            value={qualificationInput}
            onChange={(e) => setQualificationInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addQualification();
              }
            }}
            className="flex-1"
          />
          <Button type="button" onClick={addQualification} variant="outline">
            Add
          </Button>
        </div>
        {qualifications.length > 0 && (
          <div className="flex flex-col gap-2 mt-2">
            {qualifications.map((qual, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded border"
              >
                <span className="text-sm">{qual}</span>
                <button
                  onClick={() => removeQualification(qual)}
                  className="hover:bg-gray-200 rounded-full p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-sm text-gray-500">
          {qualifications.length} qualifications added
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
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
