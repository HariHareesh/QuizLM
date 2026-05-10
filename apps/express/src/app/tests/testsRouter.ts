import { AuthError, InvalidInputError, NotFoundError } from "@/lib/errors";
import { authenticate } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { handleError, makeResponse, sendResponse } from "@/lib/utils";
import type { Difficulty, Level, Prisma, Subject, TestAttempt } from "@repo/db";
import { CreateTestRequestSchema, type CreateTestRequest, type MiniTestMeta, type TestMeta } from "@repo/shared/types";
import { Router, type Request, type Response } from "express";
import { attemptsRouter } from "./attempts/attemptsRouter";

const router = Router();

// Define your tests-related routes here

export { router as testsRouter };

router.post('/create', authenticate, CreateTestControlller);
router.get('/:id', GetTestByIdController);
router.post('/:id', authenticate, EditTestController);
router.get('/:id/attempts', authenticate, getTestAttemptsController);
router.get('/', ListTestsController);
router.use('/attempts', authenticate, attemptsRouter);
router.post('/:id/start', authenticate, StartTestController);

async function getTestAttemptsController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string') throw new InvalidInputError("Invalid test ID");
        const attempts = await prisma.testAttempt.findMany({
            where: { testId: id }
        });
        return sendResponse(res, makeResponse(true, 200, "Attempts fetched successfully", attempts as TestAttempt[]));
    } catch (error) {
        handleError(res, error);
    }
}

async function StartTestController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string") {
            throw new InvalidInputError("Invalid test ID");
        }
        const attempt = await prisma.testAttempt.create({
            data: {
                test: { connect: { id } },
                user: { connect: { clerkUserId: req.userId! } },
            }
        });
        return sendResponse(res, makeResponse(true, 200, "Test attempt started successfully", attempt.id ));
    } catch (error) {
        handleError(res, error);
    }
}

async function CreateTestControlller(req: Request, res: Response) {
    try {
        const data = CreateTestRequestSchema.parse(req.body);
        const authorId = req.userId;
        const totalScore = data.questions.reduce((acc, q) => acc + q.maxScore, 0);
        const newTest = await prisma.test.create({
            data: {
                ...data,
                testQuestions: {
                    createMany: {
                        data: data.questions.map((q) => ({
                            questionMetaId: q.id,
                            maxScore: q.maxScore,
                            order: q.order,
                        }))
                    }
                },
                maxScore: totalScore,
                author: { connect: { clerkUserId: authorId } },
            }
        });
        return sendResponse(res, makeResponse(true, 201, "Test created successfully", newTest));
    } catch (error) {
        handleError(res, error);
    }
}

async function GetTestByIdController(req: Request, res: Response) {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string') throw new InvalidInputError("Invalid test ID");
        const test = await prisma.test.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                description: true,
                duration: true,
                testQuestions: {
                    select: {
                        id: true,
                        maxScore: true,
                        order: true,
                        questionMeta: {
                            select: {
                                question: true,
                                subject: true,
                                topic: true,
                                type: true,
                                level: true,
                                difficulty: true,
                                imgUrl: true,
                                options: {
                                    select: {
                                        id: true,
                                        option: true,
                                        imgUrl: true,
                                    }
                                }
                            }
                        }
                    }
                },
                author: {
                    select: {
                        name: true,
                        email: true,
                    }
                },
                updatedAt: true,
                isPublic: true,
                createdAt: true,
            }
        });
        if (!test) throw new NotFoundError("Test not found");
        const avg_scoore = await prisma.testAttempt.aggregate({
            where: { testId: id },
            _avg: {
                totalScore: true,
            },
            _count: true
        });
        const response: TestMeta = {
            id: test.id,
            title: test.title,
            description: test.description || undefined,
            subjects: Array.from(new Set(test.testQuestions.map(q => q.questionMeta.subject))),
            difficulty: avgDifficulty(test.testQuestions.map(q => ({ questionMeta: { difficulty: q.questionMeta.difficulty } }))),
            level: maxLevel(test.testQuestions.map(q => ({ questionMeta: { level: q.questionMeta.level } }))),
            public: test.isPublic,
            duration: test.duration ?? undefined,
            questions: test.testQuestions.map(q => ({
                id: q.id,
                maxScore: q.maxScore,
                order: q.order,
                question: q.questionMeta.question,
                subject: q.questionMeta.subject,
                topic: q.questionMeta.topic,
                type: q.questionMeta.type,
                difficulty: q.questionMeta.difficulty,
                level: q.questionMeta.level,
                imageUrl: q.questionMeta.imgUrl || undefined,
                options: q.questionMeta.options.map(o => ({
                    id: o.id,
                    text: o.option,
                    imageUrl: o.imgUrl || undefined,
                }))
            })),
            createdAt: test.createdAt,
            attemptCount: avg_scoore._count,
            averageScore: avg_scoore._avg.totalScore || undefined,
            updatedAt: test.updatedAt,
        }
        return sendResponse(res, makeResponse(true, 200, "Test fetched successfully", response));
    } catch (error) {
        handleError(res, error);
    }

}

