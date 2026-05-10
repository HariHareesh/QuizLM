import { NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { handleError, makeResponse, sendResponse } from "@/lib/utils";
import type { DashboardData } from "@repo/shared/types";
import { Router, type Request, type Response } from "express";

const router = Router();
export { router as analyticsRouter };

router.get("/dashboard", getDashboard);

async function getDashboard(req: Request, res: Response) {
    try {
        const id = req.userId!;
        const user = await prisma.user.findUnique({
            where: { clerkUserId: id },
            select: {
                _count: {
                    select: {
                        testAttempts: true,
                        tests: true,
                    }
                },
                testAttempts: {
                    select: {
                        id: true,
                        totalScore: true,
                        submittedAt: true,
                        test: {
                            select: {
                                title: true,
                                maxScore: true,
                            }
                        }
                    },
                    take: 5,
                    orderBy: {
                        submittedAt: 'desc'
                    }
                }
            }
        });
        const agg = await prisma.testAttempt.aggregate({
            _avg: {
                totalScore: true,
            },
            _count: {
            }
        })
        if (!user) throw new NotFoundError("User not found");
        const data: DashboardData = {
            totalAttempts: user._count.testAttempts,
            totalTests: user._count.tests,
            averageScore: agg._avg.totalScore ?? 0,
            strongestTopic: "",
            weakestTopic: "",
            recentTests: user.testAttempts.map(at=> ({
                id: at.id,
                title: at.test.title,
                score: at.totalScore,
                totalMarks: at.test.maxScore,
                submittedAt: at.submittedAt?.toISOString() || "N/A",
            })),
        }
        return sendResponse(res, makeResponse(true, 200, "Dashboard analytics fetched successfully", data));
    } catch (error) {
        handleError(res, error);
    }
}