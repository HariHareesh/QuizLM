import { apiClient } from "./client";
import { APIResponse, DocumentUploadResponse, QuestionMeta } from "@repo/shared/types";

export const UploadAPI = {
  /**
   * Upload a document for AI extraction
   */
  async uploadDocument(file: File): Promise<APIResponse<DocumentUploadResponse>> {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post("/uploads/document", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Check document processing status
   */
  async getDocumentStatus(
    documentId: string
  ): Promise<APIResponse<DocumentUploadResponse>> {
    return apiClient.get(`/uploads/document/${documentId}`);
  },

  /**
   * Upload an image
   */
  async uploadImage(file: File): Promise<APIResponse<{
    url: string;
    id: string;
  }>> {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.post("/uploads/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Delete an uploaded image
   */
  async deleteImage(imageId: string): Promise<APIResponse<void>> {
    return apiClient.delete(`/uploads/image/${imageId}`);
  },

  /**
   * Get extracted questions from document
   */
  async getExtractedQuestions(
    documentId: string
  ): Promise<APIResponse<QuestionMeta[]>> {
    return apiClient.get(`/uploads/document/${documentId}/questions`);
  },

  /**
   * Save extracted questions
   */
  async saveExtractedQuestions(
    documentId: string,
    questionIds: string[]
  ): Promise<APIResponse<{
    saved: number;
    total: number;
  }>> {
    return apiClient.post(`/uploads/document/${documentId}/save`, {
      questionIds,
    });
  },
};
