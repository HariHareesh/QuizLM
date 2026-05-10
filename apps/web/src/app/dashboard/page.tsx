"use client";

import { AppLayout } from "@/components/layouts/app-layout";
import { AnalyticsCard } from "@/components/cards/analytics-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  FileText,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Target,
} from "lucide-react";
import Link from "next/link";
import { useApiRequest } from "@/hooks/useApiRequest";
import { AnalyticsAPI } from "@/lib/apis";

export default function DashboardPage() {
  const { data: analytics, loading } = useApiRequest(
    () => AnalyticsAPI.getDashboardAnalytics(),
    true
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here&apos;s your learning overview.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/questions/create">
              <Button variant="outline">Create Question</Button>
            </Link>
            <Link href="/tests/create">
              <Button>Create Test</Button>
            </Link>
          </div>
        </div>

        {/* Analytics Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsCard
              title="Tests Created"
              value={analytics?.totalTests || 0}
              icon={ClipboardList}
              subtext="Total quizzes"
            />
            <AnalyticsCard
              title="Attempts Made"
              value={analytics?.totalAttempts || 0}
              icon={Target}
              subtext="Total test attempts"
            />
            <AnalyticsCard
              title="Average Score"
              value={`${Math.round(analytics?.averageScore || 0)}%`}
              icon={TrendingUp}
              subtext="Across all tests"
            />
            <AnalyticsCard
              title="Questions Created"
              value="0"
              icon={FileText}
              subtext="In question bank"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Strongest Topic */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Strongest Topic</h3>
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              {analytics?.strongestTopic ? (
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{analytics.strongestTopic}</p>
                  <p className="text-sm text-muted-foreground">
                    Your most successful area of study
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Take some tests to see your strongest topics
                </p>
              )}
            </Card>

            {/* Weakest Topic */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Area for Improvement</h3>
                <Target className="w-5 h-5 text-red-500" />
              </div>
              {analytics?.weakestTopic ? (
                <div className="space-y-2">
                  <p className="text-2xl font-bold">{analytics.weakestTopic}</p>
                  <p className="text-sm text-muted-foreground">
                    Focus on this area to improve your scores
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Take some tests to identify areas for improvement
                </p>
              )}
            </Card>

            {/* Recent Tests */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Recent Tests</h3>
              {analytics?.recentTests && analytics.recentTests.length > 0 ? (
                <div className="space-y-3">
                  {analytics.recentTests.slice(0, 3).map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{test.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(test.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {Math.round((test.score / test.totalMarks) * 100)}%
                      </Badge>
                    </div>
                  ))}
                  <Link href="/tests">
                    <Button variant="ghost" className="w-full">
                      View all tests
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground text-sm">
                    No tests attempted yet
                  </p>
                  <Link href="/tests/create">
                    <Button variant="link" className="mt-2">
                      Create your first test
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/questions/create">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Question
                  </Button>
                </Link>
                <Link href="/questions">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Questions
                  </Button>
                </Link>
                <Link href="/tests/create">
                  <Button variant="outline" className="w-full justify-start">
                    <ClipboardList className="w-4 h-4 mr-2" />
                    New Test
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Getting Started */}
            <Card className="p-6 space-y-4 bg-primary/5 border-primary/20">
              <h3 className="font-semibold">Getting Started</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <div className="text-primary font-bold">1.</div>
                  <p>Upload documents or create questions manually</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary font-bold">2.</div>
                  <p>Search and organize your question bank</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary font-bold">3.</div>
                  <p>Generate or compile tests</p>
                </div>
                <div className="flex gap-2">
                  <div className="text-primary font-bold">4.</div>
                  <p>Share with students and track results</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
