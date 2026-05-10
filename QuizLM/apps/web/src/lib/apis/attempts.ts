import { apiClient } from "./client";
import { APIResponse, SubmitAnswerRequest, SubmitAttemptRequest, TestAttempt } from "@repo/shared/types";

export const AttemptsAPI = {
    /**
     * Start a new test attempt
     */
    async startAttempt(testId: string): Promise<APIResponse<string>> {
        return apiClient.post(`/tests/${testId}/start`);
    },

    /**
     * Get current attempt details
     */
    async getAttempt(attemptId: string): Promise<APIResponse<TestAttempt>> {
        return apiClient.get(`/tests/attempts/${attemptId}`);
    },

    /**
     * Get attempt by test ID (current user)
     */
    async getAttemptsByTestId(testId: string): Promise<APIResponse<TestAttempt[]>> {
        return apiClient.get(`/tests/${testId}/attempts`);
    },

    /**
     * Submit an answer for a question
     */
    async submitAnswer(data: SubmitAnswerRequest): Promise<APIResponse> {
        return apiClient.post(`/tests/attempts/${data.attemptId}/answer`, data);
    },

    /**
     * Finish/submit the test attempt
     */
    async finishAttempt(data: SubmitAttemptRequest): Promise<APIResponse> {
        return apiClient.post(`/tests/attempts/${data.attemptId}/submit`, data);
    },

    /**
     * Get user's attempt history
     */
    async getAttemptHistory(filters: {
        page?: number;
        limit?: number;
        testId?: string;
    } = {}): Promise<APIResponse<{
        items: Array<TestAttempt & {
            testTitle: string;
            score: number;
            totalMarks: number;
        }>;
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>> {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.testId) params.append("testId", filters.testId);

        const query = params.toString();
        const url = `/attempts/history${query ? `?${query}` : ""}`;

        return apiClient.get(url);
    },

    /**
     * Get attempt analytics
     */
    //   async getAttemptAnalytics(attemptId: string): Promise<APIResponse<{
    //     score: number;
    //     totalMarks: number;
    //     percentage: number;
    //     timeTaken: number; // in seconds
    //     questionsAttempted: number;
    //     questionsCorrect: number;
    //     categoryWisePerformance: Array<{
    //       category: string;
    //       score: number;
    //       total: number;
    //     }>;
    //   }>> {
    //     return apiClient.get(`/tests/attempts/${attemptId}/analytics`);
    //   },
};
