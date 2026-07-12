import { supabaseAdmin, supabaseAnon } from '../lib/supabase.js';

// Verify Supabase JWT, attach { id, email, role } to req.user.
export async function authMiddleware(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ error: 'Missing bearer token' });

        const { data, error } = await supabaseAnon.auth.getUser(token);
        if (error || !data?.user) return res.status(401).json({ error: 'Invalid token' });

        const { data: profile } = await supabaseAdmin
            .from('mp_profiles')
            .select('role, full_name, phone')
            .eq('id', data.user.id)
            .single();

        req.user = {
            id: data.user.id,
            email: data.user.email,
            role: profile?.role || 'patient',
            full_name: profile?.full_name,
            phone: profile?.phone,
        };
        next();
    } catch (err) {
        next(err);
    }
}
