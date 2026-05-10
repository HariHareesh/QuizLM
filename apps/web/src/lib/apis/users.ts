import { apiClient } from "./client";
import { APIResponse, User } from "@repo/shared/types";

export const UsersAPI = {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<APIResponse<User>> {
    return apiClient.get("/users/me");
  },

  /**
   * Update user profile
   */
  async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  }): Promise<APIResponse<User>> {
    return apiClient.put("/users/me", data);
  },

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<APIResponse<{
    theme: "light" | "dark";
    emailNotifications: boolean;
    language: string;
  }>> {
    return apiClient.get("/users/preferences");
  },

  /**
   * Update user preferences
   */
  async updatePreferences(data: {
    theme?: "light" | "dark";
    emailNotifications?: boolean;
    language?: string;
  }): Promise<APIResponse<void>> {
    return apiClient.put("/users/preferences", data);
  },
};
