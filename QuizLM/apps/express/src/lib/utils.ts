import type { APIResponse } from "@repo/shared/types";
import type { Response } from "express";
import { ServerError } from "./errors";
import { getConfig, ZodError } from "@repo/shared/server";
import pino from "pino";
import { GoogleGenAI } from "@google/genai";

export async function TryCatch(res: Response, fn: () => Promise<any>) {
    try {
        await fn();
    } catch (error) {
        handleError(res, error);
    }
}

export function handleError(res: Response, error: unknown) {
    logger.error(error instanceof Error ? error.message : "Internal server error");
    if (error instanceof ServerError) {
        return sendResponse(res, makeResponse(false, error.statusCode || 400, error.message));
    }
    else if (error instanceof ZodError) {
        return sendResponse(res, makeResponse(false, 400, error.message));
    }
    return sendResponse(res, makeResponse(false, 500, "Internal server error"));
}


export function sendResponse(res: Response, result: APIResponse) {
    res.status(result.statusCode).json(result);
    if (!result.success) {
        logger.warn(`${res.req.baseUrl + res.req.url} ${result.statusCode} ${result.message}`);
    } else {
        logger.info(`${res.req.baseUrl + res.req.url} ${result.statusCode} ${result.message}`);
    }
}


export function makeResponse<T>(success: boolean = true, status: number = 200, msg: string = "", data?: T): APIResponse<T> {
    const response: APIResponse<T> = {
        success,
        statusCode: status,
        data,
        message: msg,
    };
    return response;
}

export const logger = pino(getConfig().env === 'development' ? {
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
        }
    }
} : {});

type EmbeddingTaskType = "RETRIEVAL_DOCUMENT" | "SEMANTIC_SIMILARITY";
export async function generateEmbeddings(texts: string[], task: EmbeddingTaskType): Promise<Record<string, number[]>> {
    const ai = new GoogleGenAI({
        apiKey: getConfig().geminiApiKey
    });
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: texts,
        config: { taskType: task },
    });
    const result: Record<string, number[]> = {};
    response.embeddings?.forEach((e, idx) => {
        if (e.values) {
            result[texts[idx]!] = e.values;
        }
    }) || [];
    return result;
}