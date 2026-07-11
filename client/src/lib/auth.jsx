import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { supabase } from './supabase.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [sessionLoading, setSessionLoading] = useState(true);
    // Tracks the profile fetch separately so RequireStaff doesn't redirect
    // in the brief window between "session set" and "profile loaded".
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        let mounted = true;
        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return;
            setSession(data.session || null);
            setSessionLoading(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
            setSession(s || null);
        });
        return () => { mounted = false; sub?.subscription?.unsubscribe(); };
    }, []);

    // Depend on user.id (not the whole session) so token refreshes on tab
    // focus don't re-flip profileLoading and unmount the admin tree.
    const userId = session?.user?.id ?? null;
    useEffect(() => {
        if (!userId) {
            setProfile(null);
            setProfileLoading(false);
            return;
        }
        let cancelled = false;
        setProfileLoading(true);
        (async () => {
            const { data } = await supabase.from('mp_profiles').select('role, full_name, phone').eq('id', userId).single();
            if (cancelled) return;
            setProfile(data || null);
            setProfileLoading(false);
        })();
        return () => { cancelled = true; };
    }, [userId]);

    // "loading" also covers the gap render where session is set but the
    // profile useEffect hasn't kicked off yet — otherwise RequireStaff sees
    // user=truthy, role=null and redirects to / on refresh of /admin/*.
    const value = useMemo(() => ({
        session,
        user: session?.user || null,
        profile,
        loading: sessionLoading || profileLoading || (!!session?.user && !profile),
        role: profile?.role || null,
        signOut: () => supabase.auth.signOut(),
    }), [session, profile, sessionLoading, profileLoading]);

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthCtx);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
