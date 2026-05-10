"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Difficulty, Subject, Level } from "@repo/db/browser";
import { GenerateTestRequestSchema } from "@repo/shared/types";
import { TestsAPI } from "@/lib/apis";
import { toast } from "sonner";
import { Loader, Sparkles } from "lucide-react";
import {
  formatDifficulty,
  formatSubject,
  formatLevel,
} from "@/lib/utils-ui";
import { Card } from "@/components/ui/card";

export default function CreateTestPage() {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("ai");
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(GenerateTestRequestSchema),
    defaultValues: {
      subjects: [],
      topics: [],
      level: Level.SECONDARY,
      difficulty: Difficulty.MEDIUM,
      questionCount: 20,
      public: false,
    },
  });

  const handleSubjectToggle = (subject: Subject) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter((s) => s !== subject)
      : [...selectedSubjects, subject];
    setSelectedSubjects(newSubjects);
    setValue("subjects", newSubjects);
  };

  async function onSubmit(data: any) {
    if (selectedSubjects.length === 0) {
      toast.error("Error", {
        description: "Please select at least one subject",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await TestsAPI.generateTest({
        ...data,
        subjects: selectedSubjects,
      });

      if (response.success) {
        toast.success("Success", {
          description: "Test generated successfully",
        });
        reset();
        setSelectedSubjects([]);
      } else {
        toast.error("Error", {
          description: response.message || "Failed to generate test",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold">Create Test</h1>
          <p className="text-muted-foreground mt-1">
            Generate tests using AI or create them manually
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai" className="gap-2">
              <Sparkles className="w-4 h-4" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="manual">Manual Selection</TabsTrigger>
          </TabsList>

          {/* AI Generation Tab */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <p className="text-sm">
                QuizLM will search your question bank using semantic search to find
                relevant questions based on your criteria.
              </p>
            </Card>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Subjects Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subjects</label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.values(Subject).map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject}
                        checked={selectedSubjects.includes(subject)}
                        onCheckedChange={() => handleSubjectToggle(subject)}
                      />
                      <label
                        htmlFor={subject}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {formatSubject(subject)}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.subjects?.message && (
                  <p className="text-sm text-destructive">
                    {String(errors.subjects.message)}
                  </p>
                )}
              </div>

              {/* Level */}
              <Controller
                control={control}
                name="level"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Education Level</label>
                    <p className="text-sm text-muted-foreground">
                      Topics become optional when you select a level
                    </p>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Level).map((level) => (
                          <SelectItem key={level} value={level}>
                            {formatLevel(level)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.level?.message && (
                      <p className="text-sm text-destructive">
                        {String(errors.level.message)}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Difficulty */}
              <Controller
                control={control}
                name="difficulty"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Difficulty).map((diff) => (
                          <SelectItem key={diff} value={diff}>
                            {formatDifficulty(diff)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.difficulty?.message && (
                      <p className="text-sm text-destructive">
                        {String(errors.difficulty.message)}
                      </p>
                    )}
                  </div>
                )}
              />

              {/* Question Count */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Questions</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  {...register("questionCount", { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  Between 1 and 100 questions
                </p>
                {errors.questionCount?.message && (
                  <p className="text-sm text-destructive">
                    {String(errors.questionCount.message)}
                  </p>
                )}
              </div>

              {/* Visibility */}
              <Controller
                control={control}
                name="public"
                render={({ field }) => (
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <label className="text-sm font-medium">Make Public</label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see and attempt this test
                      </p>
                    </div>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              {/* Submit */}
              <Button type="submit" disabled={loading} className="w-full">
                {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                Generate Test
              </Button>
            </form>
          </TabsContent>

          {/* Manual Selection Tab */}
          <TabsContent value="manual" className="space-y-6">
            <Card className="p-6 bg-primary/5">
              <p className="text-sm">
                Go to the Question Bank to manually select questions for your test.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
