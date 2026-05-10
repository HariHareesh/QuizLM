import { Difficulty, QuestionType, Subject, Level } from "@repo/db/browser";

// Format difficulty for display
export const formatDifficulty = (difficulty: Difficulty): string => {
  const map: Record<Difficulty, string> = {
    EASY: "Easy",
    MEDIUM: "Medium",
    HARD: "Hard",
  };
  return map[difficulty] || difficulty;
};

// Get difficulty color
export const getDifficultyColor = (difficulty: Difficulty): string => {
  const map: Record<Difficulty, string> = {
    EASY: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HARD: "bg-red-100 text-red-800",
  };
  return map[difficulty] || "";
};

// Format subject for display
export const formatSubject = (subject: Subject): string => {
  const map: Record<Subject, string> = {
    MATH: "Mathematics",
    SCIENCE: "Science",
    HISTORY: "History",
    LITERATURE: "Literature",
    ART: "Art",
    TECHNOLOGY: "Technology",
    OTHER: "Other",
  };
  return map[subject] || subject;
};

// Get subject color
export const getSubjectColor = (subject: Subject): string => {
  const map: Record<Subject, string> = {
    MATH: "bg-blue-100 text-blue-800",
    SCIENCE: "bg-green-100 text-green-800",
    HISTORY: "bg-purple-100 text-purple-800",
    LITERATURE: "bg-pink-100 text-pink-800",
    ART: "bg-orange-100 text-orange-800",
    TECHNOLOGY: "bg-cyan-100 text-cyan-800",
    OTHER: "bg-gray-100 text-gray-800",
  };
  return map[subject] || "";
};

// Format question type for display
export const formatQuestionType = (type: QuestionType): string => {
  const map: Record<QuestionType, string> = {
    MCQ: "Multiple Choice",
    MULTI_MCQ: "Multiple Select",
    TRUE_FALSE: "True/False",
    SHORT_ANSWER: "Short Answer",
    LONG_ANSWER: "Long Answer",
  };
  return map[type] || type;
};

// Get question type icon
export const getQuestionTypeIcon = (type: QuestionType): string => {
  const map: Record<QuestionType, string> = {
    MCQ: "●",
    MULTI_MCQ: "☑",
    TRUE_FALSE: "T/F",
    SHORT_ANSWER: "✎",
    LONG_ANSWER: "✍",
  };
  return map[type] || "?";
};

// Format level for display
export const formatLevel = (level: Level): string => {
  const map: Record<Level, string> = {
    PRIMARY: "Primary",
    SECONDARY: "Secondary",
    SENIOR_SECONDARY: "Senior Secondary",
    UNDERGRADUATE: "Undergraduate",
    POSTGRADUATE: "Postgraduate",
    PROFESSIONAL: "Professional",
  };
  return map[level] || level;
};

// Get level color
export const getLevelColor = (level: Level): string => {
  const map: Record<Level, string> = {
    PRIMARY: "bg-blue-100 text-blue-800",
    SECONDARY: "bg-cyan-100 text-cyan-800",
    SENIOR_SECONDARY: "bg-indigo-100 text-indigo-800",
    UNDERGRADUATE: "bg-purple-100 text-purple-800",
    POSTGRADUATE: "bg-pink-100 text-pink-800",
    PROFESSIONAL: "bg-red-100 text-red-800",
  };
  return map[level] || "";
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Format score
export const formatScore = (score: number, total: number): string => {
  return `${score}/${total}`;
};

// Format date
export const formatDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Format time remaining
export const formatTimeRemaining = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

// Get score status
export const getScoreStatus = (score: number, total: number): "pass" | "fail" => {
  const percentage = (score / total) * 100;
  return percentage >= 40 ? "pass" : "fail";
};

// Get score badge color
export const getScoreBadgeColor = (score: number, total: number): string => {
  const percentage = (score / total) * 100;
  if (percentage >= 80) return "bg-green-100 text-green-800";
  if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
  if (percentage >= 40) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};
