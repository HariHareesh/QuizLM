import { apiClient } from "./client";
import {
    APIResponse,
    CreateQuestionRequest,
    ListQuestionsFilter,
    QuestionMeta,
    Pagination,
    InferQuestions,
} from "@repo/shared/types";

export const QuestionsAPI = {
    /**
     * Create a new question
     */
    async createQuestion(
        data: CreateQuestionRequest
    ): Promise<APIResponse<QuestionMeta>> {
        return apiClient.post("/questions", data);
    },

    /**
     * Get a question by ID
     */
    async getQuestionById(id: string): Promise<APIResponse<QuestionMeta>> {
        return apiClient.get(`/questions/${id}`);
    },

    /**
     * List questions with filters, sorting, and pagination
     */
    async getQuestions(
        filters: Partial<ListQuestionsFilter> = {}
    ): Promise<APIResponse<{
        items: QuestionMeta[];
        pagination: Pagination;
    }>> {
        const params = new URLSearchParams();

        if (filters.page) params.append("page", filters.page.toString());
        if (filters.limit) params.append("limit", filters.limit.toString());
        if (filters.search) params.append("search", filters.search);
        if (filters.subject) params.append("subject", filters.subject);
        if (filters.topic) params.append("topic", filters.topic);
        if (filters.difficulty) params.append("difficulty", filters.difficulty);
        if (filters.type) params.append("type", filters.type);
        if (filters.public !== undefined) params.append("public", filters.public.toString());
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

        const query = params.toString();
        const url = `/questions${query ? `?${query}` : ""}`;

        return apiClient.get(url);
    },

    /**
     * Update a question
     */
    //   async updateQuestion(
    //     id: string,
    //     data: Partial<CreateQuestionRequest>
    //   ): Promise<APIResponse<QuestionMeta>> {
    //     return apiClient.put(`/questions/${id}`, data);
    //   },

    /**
     * Delete a question
     */
    //   async deleteQuestion(id: string): Promise<APIResponse<void>> {
    //     return apiClient.delete(`/questions/${id}`);
    //   },

    /**
     * Get question statistics
     */
    async getStatistics(): Promise<APIResponse<{
        total: number;
        bySubject: Record<string, number>;
        byDifficulty: Record<string, number>;
        byType: Record<string, number>;
    }>> {
        return apiClient.get("/questions/statistics");
    },
    async inferQuestions(file: File): Promise<APIResponse<InferQuestions>> {
        if (file.size > 5 * 1024 * 1024) {
            throw new Error("File size must be under 5MB");
        }
        const allowedTypes = [
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
            throw new Error(
                "Only PDF, PNG, JPG, and WEBP files are allowed"
            );
        }
        const formData = new FormData();
        formData.append("file", file);
        return apiClient.post(
            "/questions/infer",
            formData, { headers: { "Content-Type": "multipart/form-data", }, }
        );
    },
};

