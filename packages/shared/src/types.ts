import { z } from "zod";
import {
  QuestionType,
  Difficulty,
  Subject,
  Level,
} from "@repo/db/browser";

export type APIResponse<T = any> = {
  success: boolean;
  statusCode: number;
  data?: T;
  message?: string;
};

// Pagination
export const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  offset: z.number().int().nonnegative().optional(),
  total: z.number().int().nonnegative(),
  pages: z.number().int().positive(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// Question Meta
export const QuestionMetaSchema = z.object({
  id: z.string(),
  question: z.string(),
  subject: z.enum(Subject),
  topic: z.string(),
  tags: z.array(z.string()),
  type: z.enum(QuestionType),
  difficulty: z.enum(Difficulty),
  imageUrl: z.string().optional().nullable(),
  options: z.array(z.string()),
  optionImageUrls: z.record(z.string(), z.string()).optional(),
  answer: z.string(),
  embeddings: z.array(z.number()).optional(),
  public: z.boolean().default(true),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

export type QuestionMeta = z.infer<typeof QuestionMetaSchema>;

// Create Question
export const CreateQuestionRequestSchema = z.object({
  questions: z.object({
    question: z.string().min(5),
    type: z.enum(QuestionType),
    difficulty: z.enum(Difficulty),
    level: z.enum(Level),
    subject: z.enum(Subject),
    topic: z.string().min(2),
    tags: z.array(z.string()).optional(),
    imageUrl: z.string().optional().nullable(),
    options: z.object({
      text: z.string(),
      imageUrl: z.string().optional(),
      isCorrect: z.boolean(),
    }).array().min(2),
    answer: z.string().optional(),
  }).array().min(1),
  public: z.boolean().default(true),
});

export type CreateQuestionRequest = z.infer<
  typeof CreateQuestionRequestSchema
>;

// Update Question
export const UpdateQuestionRequestSchema = CreateQuestionRequestSchema.partial();

export type UpdateQuestionRequest = z.infer<
  typeof UpdateQuestionRequestSchema
>;

// List Questions Filter
export const ListQuestionsFilterSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
  subject: z.enum(Subject).optional(),
  topic: z.string().optional(),
  difficulty: z.enum(Difficulty).optional(),
  type: z.enum(QuestionType).optional(),
  public: z.boolean().optional(),
  sortBy: z.enum(["createdAt", "difficulty", "topic"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ListQuestionsFilter = z.infer<typeof ListQuestionsFilterSchema>;

// Test Meta
export const TestMetaSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(z.object({
    id: z.string().optional(),
    question: z.string(),
    subject: z.enum(Subject),
    topic: z.string(),
    type: z.enum(QuestionType),
    difficulty: z.enum(Difficulty),
    imageUrl: z.string().optional().nullable(),
    maxScore: z.number().optional(),
    order: z.number().int().optional(),
    options: z.array(z.object({
      id: z.string().optional(),
      text: z.string(),
      imageUrl: z.string().optional(),
    })),
  })),
  difficulty: z.enum(Difficulty),
  subjects: z.enum(Subject).array(),
  level: z.enum(Level),
  public: z.boolean(),
  duration: z.number().optional(), // in minutes
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
  attemptCount: z.number().default(0),
  averageScore: z.number().optional(),
});

export type TestMeta = z.infer<typeof TestMetaSchema>;

export type MiniTestMeta = Omit<TestMeta, "questions"> & {
  questionCount: number;
};

// Create Test
export const CreateTestRequestSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  questions: z.array(z.object({
    id: z.string(),
    maxScore: z.number().positive().min(1),
    order: z.number().int().positive(),
  })).min(1),
  difficulty: z.enum(Difficulty),
  subject: z.enum(Subject),
  level: z.enum(Level),
  public: z.boolean().default(false),
  duration: z.number().optional(),
  passingScore: z.number().optional(),
});

export type CreateTestRequest = z.infer<typeof CreateTestRequestSchema>;

export const ListTestFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  public: z.boolean().optional(),
  difficulty: z.enum(Difficulty).optional(),
  subject: z.enum(Subject).optional(),
});

