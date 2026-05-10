import { AuthError, InvalidInputError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { generateEmbeddings, handleError, makeResponse, sendResponse } from "@/lib/utils";
import { getAuth } from "@clerk/express";
import { GoogleGenAI } from "@google/genai";
import type { Level, Prisma } from "@repo/db";
import { QuestionType, type QuestionMeta } from "@repo/db/browser";
import { getConfig } from "@repo/shared/server";
import { CreateQuestionRequestSchema, InferQuestionsSchema, ListQuestionsFilterSchema, type Pagination } from "@repo/shared/types";
import { aiJsonParse } from "ai-json-safe-parse";
import { Router, type Request, type Response } from "express";
import { fileTypeFromBuffer } from "file-type";
import { readFile } from "fs/promises";

const router = Router();
export { router as questionRouter };

router.post("/", CreateQuestionController);
router.get("/:id", GetQuestionByIdController);

// Define your question-related routes here

async function CreateQuestionController(req: Request, res: Response) {
    async function handleCreateQuestions(req: Request, res: Response) {
        try {
            const data = CreateQuestionRequestSchema.parse(req.body);

            const questionTexts: string[] = [];
            const answerTexts: string[] = [];

            for (const q of data.questions) {
                questionTexts.push(q.question);

                if (q.answer) {
                    answerTexts.push(q.answer);
                }
            }

            const questionEmbeddings = await generateEmbeddings(
                questionTexts,
                "RETRIEVAL_DOCUMENT"
            );
            const answerEmbeddings = answerTexts.length > 0 ? await generateEmbeddings(answerTexts, "SEMANTIC_SIMILARITY") : {};
            let answerIndex = 0;

            const values = data.questions
                .map((q, index) => {
                    const questionEmbedding = questionEmbeddings[q.question]!;

                    let answerEmbedding: number[] | undefined = undefined;

                    if (q.answer) {
                        answerEmbedding = answerEmbeddings[q.answer];
                        answerIndex++;
                    }

                    const escapedQuestion = q.question.replace(/'/g, "''");
                    const escapedTopic = q.topic.replace(/'/g, "''");
                    const escapedAnswer = q.answer
                        ? q.answer.replace(/'/g, "''")
                        : null;

                    const tagsArray =
                        q.tags && q.tags.length > 0
                            ? `ARRAY[${q.tags
                                .map((t) => `'${t.replace(/'/g, "''")}'`)
                                .join(",")}]`
                            : `ARRAY[]::text[]`;

                    return `
                (
                    gen_random_uuid(),
                    '${escapedQuestion}',
                    '${q.type}'::"QuestionType",
                    '${q.subject}'::"Subject",
                    '${escapedTopic}',
                    '${q.level}'::"Level",
                    ${tagsArray},
                    '${q.difficulty}'::"Difficulty",
                    ${escapedAnswer
                            ? `'${escapedAnswer}'`
                            : "NULL"
                        },
                    ${q.imageUrl
                            ? `'${q.imageUrl.replace(/'/g, "''")}'`
                            : "NULL"
                        },
                    ${data.public},
                    '[${questionEmbedding.join(",")}]'::vector,
                    ${answerEmbedding
                            ? `'[${answerEmbedding.join(",")}]'::vector`
                            : "NULL"
                        },
                    NOW(),
                    NOW(),
                    '${req.userId}'
                )
            `;
                })
                .join(",");

            await prisma.$executeRawUnsafe(`
            INSERT INTO "QuestionMeta" (
                "id",
                "question",
                "type",
                "subject",
                "topic",
                "level",
                "tags",
                "difficulty",
                "answer",
                "imgUrl",
                "isPublic",
                "questionEmbedding",
                "answerEmbedding",
                "createdAt",
                "updatedAt",
                "authorId"
            )
            VALUES
            ${values}
        `);

            sendResponse(
                res,
                makeResponse(
                    true,
                    201,
                    "Questions created successfully"
                )
            );
        } catch (error) {
            handleError(res, error);
        }
    }
}

async function GetQuestionByIdController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string") throw new InvalidInputError("Invalid question ID");
        const question = await prisma.questionMeta.findFirst({
            where: {
                id,
                OR: [
                    { isPublic: true },
                    { authorId: req.userId! }
                ]
            }
        });
        if (!question) {
            throw new NotFoundError("Question not found");
        }
        sendResponse(res, makeResponse<QuestionMeta>(true, 200, "Question retrieved successfully", question));
    } catch (error) {
        handleError(res, error);
    }
}

async function ListQuestionsController(req: Request, res: Response) {
    try {
        const filters = ListQuestionsFilterSchema.parse({
            ...req.query,
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            public:
                req.query.public !== undefined
                    ? req.query.public === "true"
                    : undefined,
        });

        const whereClause: Prisma.QuestionMetaWhereInput = {};

        if (filters.subject) {
            whereClause.subject = filters.subject;
        }

        if (filters.topic) {
            whereClause.topic = {
                contains: filters.topic,
                mode: "insensitive",
            };
        }

        if (filters.difficulty) {
            whereClause.difficulty = filters.difficulty;
        }

        if (filters.type) {
            whereClause.type = filters.type;
        }

        if (filters.public !== undefined) {
            whereClause.isPublic = filters.public;
        }

        const skip = (filters.page - 1) * filters.limit;

        let questions: any[] = [];
        let total = 0;

        // semantic search
        if (filters.search) {
            const embeddings = await generateEmbeddings(
                [filters.search],
                "RETRIEVAL_DOCUMENT"
            );

            const queryEmbedding = embeddings[filters.search];

            if (!queryEmbedding) {
                throw new Error("Failed to generate query embedding");
            }
            const conditions: string[] = [];

            if (filters.subject) {
                conditions.push(
                    `"subject" = '${filters.subject}'::"Subject"`
                );
            }

            if (filters.topic) {
                conditions.push(
                    `"topic" ILIKE '%${filters.topic.replace(/'/g, "''")}%'`
                );
            }

            if (filters.difficulty) {
                conditions.push(
                    `"difficulty" = '${filters.difficulty}'::"Difficulty"`
                );
            }

            if (filters.type) {
                conditions.push(
                    `"type" = '${filters.type}'::"QuestionType"`
                );
            }

            if (filters.public !== undefined) {
                conditions.push(
                    `"isPublic" = ${filters.public}`
                );
            }

            const whereSQL =
                conditions.length > 0
                    ? `WHERE ${conditions.join(" AND ")}`
                    : "";

            const sortFieldMap: Record<string, string> = {
                createdAt: `"createdAt"`,
                difficulty: `"difficulty"`,
                topic: `"topic"`,
            };

            const sortField =
                sortFieldMap[filters.sortBy] || `"createdAt"`;

            questions = await prisma.$queryRawUnsafe(`
                SELECT *,
                       1 - ("questionEmbedding" <=> '[${queryEmbedding.join(",")}]'::vector) AS similarity
                FROM "QuestionMeta"
                ${whereSQL}
                ORDER BY similarity DESC,
                         ${sortField} ${filters.sortOrder.toUpperCase()}
                LIMIT ${filters.limit}
                OFFSET ${skip}
            `);

            const countResult = await prisma.$queryRawUnsafe<
                [{ count: bigint }]
            >(`
                SELECT COUNT(*)::bigint as count
                FROM "QuestionMeta"
                ${whereSQL}
            `);

            total = Number(countResult[0]?.count || 0);
        } else {
            // normal filtering
            const [data, count] = await Promise.all([
                prisma.questionMeta.findMany({
                    where: whereClause,
                    skip,
                    take: filters.limit,
                    orderBy: {
                        [filters.sortBy]: filters.sortOrder,
                    },
                    include: {
                        options: true,
                    },
                }),
                prisma.questionMeta.count({
                    where: whereClause,
                }),
            ]);

            questions = data;
            total = count;
        }
        const pagination: Pagination = {
            page: filters.page,
            limit: filters.limit,
            offset: skip,
            total,
            pages: Math.ceil(total / filters.limit),
        };

        sendResponse(
            res,
            makeResponse(
                true,
                200,
                "Questions fetched successfully",
                {
                    questions,
                    pagination,
                }
            )
        );
    } catch (error) {
        handleError(res, error);
    }
}

