import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { APIResponse } from "@repo/shared/types";
import { getClientConfig } from "../utils";

class APIClient {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        });
        // Request interceptor
        this.instance.interceptors.request.use(
            (config) => {
                // Add auth token if available (Clerk)
                if (typeof window !== "undefined") {
                    const token = localStorage.getItem("clerk_token");
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.instance.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                // Handle common errors
                if (error.response?.status === 401) {
                    // Unauthorized - redirect to auth
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("clerk_token");
                        window.location.href = "/auth";
                    }
                }
                return Promise.reject(this.normalizeError(error));
            }
        );
    }

    private normalizeError(error: AxiosError): APIResponse {
        if (error.response?.data) {
            return {
                success: false,
                statusCode: error.response.status,
                message: (error.response.data as any).message,
            };
        }

        return {
            success: false,
            statusCode: error.response?.status || 500,
            message: "An unexpected error occurred",
        };
    }

    async request<T = any>(
        config: any
    ): Promise<APIResponse<T>> {
        try {
            if (this.instance.defaults.baseURL === undefined) {
                const baseURL = getClientConfig().expressUrl;
                this.instance.defaults.baseURL = baseURL;
            }
            const response: AxiosResponse<T> = await this.instance(config);

            const maybeEnvelope: any = response.data;
            if (
                maybeEnvelope &&
                typeof maybeEnvelope === "object" &&
                typeof maybeEnvelope.success === "boolean" &&
                typeof maybeEnvelope.statusCode === "number"
            ) {
                return maybeEnvelope as APIResponse<T>;
            }

            return {
                success: true,
                statusCode: response.status,
                data: response.data as any,
            };
        } catch (error) {
            return this.normalizeError(error as AxiosError);
        }
    }

    async get<T = any>(url: string, config?: any): Promise<APIResponse<T>> {
        return this.request<T>({ method: "GET", url, ...config });
    }

    async post<T = any>(url: string, data?: any, config?: any): Promise<APIResponse<T>> {
        return this.request<T>({ method: "POST", url, data, ...config });
    }

    async put<T = any>(url: string, data?: any, config?: any): Promise<APIResponse<T>> {
        return this.request<T>({ method: "PUT", url, data, ...config });
    }

    async patch<T = any>(url: string, data?: any, config?: any): Promise<APIResponse<T>> {
        return this.request<T>({ method: "PATCH", url, data, ...config });
    }

    async delete<T = any>(url: string, config?: any): Promise<APIResponse<T>> {
        return this.request<T>({ method: "DELETE", url, ...config });
    }
}

export const apiClient = new APIClient();
