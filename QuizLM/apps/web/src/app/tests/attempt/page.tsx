"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AttemptsAPI, TestsAPI } from "@/lib/apis";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Clock, ChevronLeft, ChevronRight } from "lucide-react";

type AttemptAnswerState = {
  answer: string;
  options: string[];
};

function TestAttemptContent() {
  const searchParams = useSearchParams();
  const testId = searchParams.get("test");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [test, setTest] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AttemptAnswerState>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!testId) return;

    const loadTest = async () => {
      try {
        const response = await TestsAPI.getTestById(testId);
        if (response.success && response.data) {
          setTest(response.data);
          // Start attempt
          const startResponse = await AttemptsAPI.startAttempt(testId);
          if (startResponse.success) {
            if (typeof startResponse.data === "string") {
              setAttemptId(startResponse.data);
            }
            // Set default time (e.g., 2 hours)
            setTimeLeft((response.data.duration || 120) * 60);
          }
        }
      } catch (error) {
        toast.error("Error", {
          description: "Failed to load test",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTest();
  }, [testId]);

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        answer,
        options: prev[questionId]?.options ?? [],
      },
    }));
  };

  const handleOptionToggle = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? { answer: "", options: [] };
      const exists = current.options.includes(optionId);
      return {
        ...prev,
        [questionId]: {
          ...current,
          options: exists
            ? current.options.filter((id) => id !== optionId)
            : [...current.options, optionId],
        },
      };
    });
  };

  const handleOptionSelectSingle = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? { answer: "", options: [] };
      return {
        ...prev,
        [questionId]: {
          ...current,
          options: [optionId],
        },
      };
    });
  };

  const handleSubmit = async () => {
    if (!test || !testId || !attemptId) return;

    try {
      setSubmitting(true);
      const payload = {
        attemptId,
        answers: (test.questions ?? []).map((q: any) => {
          const key = q.id as string | undefined;
          const state = key ? answers[key] : undefined;
          const trimmed = (state?.answer ?? "").trim();

          return {
            questionId: key ?? "",
            answer: trimmed.length ? trimmed : undefined,
            options: state?.options ?? [],
          };
        }),
      };

      // Filter out any items without a valid questionId
      payload.answers = payload.answers.filter((a: any) => Boolean(a.questionId));

      const response = await AttemptsAPI.finishAttempt(payload);

      if (response.success) {
        toast.success("Success", {
          description: "Test submitted successfully",
        });
        window.location.href = "/tests";
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to submit test",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test || !Array.isArray(test.questions) || test.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Test not found or has no questions</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];
  const currentQuestionId = currentQuestion?.id as string | undefined;
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;
  const timeString =
    timeLeft !== null
      ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
      : "∞";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-semibold">{test.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {test.questions.length}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-lg font-mono">
              <Clock className="w-5 h-5" />
              <span
                className={timeLeft !== null && timeLeft < 300 ? "text-red-600" : ""}
              >
                {timeString}
              </span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger>
                <Button variant="outline">Submit Test</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Submit Test?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to submit? You won&apos;t be able to change your
                  answers after submission.
                </AlertDialogDescription>
                <div className="flex gap-2 justify-end">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="p-8">
            <div className="space-y-6">
              {/* Question */}
              <div>
                <Badge className="mb-4">Question {currentQuestionIndex + 1}</Badge>
                <h2 className="text-2xl font-semibold mb-6">
                  {currentQuestion?.question}
                </h2>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </div>

              {/* Answer Input */}
              <div className="space-y-4">
                <Label className="text-base">Your Answer</Label>
                {Array.isArray(currentQuestion?.options) && currentQuestion.options.length > 0 ? (
                  <div className="space-y-2">
                    {currentQuestion.options.map((opt: any, idx: number) => {
                      const optId = opt.id as string | undefined;
                      const selected =
                        !!currentQuestionId &&
                        !!optId &&
                        (answers[currentQuestionId]?.options ?? []).includes(optId);

                      const isMulti = currentQuestion.type === "MULTI_MCQ";

                      return (
                        <button
                          key={optId ?? idx}
                          type="button"
                          onClick={() => {
                            if (!currentQuestionId || !optId) return;
                            if (isMulti) {
                              handleOptionToggle(currentQuestionId, optId);
                            } else {
                              handleOptionSelectSingle(currentQuestionId, optId);
                            }
                          }}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selected
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {opt.text ?? "Option"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <Textarea
                    placeholder="Type your answer here..."
                    value={
                      currentQuestionId
                        ? answers[currentQuestionId]?.answer ?? ""
                        : ""
                    }
                    onChange={(e) => {
                      if (!currentQuestionId) return;
                      handleAnswerChange(currentQuestionId, e.target.value);
                    }}
                    rows={6}
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-4 justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  disabled={currentQuestionIndex === 0}
                  onClick={() =>
                    setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
                  }
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={
                      currentQuestionIndex === test.questions.length - 1
                    }
                    onClick={() =>
                      setCurrentQuestionIndex(
                        Math.min(
                          test.questions.length - 1,
                          currentQuestionIndex + 1
                        )
                      )
                    }
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4 sticky top-24">
            <h3 className="font-semibold mb-4">Questions</h3>
            <div className="grid grid-cols-4 gap-2">
              {test.questions.map((q: any, index: number) => {
                const qId = q.id as string | undefined;
                const answered = qId
                  ? (answers[qId]?.answer ?? "").trim().length > 0 ||
                    (answers[qId]?.options?.length ?? 0) > 0
                  : false;

                return (
                <button
                  key={qId ?? index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`aspect-square rounded flex items-center justify-center text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-primary text-primary-foreground"
                      : answered
                      ? "bg-green-100 text-green-700"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {index + 1}
                </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-100" />
                <span className="text-muted-foreground">Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted" />
                <span className="text-muted-foreground">Not answered</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function TestAttemptPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <TestAttemptContent />
    </Suspense>
  );
}
