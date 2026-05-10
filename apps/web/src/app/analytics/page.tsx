"use client";

import { useMemo } from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { AnalyticsCard } from "@/components/cards/analytics-card";
import { Card } from "@/components/ui/card";
import {
  BarChart3,
  ClipboardList,
  Target,
  TrendingUp,
  BookOpen,
} from "lucide-react";
import { useApiRequest } from "@/hooks/useApiRequest";
import { AnalyticsAPI } from "@/lib/apis";
import { Progress } from "@/components/ui/progress";

export default function AnalyticsPage() {
  const { data: analytics, loading, message } = useApiRequest(
    () => AnalyticsAPI.getAnalytics(),
    true
  );

  const maxDistributionCount = useMemo(() => {
    const counts = analytics?.scoreDistribution?.map((d) => d.count) ?? [];
    return counts.length ? Math.max(...counts) : 0;
  }, [analytics]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your performance and identify improvement areas.
          </p>
        </div>

        {message && (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">{message}</p>
          </Card>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsCard
            title="Tests Created"
            value={loading ? "…" : analytics?.totalTests ?? 0}
            icon={ClipboardList}
            subtext="Total quizzes"
          />
          <AnalyticsCard
            title="Attempts Made"
            value={loading ? "…" : analytics?.totalAttempts ?? 0}
            icon={Target}
            subtext="Total attempts"
          />
          <AnalyticsCard
            title="Average Score"
            value={loading ? "…" : `${Math.round(analytics?.averageScore ?? 0)}%`}
            icon={TrendingUp}
            subtext="Across all tests"
          />
          <AnalyticsCard
            title="Topics Tracked"
            value={loading ? "…" : analytics?.topicPerformance?.length ?? 0}
            icon={BookOpen}
            subtext="In performance breakdown"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topic performance */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Topic Performance</h2>
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : analytics?.topicPerformance?.length ? (
                <div className="space-y-4">
                  {analytics.topicPerformance
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 8)
                    .map((t) => (
                      <div key={t.topic} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{t.topic}</p>
                          <p className="text-sm text-muted-foreground tabular-nums">
                            {Math.round(t.score)}% · {t.attempts} attempts
                          </p>
                        </div>
                        <Progress value={Math.max(0, Math.min(100, t.score))} />
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No analytics available yet. Attempt a test to generate insights.
                </p>
              )}
            </Card>
          </div>

          {/* Score distribution */}
          <div>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Score Distribution</h2>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : analytics?.scoreDistribution?.length ? (
                <div className="space-y-3">
                  {analytics.scoreDistribution
                    .slice()
                    .sort((a, b) => a.score - b.score)
                    .map((d) => {
                      const widthPct =
                        maxDistributionCount > 0
                          ? Math.round((d.count / maxDistributionCount) * 100)
                          : 0;

                      return (
                        <div key={d.score} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{d.score}%</p>
                            <p className="text-sm tabular-nums">{d.count}</p>
                          </div>
                          <div className="h-2 rounded bg-muted overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No distribution data available yet.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
