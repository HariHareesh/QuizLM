"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { TestCard } from "@/components/cards/test-card";
import { Button } from "@/components/ui/button";
import { useApiRequest } from "@/hooks/useApiRequest";
import { TestsAPI } from "@/lib/apis";
import { Plus, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TestsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const { data: response, loading } = useApiRequest(
    () =>
      TestsAPI.getTests({
        page,
        limit: 12,
      }),
    true
  );

  const tests = response?.items || [];
  const pagination = response?.pagination;

  const handleAttempt = (testId: string) => {
    router.push(`/test/attempt?test=${testId}`);
  };

  const handleShare = (testId: string) => {
    // Copy link to clipboard
    const url = `${window.location.origin}/tests/${testId}`;
    navigator.clipboard.writeText(url);
    // Show toast
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tests</h1>
            <p className="text-muted-foreground mt-1">
              {pagination?.total || 0} tests available
            </p>
          </div>
          <Link href="/tests/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Test
            </Button>
          </Link>
        </div>

        {/* Tests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : tests.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onAttempt={handleAttempt}
                  onShare={handleShare}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2 px-4">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No tests found.</p>
            <Link href="/tests/create">
              <Button>Create your first test</Button>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
