import { ZodError } from 'zod';

export function errorHandler(err, req, res, _next) {
    if (err instanceof ZodError) {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        });
    }
    console.error('[server error]', err);
    res.status(err.status || 500).json({
        error: err.expose ? err.message : 'Something went wrong',
    });
}
