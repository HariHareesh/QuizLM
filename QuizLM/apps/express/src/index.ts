import express from 'express';
// import { filesRouter } from './app/files';
import { getConfig } from '@repo/shared/server';
const config = getConfig();
import { authenticate, bodyParser, initialize } from './lib/middleware';
import cors from 'cors';
import qs from 'qs';
import { logger } from './lib/utils';
import { clerkMiddleware } from '@clerk/express'
import { questionRouter } from './app/question/qRouter';
import { webhooksHandler } from './app/webhooks';
import { testsRouter } from './app/tests/testsRouter';
import { analyticsRouter } from './app/analytics/analyticsRouter';


await initialize();

const app = express();
app.use(bodyParser);
app.use(clerkMiddleware({
    publishableKey: config.clerk.publishableKey,
    secretKey: config.clerk.secretKey,
}));
// Configure query parser to handle arrays with bracket notation
app.set('query parser', (str: string) => {
    return qs.parse(str, { 
        comma: false,
        arrayLimit: 100,
        parseArrays: true,
        ignoreQueryPrefix: true,
        strictNullHandling: false
    });
});

// Custom CORS validator
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:4000',
            "https://d4v5n1tq-4000.inc1.devtunnels.ms/",
            ...config.nextUrl.split(',').map(url => url.trim())
        ].filter(Boolean);

        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.some(allowed => origin === allowed)) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
}));

app.use('/questions', authenticate, questionRouter);
app.use('/wh', webhooksHandler);
app.use('/tests', testsRouter);
app.use('/analytics', authenticate, analyticsRouter);

app.listen(config.express.port, () => {
    logger.info(`Backend server running on port ${config.express.port}`);
});