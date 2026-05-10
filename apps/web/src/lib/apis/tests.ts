import { apiClient } from "./client";
import {
    APIResponse,
    CreateTestRequest,
    GenerateTestRequest,
    TestMeta,
    Pagination,
    ListTestFilters,
    MiniTestMeta,
} from "@repo/shared/types";

export const TestsAPI = {
    /**
     * Create a new test manually
     */
    async createTest(data: CreateTestRequest): Promise<APIResponse<TestMeta>> {
        return apiClient.post("/tests", data);
    },

    /**
     * Get a test by ID with questions
     */
    async getTestById(id: string): Promise<APIResponse<TestMeta>> {
        return apiClient.get(`/tests/${id}`);
    },

    /**
     * List all tests with pagination
     */
    async getTests(filters: ListTestFilters): Promise<APIResponse<{
        items: MiniTestMeta[];
        pagination: Pagination;
    }>> {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.public !== undefined) params.append("public", filters.public.toString());
        if (filters.difficulty) params.append("difficulty", filters.difficulty);
        if (filters.subject) params.append("subject", filters.subject);

        const query = params.toString();
        const url = `/tests${query ? `?${query}` : ""}`;

        return apiClient.get(url);
    },

    /**
     * Generate a test using AI based on filters
     */
    async generateTest(
        request: GenerateTestRequest
    ): Promise<APIResponse<TestMeta>> {
        return apiClient.post("/tests/generate", request);
    },

    /**
     * Update a test
     */
    async updateTest(id: string, data: Partial<CreateTestRequest>): Promise<APIResponse> {
        return apiClient.post(`/tests/${id}`, data);
    },

    /**
     * Delete a test
     */
    //   async deleteTest(id: string): Promise<APIResponse<void>> {
    //     return apiClient.delete(`/tests/${id}`);
    //   },

    /**
     * Publish a test (make it public)
     */
    async publishTest(id: string): Promise<APIResponse<TestMeta>> {
        return await this.updateTest(id, { public: true });
    },

    /**
     * Unpublish a test (make it private)
     */
    async unpublishTest(id: string): Promise<APIResponse<TestMeta>> {
        return await this.updateTest(id, { public: false });
    },

    /**
     * Get test analytics
     */
    async getTestAnalytics(id: string): Promise<APIResponse<{
        totalAttempts: number;
        averageScore: number;
        highestScore: number;
        lowestScore: number;
        passRate: number;
        questionPerformance: Array<{
            questionId: string;
            correctCount: number;
            incorrectCount: number;
            accuracy: number;
        }>;
    }>> {
        return apiClient.get(`/tests/${id}/analytics`);
    },
};
