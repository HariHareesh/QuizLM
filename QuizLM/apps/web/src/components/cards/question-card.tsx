import React from "react";
import { QuestionMeta } from "@repo/shared/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatDifficulty,
  getDifficultyColor,
  formatSubject,
  getSubjectColor,
  formatQuestionType,
} from "@/lib/utils-ui";
import { ImageIcon, ChevronRight } from "lucide-react";

interface QuestionCardProps {
  question: QuestionMeta;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  showImage?: boolean;
}

export function QuestionCard({
  question,
  onSelect,
  isSelected = false,
  showImage = true,
}: QuestionCardProps) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? "ring-2 ring-primary bg-primary/5" : ""
      }`}
      onClick={() => onSelect?.(question.id)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-medium line-clamp-2">{question.question}</h3>
          </div>
          {showImage && question.imageUrl && (
            <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={getDifficultyColor(question.difficulty)}
          >
            {formatDifficulty(question.difficulty)}
          </Badge>
          <Badge
            variant="secondary"
            className={getSubjectColor(question.subject)}
          >
            {formatSubject(question.subject)}
          </Badge>
          <Badge variant="outline">{formatQuestionType(question.type)}</Badge>
        </div>

        {/* Topic and Tags */}
        <div className="flex flex-wrap gap-1">
          {question.topic && (
            <Badge variant="ghost" className="text-xs">
              {question.topic}
            </Badge>
          )}
          {question.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="ghost" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Preview of options */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">{question.options.length} options</p>
          <p className="line-clamp-1">Answer: {question.answer}</p>
        </div>
      </div>
    </Card>
  );
}