const prompt = `
Extract all questions from the uploaded document.

Return ONLY valid JSON.

Schema:
[
  {
    "question": "string",

    "type": ${Object.values(QuestionType).map((t) => `"${t}"`).join(" | ")},

    "options": [
      {
        "text": "string",
        "isCorrect": boolean
      }
    ],

    "answer": "string"
  }
]

Rules:
- "mcq" = single correct option
- "multi-mcq" = multiple correct options
- "short" = short written answer
- "long" = descriptive answer
- "true-false" = true/false question

Important:
- Return ONLY JSON
- Do not wrap in markdown
- If no options exist, return []
- If answer is unknown, return null
- Preserve original wording exactly
- Detect correct answers if explicitly present
- Never hallucinate answers
`;

export async function inferQuestionsController(
    req: Request,
    res: Response
) {
    try {
        const files = req.files;

        if (!files || files.length === 0) {
            throw new NotFoundError("No file uploaded");
        }
        const file = files[0]!;
        const buffer = await readFile(file.path);
        const mimeType = (await fileTypeFromBuffer(buffer))?.mime;
        if (!mimeType) throw new InvalidInputError("Unable to detect file type");
        const gemini = new GoogleGenAI({
            apiKey: getConfig().geminiApiKey
        });
        const response = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    text: prompt,
                },
                {
                    inlineData: {
                        mimeType,
                        data: buffer.toString("base64"),
                    },
                },
            ],
        });
        const parsed = InferQuestionsSchema.parse(aiJsonParse(response.text ?? ""));
        return sendResponse(res, makeResponse(true, 200, "Questions inferred successfully", parsed));
    }
    catch (error) {
        handleError(res, error);
    }
}