async function ListTestsController(req: Request, res: Response) {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

        const difficulty = req.query.difficulty as Difficulty | undefined;
        const subject = req.query.subject as Subject | undefined;
        const isPublic =
            req.query.public !== undefined
                ? req.query.public === "true"
                : undefined;

        const skip = (page - 1) * limit;

        const where: Prisma.TestWhereInput = {
            ...(isPublic !== undefined && { isPublic }),
            ...(subject && {
                testQuestions: {
                    some: {
                        questionMeta: {
                            subject,
                        },
                    },
                },
            }),
        };

        const [tests, total] = await Promise.all([
            prisma.test.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    isPublic: true,
                    createdAt: true,
                    updatedAt: true,

                    testQuestions: {
                        select: {
                            questionMeta: {
                                select: {
                                    difficulty: true,
                                    subject: true,
                                    level: true,
                                },
                            },
                        },
                    },

                    _count: {
                        select: {
                            testQuestions: true,
                            attempts: true,
                        },
                    },

                    attempts: {
                        select: {
                            totalScore: true,
                        },
                    },
                },
            }),

            prisma.test.count({
                where,
            }),
        ]);

        let filteredTests = tests;

        // difficulty filter computed from avg question difficulty
        if (difficulty) {
            filteredTests = tests.filter((test) => {
                const avgDiff = avgDifficulty(test.testQuestions);
                return avgDiff === difficulty;
            });
        }

        const items: MiniTestMeta[] = filteredTests.map((test) => {
            const avgScore =
                test.attempts.length > 0
                    ? test.attempts.reduce(
                        (acc, a) => acc + (a.totalScore || 0),
                        0
                    ) / test.attempts.length
                    : undefined;

            return {
                id: test.id,
                title: test.title,
                description: test.description || undefined,

                subjects: Array.from(
                    new Set(
                        test.testQuestions.map(
                            (q) => q.questionMeta.subject
                        )
                    )
                ),

                difficulty: avgDifficulty(test.testQuestions),

                level: maxLevel(test.testQuestions),

                public: test.isPublic,

                questionCount: test._count.testQuestions,

                attemptCount: test._count.attempts,

                averageScore: avgScore,

                createdAt: test.createdAt,
                updatedAt: test.updatedAt,
            };
        });

        const pages = Math.ceil(total / limit);

        return sendResponse(
            res,
            makeResponse(true, 200, "Tests fetched successfully", {
                items,
                pagination: {
                    page,
                    limit,
                    offset: skip,
                    total,
                    pages,
                },
            })
        );
    } catch (error) {
        handleError(res, error);
    }
}

async function EditTestController(req: Request, res: Response) {
    try {
        const { id } = req.params;

        if (!id || typeof id !== "string") {
            throw new InvalidInputError("Invalid test ID");
        }

        const authorId = req.userId;

        const existingTest = await prisma.test.findUnique({
            where: { id },
            select: {
                id: true,
                author: {
                    select: {
                        clerkUserId: true,
                    },
                },
            },
        });

        if (!existingTest) {
            throw new NotFoundError("Test not found");
        }

        if (existingTest.author.clerkUserId !== authorId) {
            throw new AuthError("You are not allowed to edit this test");
        }

        const data = req.body as Partial<CreateTestRequest>;

        const updatedTest = await prisma.$transaction(async (tx) => {
            // update base fields
            await tx.test.update({
                where: { id },
                data: {
                    ...(data.title !== undefined && {
                        title: data.title,
                    }),

                    ...(data.description !== undefined && {
                        description: data.description,
                    }),

                    ...(data.public !== undefined && {
                        isPublic: data.public,
                    }),
                },
            });

            // replace questions if provided
            if (data.questions) {
                // remove old relations
                await tx.testQuestion.deleteMany({
                    where: {
                        testId: id,
                    },
                });

                // create new relations
                await tx.testQuestion.createMany({
                    data: data.questions.map((q) => ({
                        testId: id,
                        questionMetaId: q.id,
                        maxScore: q.maxScore,
                        order: q.order,
                    })),
                });
            }
        });
        return sendResponse(
            res,
            makeResponse(true, 200, "Test updated successfully")
        );
    } catch (error) {
        handleError(res, error);
    }
}

function getDefficultyScore(diff: Difficulty) {
    switch (diff) {
        case "EASY": return 1;
        case "MEDIUM": return 2;
        case "HARD": return 3;
    }
}
function avgDifficulty(questions: { questionMeta: { difficulty: Difficulty } }[]): Difficulty {
    const totalScore = questions.reduce((acc, q) => acc + getDefficultyScore(q.questionMeta.difficulty), 0);
    const avg = Math.round(totalScore / questions.length);
    switch (avg) {
        case 1: return "EASY";
        case 2: return "MEDIUM";
        case 3: return "HARD";
        default: return "MEDIUM";
    }
}

function maxLevel(questions: { questionMeta: { level: Level } }[]): Level {
    const indexed: Level[] = ['PRIMARY', 'SECONDARY', 'SENIOR_SECONDARY', 'UNDERGRADUATE', 'POSTGRADUATE', 'PROFESSIONAL'];
    let maxIndex = 0;
    for (const q of questions) {
        const idx = indexed.indexOf(q.questionMeta.level);
        if (idx > maxIndex) maxIndex = idx;
    }
    return indexed[maxIndex]!;
}