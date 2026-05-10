import { ImpossibleTaskError, InvalidInputError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { handleError, makeResponse, sendResponse } from "@/lib/utils";
import type { TestAttempt } from "@repo/db";
import { SubmitAnswerRequestSchema, SubmitAttemptRequestSchema } from "@repo/shared/types";
import { Router, type Request, type Response } from "express";

const router = Router();
export { router as attemptsRouter };

router.get('/:id', GetAttemptById);
router.post("/:id/answer", AnswerQuestion);
router.post("/:id/pause", PauseTest);
router.post("/:id/resume", ResumeAttempt);
router.post("/:id/submit", SubmitAttempt);
// router.get("/:id/analytics", asd);

async function GetAttemptById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string") throw new InvalidInputError("Invalid attempt ID");

        const attempt: TestAttempt | null = await prisma.testAttempt.findUnique({
            where: { id },
        });
        if (!attempt) throw new NotFoundError("Attempt not found");
        return sendResponse(res, makeResponse(true, 200, "Attempt fetched successfully", attempt));
    } catch (error) {
        handleError(res, error);
    }
}

async function AnswerQuestion(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const data = SubmitAnswerRequestSchema.parse(req.body);
        if (!id || typeof id !== "string") {
            throw new InvalidInputError("Invalid attempt ID");
        }
        const attempt = await prisma.testAttempt.findUnique({
            where: { id },
            select: { id: true, state: true, lastSeenAt: true, test: { select: { testQuestions: { select: { id: true } } } } }
        });
        if (!attempt) throw new NotFoundError("Attempt not found");
        if (attempt.state !== 'IN_PROGRESS') throw new ImpossibleTaskError("Cannot answer question for paused/completed attempt");
        if (!attempt.test.testQuestions.some(q => q.id === data.questionId)) throw new NotFoundError("Question not found in this test attempt");
        const timeChange = (new Date().getTime() - new Date(attempt.lastSeenAt).getTime()) / 1000; // in seconds
        await prisma.testAttempt.update({
            where: { id },
            data: {
                lastSeenAt: new Date(),
                timeTaken: { increment: timeChange },
                answers: {
                    upsert: {
                        where: {
                            attemptId_testQuestionId: {
                                attemptId: id,
                                testQuestionId: data.questionId
                            }
                        },
                        update: {
                            textAnswer: data.answer || undefined,
                            selectedOptions: {
                                set: data.options.map(id => ({ id }))
                            }
                        },
                        create: {
                            textAnswer: data.answer || undefined,
                            selectedOptions: {
                                connect: data.options.map(id => ({ id }))
                            },
                            testQuestion: { connect: { id: data.questionId } },
                        }
                    }
                }
            }
        })
    } catch (error) {
        handleError(res, error);
    }
}

async function PauseTest(req: Request, res: Response) {
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string") {
            throw new InvalidInputError("Invalid attempt ID");
        }
        const attempt = await prisma.testAttempt.findUnique({
            where: { id },
            select: {
                lastSeenAt: true,
                state: true
            }
        });
        if (!attempt) throw new NotFoundError("Attempt not found");
        if (attempt.state !== 'IN_PROGRESS') throw new ImpossibleTaskError("Only in-progress attempts can be paused");
        await prisma.testAttempt.update({
            where: { id },
            data: {
                state: 'PAUSED',
                lastSeenAt: new Date()
            }
        });
        return sendResponse(res, makeResponse(true, 200, "Test attempt paused successfully", attempt));
    } catch (error) {
        handleError(res, error);
    }
}

async function ResumeAttempt(req: Request, res: Response) {
    try {
        const { id } = req.params;
        if (!id || typeof id !== "string") {
            throw new InvalidInputError("Invalid attempt ID");
        }
        const attempt = await prisma.testAttempt.findUnique({
            where: { id },
            select: {
                lastSeenAt: true,
                state: true
            }
        });
        if (!attempt) throw new NotFoundError("Attempt not found");
        if (attempt.state !== 'PAUSED') throw new ImpossibleTaskError("Only paused attempts can be resumed");
        await prisma.testAttempt.update({
            where: { id },
            data: {
                state: 'IN_PROGRESS',
                lastSeenAt: new Date()
            }
        });
        return sendResponse(res, makeResponse(true, 200, "Test attempt resumed successfully", attempt));
    } catch (error) {
        handleError(res, error);
    }
}

async function SubmitAttempt(req: Request, res: Response) {
    try {
        const data = SubmitAttemptRequestSchema.parse(req.body);
        const attempt = await prisma.testAttempt.findUnique({
            where: { id: data.attemptId },
            select: {
                id: true,
                state: true,
                lastSeenAt: true,
            }
        });
        if (!attempt) throw new NotFoundError("Attempt not found");
        if (attempt.state !== 'IN_PROGRESS') throw new ImpossibleTaskError("Only in-progress attempts can be submitted");
        const timeChange = (new Date().getTime() - new Date(attempt.lastSeenAt).getTime()) / 1000; // in seconds
        const updatedAttempt = await prisma.testAttempt.update({
            where: { id: data.attemptId },
            data: {
                state: 'SUBMITTED',
                lastSeenAt: new Date(),
                timeTaken: { increment: timeChange },
                answers: {
                    upsert: data.answers.map(ans => ({
                        where: {
                            attemptId_testQuestionId: {
                                attemptId: data.attemptId,
                                testQuestionId: ans.questionId
                            }
                        },
                        update: {
                            textAnswer: ans.answer || undefined,
                            selectedOptions: {
                                set: ans.options.map(id => ({ id }))
                            }
                        },
                        create: {
                            textAnswer: ans.answer || undefined,
                            selectedOptions: {
                                connect: ans.options.map(id => ({ id }))
                            },
                            testQuestion: { connect: { id: ans.questionId } },
                        }
                    }))
                }
            },
        });
        await calculateScore(data.attemptId);
        return sendResponse(res, makeResponse(true, 200, "Test attempt submitted successfully"));
    } catch (error) {
        handleError(res, error);
    }
}

