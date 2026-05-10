import { apiClient } from "./client";
import { APIResponse, Analytics, DashboardData } from "@repo/shared/types";

export const AnalyticsAPI = {
  /**
   * Get user dashboard analytics
   */
  async getDashboardAnalytics(): Promise<APIResponse<DashboardData>> {
    return apiClient.get("/analytics/dashboard");
  },

  /**
   * Get comprehensive analytics
   */
  async getAnalytics(): Promise<APIResponse<Analytics>> {
    return apiClient.get("/analytics");
  },

  /**
   * Get topic-wise performance
   */
  async getTopicPerformance(): Promise<APIResponse<Array<{
    topic: string;
    attempts: number;
    averageScore: number;
    strongPoints: string[];
    weakPoints: string[];
  }>>> {
    return apiClient.get("/analytics/topics");
  },

  /**
   * Get difficulty-wise breakdown
   */
  async getDifficultyBreakdown(): Promise<APIResponse<Array<{
    difficulty: string;
    attempts: number;
    correct: number;
    accuracy: number;
  }>>> {
    return apiClient.get("/analytics/difficulty");
  },

  /**
   * Get score trends over time
   */
  async getScoreTrends(days: number = 30): Promise<APIResponse<Array<{
    date: string;
    averageScore: number;
    testCount: number;
  }>>> {
    return apiClient.get(`/analytics/trends?days=${days}`);
  },

  /**
   * Get personalized recommendations
   */
  async getRecommendations(): Promise<APIResponse<Array<{
    type: "weak_area" | "improvement" | "strength";
    title: string;
    description: string;
    actionableItems: string[];
  }>>> {
    return apiClient.get("/analytics/recommendations");
  },
};
