"use client";

import React from "react";
import { Difficulty, Subject, QuestionType } from "@repo/db/browser";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { formatDifficulty, formatSubject, formatQuestionType } from "@/lib/utils-ui";

interface QuestionFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    subject?: Subject;
    difficulty?: Difficulty;
    type?: QuestionType;
    topic?: string;
  }) => void;
}

export function QuestionFilters({ onFiltersChange }: QuestionFiltersProps) {
  const [search, setSearch] = React.useState("");
  const [subject, setSubject] = React.useState<Subject | "">("");
  const [difficulty, setDifficulty] = React.useState<Difficulty | "">("");
  const [type, setType] = React.useState<QuestionType | "">("");
  const [topic, setTopic] = React.useState("");

  const handleApplyFilters = () => {
    onFiltersChange({
      search: search || undefined,
      subject: (subject as Subject) || undefined,
      difficulty: (difficulty as Difficulty) || undefined,
      type: (type as QuestionType) || undefined,
      topic: topic || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setSubject("");
    setDifficulty("");
    setType("");
    setTopic("");
    onFiltersChange({});
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    (subject ? 1 : 0) +
    (difficulty ? 1 : 0) +
    (type ? 1 : 0) +
    (topic ? 1 : 0);

  return (
    <div className="space-y-4 p-4 bg-muted rounded-lg">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Search</label>
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Subject</label>
        <Select value={subject} onValueChange={(value) => setSubject(value as Subject | "")}>
          <SelectTrigger>
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Subjects</SelectItem>
            {Object.values(Subject).map((s) => (
              <SelectItem key={s} value={s}>
                {formatSubject(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Difficulty</label>
        <Select
          value={difficulty}
          onValueChange={(value) => setDifficulty(value as Difficulty | "")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Difficulties</SelectItem>
            {Object.values(Difficulty).map((d) => (
              <SelectItem key={d} value={d}>
                {formatDifficulty(d)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Question Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Question Type</label>
        <Select value={type} onValueChange={(value) => setType(value as QuestionType | "")}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {Object.values(QuestionType).map((t) => (
              <SelectItem key={t} value={t}>
                {formatQuestionType(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Topic */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Topic</label>
        <Input
          placeholder="Enter topic..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      {/* Active Filters Badge */}
      {activeFilterCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{activeFilterCount} filters active</Badge>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} className="flex-1">
          Apply Filters
        </Button>
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="flex-1"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