async function calculateScore(attemptId: string) {
    const result = await prisma.$queryRawUnsafe(`
WITH subjective_scores AS (
    SELECT
        aa.id AS "attemptAnswerId",
        tq."maxScore",
        qm.type,

        CASE
            WHEN qm.type IN ('SHORT_ANSWER', 'LONG_ANSWER') THEN
                1 - (
                    aa."answerEmbedding" <=> qm."answerEmbedding"
                )
            ELSE NULL
        END AS similarity_score

    FROM "AttemptAnswer" aa
    JOIN "TestQuestion" tq
        ON tq.id = aa."testQuestionId"
    JOIN "QuestionMeta" qm
        ON qm.id = tq."questionMetaId"

    WHERE aa."attemptId" = $1
),

mcq_scores AS (
    SELECT
        aa.id AS "attemptAnswerId",
        tq."maxScore",
        qm.type,

        CASE
            WHEN qm.type IN ('MCQ', 'TRUE_FALSE') THEN
                CASE
                    WHEN NOT EXISTS (
                        SELECT 1
                        FROM "Option" o
                        WHERE o."questionMetaId" = qm.id
                        AND o."isCorrect" = true
                        AND o.id NOT IN (
                            SELECT "_AttemptAnswerToOption"."B"
                            FROM "_AttemptAnswerToOption"
                            WHERE "_AttemptAnswerToOption"."A" = aa.id
                        )
                    )
                    AND NOT EXISTS (
                        SELECT 1
                        FROM "_AttemptAnswerToOption" aao
                        JOIN "Option" o ON o.id = aao."B"
                        WHERE aao."A" = aa.id
                        AND o."isCorrect" = false
                    )
                    THEN tq."maxScore"
                    ELSE 0
                END
        END AS score

    FROM "AttemptAnswer" aa
    JOIN "TestQuestion" tq
        ON tq.id = aa."testQuestionId"
    JOIN "QuestionMeta" qm
        ON qm.id = tq."questionMetaId"

    WHERE aa."attemptId" = $1
),

multi_scores AS (
    SELECT
        aa.id AS "attemptAnswerId",
        tq."maxScore",

        (
            (
                SELECT COUNT(*)
                FROM "_AttemptAnswerToOption" aao
                JOIN "Option" o
                    ON o.id = aao."B"
                WHERE aao."A" = aa.id
                AND o."isCorrect" = true
            )::float
            /
            NULLIF(
                (
                    SELECT COUNT(*)
                    FROM "Option" o
                    WHERE o."questionMetaId" = qm.id
                    AND o."isCorrect" = true
                ),
                0
            )
        ) * tq."maxScore" AS score

    FROM "AttemptAnswer" aa
    JOIN "TestQuestion" tq
        ON tq.id = aa."testQuestionId"
    JOIN "QuestionMeta" qm
        ON qm.id = tq."questionMetaId"

    WHERE aa."attemptId" = $1
    AND qm.type = 'MULTI_MCQ'
),

final_scores AS (
    SELECT
        aa.id,

        CASE
            WHEN qm.type IN ('MCQ', 'TRUE_FALSE')
                THEN COALESCE(ms.score, 0)

            WHEN qm.type = 'MULTI_MCQ'
                THEN COALESCE(mus.score, 0)

            WHEN qm.type IN ('SHORT_ANSWER', 'LONG_ANSWER')
                THEN
                    CASE
                        WHEN ss.similarity_score >= 0.95
                            THEN tq."maxScore"

                        WHEN ss.similarity_score <= 0.20
                            THEN 0

                        ELSE ss.similarity_score * tq."maxScore"
                    END

            ELSE 0
        END AS final_score,

        tq."maxScore"

    FROM "AttemptAnswer" aa
    JOIN "TestQuestion" tq
        ON tq.id = aa."testQuestionId"
    JOIN "QuestionMeta" qm
        ON qm.id = tq."questionMetaId"

    LEFT JOIN subjective_scores ss
        ON ss."attemptAnswerId" = aa.id

    LEFT JOIN mcq_scores ms
        ON ms."attemptAnswerId" = aa.id

    LEFT JOIN multi_scores mus
        ON mus."attemptAnswerId" = aa.id

    WHERE aa."attemptId" = $1
)

UPDATE "AttemptAnswer" aa
SET
    score = fs.final_score,
    "isCorrect" = fs.final_score >= (fs."maxScore" * 0.95)
FROM final_scores fs
WHERE aa.id = fs.id;

UPDATE "TestAttempt"
SET score = (
    SELECT COALESCE(SUM(score), 0)
    FROM "AttemptAnswer"
    WHERE "attemptId" = $1
)
WHERE id = $1;

SELECT *
FROM "TestAttempt"
WHERE id = $1;
`, attemptId);
}