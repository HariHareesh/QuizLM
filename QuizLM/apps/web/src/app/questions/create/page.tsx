"use client";

import { useState, useCallback, useRef } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Difficulty, Level, Subject, QuestionType } from "@repo/db/browser";
import { CreateQuestionRequestSchema } from "@repo/shared/types";
import { QuestionsAPI, UploadAPI } from "@/lib/apis";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Upload,
  Loader,
  GripVertical,
  Copy,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Image as ImageIcon,
  Tag,
  X,
} from "lucide-react";
import {
  formatDifficulty,
  formatSubject,
  formatQuestionType,
} from "@/lib/utils-ui";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionItem = {
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
};

type QuestionItem = {
  question: string;
  type: QuestionType;
  difficulty: Difficulty;
  level: Level;
  subject: Subject;
  topic: string;
  tags?: string[];
  imageUrl?: string | null;
  options: OptionItem[];
  answer?: string;
};

type FormValues = {
  questions: QuestionItem[];
  public?: boolean;
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultOption = (): OptionItem => ({ text: "", isCorrect: false });

const defaultQuestion = (): QuestionItem => ({
  question: "",
  type: QuestionType.MCQ,
  difficulty: Difficulty.MEDIUM,
  level: Level.SECONDARY,
  subject: Subject.OTHER,
  topic: "",
  tags: [] as string[],
  imageUrl: null,
  options: [defaultOption(), defaultOption(), defaultOption(), defaultOption()],
  answer: "",
});

// ─── Difficulty color map ──────────────────────────────────────────────────────

const difficultyColor: Record<Difficulty, string> = {
  [Difficulty.EASY]: "bg-emerald-100 text-emerald-700 border-emerald-200",
  [Difficulty.MEDIUM]: "bg-amber-100 text-amber-700 border-amber-200",
  [Difficulty.HARD]: "bg-rose-100 text-rose-700 border-rose-200",
};

// ─── Single Question Card ──────────────────────────────────────────────────────

function QuestionCard({
  index,
  control,
  register,
  errors,
  watchedQuestion,
  onRemove,
  onDuplicate,
  totalCount,
}: {
  index: number;
  control: any;
  register: any;
  errors: any;
  watchedQuestion: QuestionItem;
  onRemove: () => void;
  onDuplicate: () => void;
  totalCount: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const { fields: optionFields, append: appendOption, remove: removeOption } =
    useFieldArray({ control, name: `questions.${index}.options` });

  const qErrors = errors?.questions?.[index];
  const questionType = watchedQuestion?.type ?? QuestionType.MCQ;
  const isMCQ = questionType === QuestionType.MCQ;
  const isTrueFalse = questionType === QuestionType.TRUE_FALSE;
  const isShortOrLong =
    questionType === QuestionType.SHORT_ANSWER ||
    questionType === QuestionType.LONG_ANSWER;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !(watchedQuestion?.tags ?? []).includes(val)) {
        const current = watchedQuestion?.tags ?? [];
        control._formValues.questions[index].tags = [...current, val];
        control._subjects?.next?.({});
      }
      setTagInput("");
    }
  };

  return (
    <Card
      className={cn(
        "relative border-l-4 transition-all duration-200 shadow-sm hover:shadow-md",
        collapsed ? "border-l-muted-foreground/30" : "border-l-primary"
      )}
    >
      {/* Card Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer select-none"
        onClick={() => setCollapsed((v) => !v)}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Q{index + 1}
            </span>
            <Badge variant="outline" className="text-xs">
              {formatQuestionType(watchedQuestion?.type ?? QuestionType.MCQ)}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-xs border",
                difficultyColor[watchedQuestion?.difficulty ?? Difficulty.MEDIUM]
              )}
            >
              {formatDifficulty(watchedQuestion?.difficulty ?? Difficulty.MEDIUM)}
            </Badge>
            {watchedQuestion?.subject && watchedQuestion.subject !== Subject.OTHER && (
              <Badge variant="secondary" className="text-xs">
                {formatSubject(watchedQuestion.subject)}
              </Badge>
            )}
          </div>
          {collapsed && watchedQuestion?.question && (
            <p className="text-sm text-foreground mt-1 truncate font-medium">
              {watchedQuestion.question}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDuplicate}
            title="Duplicate question"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
            disabled={totalCount <= 1}
            title="Remove question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Card Body */}
      {!collapsed && (
        <div className="px-4 pb-5 space-y-5 border-t pt-4">
          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Question <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Enter your question here..."
              rows={3}
              className={cn(qErrors?.question && "border-destructive")}
              {...register(`questions.${index}.question`)}
            />
            {qErrors?.question?.message && (
              <p className="text-xs text-destructive">{String(qErrors.question.message)}</p>
            )}
          </div>

          {/* Type / Difficulty / Subject / Topic */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Type
              </label>
              <Controller
                control={control}
                name={`questions.${index}.type`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(QuestionType).map((t) => (
                        <SelectItem key={t} value={t} className="text-sm">
                          {formatQuestionType(t)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Difficulty
              </label>
              <Controller
                control={control}
                name={`questions.${index}.difficulty`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Difficulty).map((d) => (
                        <SelectItem key={d} value={d} className="text-sm">
                          {formatDifficulty(d)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Subject
              </label>
              <Controller
                control={control}
                name={`questions.${index}.subject`}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Subject).map((s) => (
                        <SelectItem key={s} value={s} className="text-sm">
                          {formatSubject(s)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Topic */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Topic
              </label>
              <Input
                placeholder="e.g. Algebra"
                className="h-8 text-sm"
                {...register(`questions.${index}.topic`)}
              />
            </div>
          </div>

          {/* Options — MCQ */}
          {isMCQ && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Options <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground -mt-1">
                Toggle the circle to mark the correct answer(s).
              </p>
              <div className="space-y-2">
                {optionFields.map((field, optIdx) => (
                  <Controller
                    key={field.id}
                    control={control}
                    name={`questions.${index}.options.${optIdx}`}
                    render={({ field: optField }) => (
                      <div className="flex items-center gap-2 group">
                        {/* Correct toggle */}
                        <button
                          type="button"
                          onClick={() =>
                            optField.onChange({ ...optField.value, isCorrect: !optField.value.isCorrect })
                          }
                          className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
                          title="Mark as correct"
                        >
                          {optField.value.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>

                        <Input
                          placeholder={`Option ${optIdx + 1}`}
                          className={cn(
                            "flex-1 h-9 text-sm transition-colors",
                            optField.value.isCorrect &&
                              "border-primary/50 bg-primary/5 focus-visible:ring-primary/30"
                          )}
                          value={optField.value.text}
                          onChange={(e) =>
                            optField.onChange({ ...optField.value, text: e.target.value })
                          }
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                          onClick={() => removeOption(optIdx)}
                          disabled={optionFields.length <= 2}
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs mt-1"
                onClick={() => appendOption(defaultOption())}
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Option
              </Button>
              {qErrors?.options?.message && (
                <p className="text-xs text-destructive">{String(qErrors.options.message)}</p>
              )}
            </div>
          )}

          {/* Options — True / False */}
          {isTrueFalse && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Correct Answer</label>
              <Controller
                control={control}
                name={`questions.${index}.options`}
                render={({ field }) => {
                  const val: OptionItem[] =
                    field.value?.length === 2
                      ? field.value
                      : [
                          { text: "True", isCorrect: false },
                          { text: "False", isCorrect: false },
                        ];
                  const toggle = (i: number) => {
                    const updated = val.map((o, idx) => ({
                      ...o,
                      isCorrect: idx === i,
                    }));
                    field.onChange(updated);
                  };
                  return (
                    <div className="flex gap-3">
                      {["True", "False"].map((label, i) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => toggle(i)}
                          className={cn(
                            "flex-1 h-10 rounded-md border text-sm font-medium transition-all",
                            val[i]?.isCorrect
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:border-primary/40"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  );
                }}
              />
            </div>
          )}

          {/* Answer — Short / Long */}
          {isShortOrLong && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expected Answer</label>
              {questionType === QuestionType.SHORT_ANSWER ? (
                <Input
                  placeholder="Enter the expected answer..."
                  {...register(`questions.${index}.answer`)}
                />
              ) : (
                <Textarea
                  placeholder="Enter the expected answer..."
                  rows={3}
                  {...register(`questions.${index}.answer`)}
                />
              )}
            </div>
          )}

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-3 h-3" /> Tags
            </label>
            <Controller
              control={control}
              name={`questions.${index}.tags`}
              render={({ field }) => (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {(field.value ?? []).map((tag: string, ti: number) => (
                      <span
                        key={ti}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() =>
                            field.onChange(field.value.filter((_: string, i: number) => i !== ti))
                          }
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Input
                    placeholder="Type a tag and press Enter..."
                    className="h-8 text-sm"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        const val = tagInput.trim();
                        if (val && !(field.value ?? []).includes(val)) {
                          field.onChange([...(field.value ?? []), val]);
                        }
                        setTagInput("");
                      }
                    }}
                  />
                </div>
              )}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CreateQuestionPage() {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("manual");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [uploadedDocumentName, setUploadedDocumentName] = useState<string | null>(
    null
  );
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateQuestionRequestSchema),
    defaultValues: {
      questions: [defaultQuestion()],
      public: true,
    },
  });

  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: "questions",
  });

  const watchedQuestions = watch("questions");
  const isPublic = watch("public");

  const handleDuplicate = useCallback(
    (index: number) => {
      const q = watchedQuestions[index];
      insert(index + 1, { ...q });
    },
    [watchedQuestions, insert]
  );

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true);
      const response = await QuestionsAPI.createQuestion({
        ...data,
        public: data.public ?? true,
      });

      if (response.success) {
        toast.success("Questions created!", {
          description: `${data.questions.length} question${data.questions.length > 1 ? "s" : ""} added to your bank.`,
        });
        reset();
      } else {
        toast.error("Error", {
          description: response.message || "Failed to create questions",
        });
      }
    } catch {
      toast.error("Error", { description: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Questions</h1>
            <p className="text-muted-foreground mt-1">
              Build your question bank — add as many questions as you need.
            </p>
          </div>
          <div className="flex items-center gap-2 pt-1 shrink-0">
            <span className="text-sm text-muted-foreground">Public</span>
            <Controller
              control={control}
              name="public"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="ai">AI Extract</TabsTrigger>
          </TabsList>

          {/* ── Manual Entry Tab ── */}
          <TabsContent value="manual" className="mt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Question Cards */}
              {fields.map((field, index) => (
                <QuestionCard
                  key={field.id}
                  index={index}
                  control={control}
                  register={register}
                  errors={errors}
                  watchedQuestion={watchedQuestions?.[index]}
                  onRemove={() => remove(index)}
                  onDuplicate={() => handleDuplicate(index)}
                  totalCount={fields.length}
                />
              ))}

              {/* Add Question Button */}
              <button
                type="button"
                onClick={() => append(defaultQuestion())}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all duration-200 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>

              <Separator />

              {/* Footer Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{fields.length}</span>
                  question{fields.length !== 1 ? "s" : ""}
                  {isPublic ? (
                    <Badge variant="secondary" className="text-xs ml-1">Public</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs ml-1">Private</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                    }}
                    disabled={loading}
                  >
                    Clear All
                  </Button>
                  <Button type="submit" disabled={loading} className="min-w-32">
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Save {fields.length > 1 ? `${fields.length} Questions` : "Question"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          {/* ── Upload Tab ── */}
          <TabsContent value="upload" className="mt-6">
            <Card className="p-10 border-2 border-dashed">
              <div className="text-center space-y-4">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="font-medium" >Upload a document</p>
                  <p className="text-sm text-muted-foreground">
                    PDF, Word, or text files containing questions
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.currentTarget.value = "";
                    if (!file) return;

                    try {
                      setDocumentUploading(true);
                      setUploadedDocumentName(file.name);
                      setUploadedDocumentId(null);

                      const response = await UploadAPI.uploadDocument(file);

                      if (!response.success || !response.data) {
                        toast.error("Upload failed", {
                          description:
                            response.message || "Unable to upload document",
                        });
                        return;
                      }

                      setUploadedDocumentId(response.data.id);
                      toast.success("Document uploaded", {
                        description: "Your document is ready for extraction.",
                      });
                    } catch (err) {
                      toast.error("Upload failed", {
                        description:
                          err instanceof Error
                            ? err.message
                            : "An unexpected error occurred",
                      });
                    } finally {
                      setDocumentUploading(false);
                    }
                  }}
                />

                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="outline"
                    disabled={documentUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {documentUploading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      "Choose File"
                    )}
                  </Button>

                  {uploadedDocumentName && (
                    <p className="text-xs text-muted-foreground">
                      Selected: {uploadedDocumentName}
                      {uploadedDocumentId ? " (uploaded)" : ""}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── AI Extract Tab ── */}
          <TabsContent value="ai" className="mt-6">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <p className="text-muted-foreground">
                Upload a document and let AI automatically extract and structure questions from it.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}