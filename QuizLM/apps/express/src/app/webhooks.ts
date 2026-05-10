import { prisma } from "@/lib/prisma";
import { handleError, logger } from "@/lib/utils";
import type { UserJSON } from "@clerk/express";
import { verifyWebhook } from "@clerk/express/webhooks";
import { getConfig } from "@repo/shared/server";
import { Router, type Request, type Response } from "express";

const router = Router();
export { router as webhooksHandler };

router.post('/user/new', handleNewUser);

async function handleNewUser(req: Request, res: Response) {
    try {
        const hook = await verifyWebhook(req, {
            signingSecret: getConfig().clerk.webhookSecret,
        });
        const user = hook.data as UserJSON;
        
        logger.info(`Received new user webhook for user ID: ${user.id}`);
        await prisma.user.create({
            data: {
                clerkUserId: user.id!,
                email: user.email_addresses.at(0)?.email_address || '',
                name: user.first_name + ' ' + user.last_name,
            }
        })
    } catch (error) {
        handleError(res, error);
    }
}