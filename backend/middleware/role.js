export function roleMiddleware(required) {
    return function guard(req, res, next) {
        if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
        if (req.user.role !== required) return res.status(403).json({ error: 'Forbidden' });
        next();
    };
}
