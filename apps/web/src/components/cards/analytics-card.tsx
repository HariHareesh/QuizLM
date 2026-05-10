import React from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  className?: string;
}

export function AnalyticsCard({
  title,
  value,
  icon: Icon,
  subtext,
  trend,
  className,
}: AnalyticsCardProps) {
  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
          {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {trend && (
        <div className="mt-4 flex items-center gap-1 text-sm">
          {trend.direction === "up" ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span
            className={
              trend.direction === "up" ? "text-green-600" : "text-red-600"
            }
          >
            {trend.direction === "up" ? "+" : "-"}
            {trend.value}%
          </span>
        </div>
      )}
    </Card>
  );
}
