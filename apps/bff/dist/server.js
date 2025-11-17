import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import apiRouter from './routes/index.js';
import { corsOrigins, env, isDev } from './config/env.js';
import { ensureSchema } from './db/client.js';
const app = express();
app.use(morgan(isDev ? 'dev' : 'combined'));
app.use(cors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(clerkMiddleware());
app.use('/api/v1', apiRouter);
// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});
async function start() {
    await ensureSchema();
    app.listen(env.PORT, () => {
        console.log(`BFF listening on port ${env.PORT}`);
    });
}
start().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
});
