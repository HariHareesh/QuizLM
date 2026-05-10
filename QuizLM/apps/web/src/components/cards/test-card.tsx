import { MiniTestMeta, TestMeta } from "@repo/shared/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDifficulty,
  getDifficultyColor,
  formatSubject,
  getSubjectColor,
} from "@/lib/utils-ui";
import { BookOpen, Users, FileQuestion, Share2, Play } from "lucide-react";

interface TestCardProps {
  test: TestMeta | MiniTestMeta;
  onAttempt?: (testId: string) => void;
  onShare?: (testId: string) => void;
}

export function TestCard({ test, onAttempt, onShare }: TestCardProps) {
  const questionCount = "questions" in test ? test.questions.length : test.questionCount;
  const averageScore = test.averageScore;

  return (
    <Card className="p-4">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-semibold line-clamp-2">{test.title}</h3>
            {test.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                {test.description}
              </p>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={getDifficultyColor(test.difficulty)}
          >
            {formatDifficulty(test.difficulty)}
          </Badge>
          {test.subjects.map((subject) => (
            <Badge
              key={subject}
              variant="secondary"
              className={getSubjectColor(subject)}
            >
              {formatSubject(subject)}
            </Badge>
          ))}
          {test.public && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Public
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="flex flex-col items-center gap-1">
            <FileQuestion className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{questionCount}</span>
            <span className="text-muted-foreground">Questions</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{test.attemptCount || 0}</span>
            <span className="text-muted-foreground">Attempts</span>
          </div>
          {averageScore !== undefined && averageScore !== null && (
            <div className="flex flex-col items-center gap-1">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{Math.round(averageScore)}%</span>
              <span className="text-muted-foreground">Avg Score</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAttempt?.(test.id)}
          >
            <Play className="w-3 h-3 mr-1" />
            Attempt
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onShare?.(test.id)}
          >
            <Share2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
