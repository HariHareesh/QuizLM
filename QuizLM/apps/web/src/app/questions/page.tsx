"use client";

import { useState, useCallback } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { QuestionCard } from "@/components/cards/question-card";
import { QuestionFilters } from "@/components/filters/question-filters";
import { Button } from "@/components/ui/button";
import { QuestionsAPI } from "@/lib/apis";
import { ListQuestionsFilter } from "@repo/shared/types";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useApiRequest } from "@/hooks/useApiRequest";
import { QuestionGridSkeleton } from "@/components/skeletons/question-skeleton";

export default function QuestionsPage() {
  const [filters, setFilters] = useState<Partial<ListQuestionsFilter>>({});
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [showFilters, setShowFilters] = useState(false);

  const [queryFilters, setQueryFilters] = useState<Partial<ListQuestionsFilter>>({
    page: 1,
    limit: 12,
  });

  const { data: response, loading, refetch } = useApiRequest(
    () =>
      QuestionsAPI.getQuestions({
        ...queryFilters,
        ...filters,
      } as ListQuestionsFilter),
    true
  );

  const handleFiltersChange = useCallback(
    (newFilters: Partial<ListQuestionsFilter>) => {
      setFilters(newFilters);
      setQueryFilters((prev) => ({ ...prev, page: 1 }));
    },
    []
  );

  const handleSelectQuestion = useCallback((id: string) => {
    setSelectedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const questions = response?.items || [];
  const pagination = response?.pagination;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Question Bank</h1>
            <p className="text-muted-foreground mt-1">
              {pagination?.total || 0} questions available
            </p>
          </div>
          <Link href="/questions/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Question
            </Button>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            className="pl-10"
            onChange={(e) =>
              handleFiltersChange({ ...filters, search: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Button
                variant="outline"
                className="w-full lg:hidden mb-4"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
              {showFilters && (
                <QuestionFilters onFiltersChange={handleFiltersChange} />
              )}
            </div>
          </div>

          {/* Questions Grid */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <QuestionGridSkeleton count={6} />
            ) : questions.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {questions.map((question) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      onSelect={handleSelectQuestion}
                      isSelected={selectedQuestions.has(question.id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={pagination.page === 1}
                      onClick={() =>
                        setQueryFilters((prev) => ({
                          ...prev,
                          page: Math.max(1, prev.page! - 1),
                        }))
                      }
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-2 px-4">
                      Page {pagination.page} of {pagination.pages}
                    </div>
                    <Button
                      variant="outline"
                      disabled={pagination.page === pagination.pages}
                      onClick={() =>
                        setQueryFilters((prev) => ({
                          ...prev,
                          page: Math.min(
                            pagination.pages,
                            prev.page! + 1
                          ),
                        }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No questions found. Try adjusting your filters.
                </p>
                <Link href="/questions/create">
                  <Button variant="outline">Create your first question</Button>
                </Link>
              </div>
            )}

            {/* Sticky Action Bar */}
            {selectedQuestions.size > 0 && (
              <div className="fixed bottom-6 left-6 right-6 bg-card border rounded-lg p-4 shadow-lg flex items-center justify-between">
                <p className="font-medium">
                  {selectedQuestions.size} question(s) selected
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedQuestions(new Set())}
                  >
                    Clear
                  </Button>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Compile Test
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
