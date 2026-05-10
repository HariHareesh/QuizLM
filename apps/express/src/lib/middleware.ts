import path from "path";
import { existsSync, mkdirSync } from 'fs';
import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { AuthError } from "./errors";
import { handleError } from "./utils";
import { randomUUID } from "crypto";
import formidable from "formidable";
import { json } from "express";

export const uploadDir = path.join(process.cwd(), 'uploads');
export type UploadedFile = {
    name: string;
    size: number;
    path: string;
};
declare module "express" {
    interface Request {
        files?: UploadedFile[];
        userId?: string;
    }
}


export async function initialize() {
    if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const userId = getAuth(req).userId;
    if (userId) {
        req.userId = userId;
        return next();
    }
    handleError(res, new AuthError("Unauthorized"));
}

export function bodyParser(req: Request, res: Response, next: NextFunction) {
    const type = req.headers['content-type'];
    if (type?.includes('application/json')) {
        return json()(req, res, next);
    }
    else if (type?.includes('multipart/form-data')) {
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }
        const form = formidable({
            uploadDir: uploadDir,
            keepExtensions: true,
            multiples: true,
            maxFileSize: 10 * 1024 * 1024, // 10 MB
            // eslint-disable-next-line
            filename: (_name, ext, _part, _form) => {
                return `${randomUUID()}${ext}`;
            }
        });
        form.parse(req, (err, fields, files) => {
            if (err) {
                return next(err);
            }
            req.body = fields.data ? JSON.parse(fields.data[0] as string) : {};
            const result: UploadedFile[] = [];

            for (const key in files) {
                const value = files[key];
                if (!value) continue;

                const fileArray = Array.isArray(value) ? value : [value];

                for (const file of fileArray) {
                    result.push({
                        name: file.newFilename,   // stored name
                        size: file.size,
                        path: file.filepath,
                    });
                }
            }
            req.files = result;
            next(); // ✅ Call next() after parsing is complete
        });
        return; // ✅ Don't call next() outside the callback
    }
    next();
}