export type ListTestFilters = z.infer<typeof ListTestFiltersSchema>;

// Generate Test (AI)
export const GenerateTestRequestSchema = z.object({
  subjects: z.array(z.enum(Subject)).min(1),
  topics: z.array(z.string()).optional(),
  level: z.enum(Level),
  difficulty: z.enum(Difficulty),
  questionCount: z.number().int().positive(),
  public: z.boolean().default(false),
  title: z.string().optional(),
});

export type GenerateTestRequest = z.infer<typeof GenerateTestRequestSchema>;

// Test Attempt
export const TestAttemptSchema = z.object({
  id: z.string(),
  testId: z.string(),
  userId: z.string(),
  answers: z.record(z.string(), z.string()), // questionId -> answer
  score: z.number().optional(),
  totalMarks: z.number(),
  status: z.enum(["in_progress", "submitted"]),
  startedAt: z.date().or(z.string()),
  submittedAt: z.date().or(z.string()).optional(),
});

export type TestAttempt = z.infer<typeof TestAttemptSchema>;

// Submit Answer
export const SubmitAnswerRequestSchema = z.object({
  attemptId: z.string(),
  questionId: z.string(),
  answer: z.string().optional(),
  options: z.string().array()
});

export type SubmitAnswerRequest = z.infer<typeof SubmitAnswerRequestSchema>;

export const SubmitAttemptRequestSchema = z.object({
  attemptId: z.string(),
  answers: z.object({
    questionId: z.string(),
    answer: z.string().optional(),
    options: z.string().array()
  }).array(),
});
export type SubmitAttemptRequest = z.infer<typeof SubmitAttemptRequestSchema>;
// Analytics
export const AnalyticsSchema = z.object({
  totalTests: z.number(),
  totalAttempts: z.number(),
  averageScore: z.number(),
  strongestTopic: z.string().optional(),
  weakestTopic: z.string().optional(),
  topicPerformance: z.array(
    z.object({
      topic: z.string(),
      score: z.number(),
      attempts: z.number(),
    })
  ),
  scoreDistribution: z.array(
    z.object({
      score: z.number(),
      count: z.number(),
    })
  ),
});

export type Analytics = z.infer<typeof AnalyticsSchema>;


export type DashboardData = {
  totalTests: number;
  totalAttempts: number;
  averageScore: number;
  strongestTopic: string | null;
  weakestTopic: string | null;
  recentTests: Array<{
    id: string;
    title: string;
    score: number;
    totalMarks: number;
    submittedAt: string;
  }>;
};
// User
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatar: z.string().optional(),
  createdAt: z.date().or(z.string()),
});

export type User = z.infer<typeof UserSchema>;

// Document Upload Response
export const DocumentUploadResponseSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  extractedQuestions: z.array(QuestionMetaSchema).optional(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
});

export type DocumentUploadResponse = z.infer<
  typeof DocumentUploadResponseSchema
>;

export const ConfigSchema = z.object({
  env: z.enum(["development", "production"]),
  express: z.object({
    port: z.number(),
    url: z.string(),
  }),
  nextUrl: z.string(),
  db: z.object({
    user: z.string(),
    password: z.string(),
    database: z.string(),
    host: z.string().default("localhost"),
    port: z.number().default(5432),
    url: z.string().optional(),
  }),
  clerk: z.object({
    publishableKey: z.string(),
    secretKey: z.string(),
    webhookSecret: z.string(),
  }),
  geminiApiKey: z.string(),
});

export type Config = z.infer<typeof ConfigSchema>;
export const ClientConfigSchema = z.object({
  expressUrl: z.string(),
});
export type ClientConfig = z.infer<typeof ClientConfigSchema>;



const OptionSchema = z.object({
  text: z.string(),
  isCorrect: z.boolean(),
});

const QuestionSchema = z.object({
  question: z.string(),
  type: z.enum(QuestionType),
  options: z.array(OptionSchema).default([]),
  answer: z.string().nullable().optional(),
});

export const InferQuestionsSchema = z.array(
  QuestionSchema
);

export type InferQuestions = z.infer<typeof InferQuestionsSchema>;

// export type Analytics = 