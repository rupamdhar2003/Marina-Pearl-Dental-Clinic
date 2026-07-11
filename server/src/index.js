// .env is loaded by Node's --env-file flag in package.json scripts, so it's
// available before any import runs — including this file's transitive load of
// lib/supabase.js, which reads SUPABASE_URL at module-init time.
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import publicRoutes  from './routes/public.js';
import staffRoutes   from './routes/staff.js';
import { authMiddleware } from './middleware/auth.js';
import { roleMiddleware } from './middleware/role.js';
import { errorHandler }   from './middleware/errorHandler.js';

const app = express();
// Prefer API_PORT so ambient PORT env vars (set by dev tooling for the
// client) don't drag Express onto the same port as Vite.
const PORT = process.env.API_PORT || process.env.PORT || 5174;
const ORIGIN = process.env.CORS_ALLOWED_ORIGIN || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: ORIGIN.split(',').map((s) => s.trim()), credentials: true }));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, tz: 'Asia/Dubai' }));

app.use('/api/public',  publicRoutes);
app.use('/api/staff',   authMiddleware, roleMiddleware('staff'),   staffRoutes);

app.use(errorHandler);

// Only listen when run directly (Vercel serverless / tests import the app).
// `pathToFileURL(argv[1])` matches `import.meta.url` when this file IS the
// entry point (i.e. `node src/index.js`), false when Vercel imports it.
import { pathToFileURL } from 'node:url';
const isEntryPoint = process.argv[1]
    && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntryPoint && !process.env.VERCEL && process.env.NODE_ENV !== 'test') {
    const server = app.listen(PORT, () => {
        console.log(`Marina Pearl API on http://localhost:${PORT}`);
    });
    server.on('error', (err) => {
        console.error(`Failed to bind API on port ${PORT}:`, err.message);
        process.exit(1);
    });
}

export default app;
