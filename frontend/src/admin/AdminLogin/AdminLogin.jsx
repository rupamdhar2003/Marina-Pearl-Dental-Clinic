import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Lock, Mail } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import Logo from '../../components/Logo/Logo.jsx';
import { supabase } from '../../lib/supabase.js';
import './AdminLogin.css';

export default function AdminLogin() {
    const nav = useNavigate();
    const [email, setEmail] = useState('');
    const [pw, setPw] = useState('');
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);

    async function onSubmit(e) {
        e.preventDefault();
        setBusy(true); setErr(null);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: pw });
            if (error) throw error;
            
            const { data: prof } = await supabase.from('mp_profiles').select('role').eq('id', data.user.id).single();
            if (prof?.role !== 'staff') {
                await supabase.auth.signOut();
                throw new Error('This account is not a staff account.');
            }
            nav('/admin');
        } 
        catch (e) {
            setErr(e.message || 'Sign-in failed');
        } 
        finally { setBusy(false); }
    }

    return (
        <div className="mp-alogin">
            <div className="mp-alogin__card">
                <Link to="/" className="mp-alogin__brand"><Logo /></Link>
                <h1>Staff sign in</h1>
                <p>Marina Pearl Dental — administration console.</p>
                {err && <Alert variant="error">{err}</Alert>}
                <form onSubmit={onSubmit} className="mp-alogin__form">
                    <div className="mp-field">
                        <label className="mp-label" htmlFor="al-email">Email</label>
                        <div className="mp-alogin__ico">
                            <Mail size={16} aria-hidden="true" />
                            <input id="al-email" type="email" className="mp-input" value={email}
                                   onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                        </div>
                    </div>
                    <div className="mp-field">
                        <label className="mp-label" htmlFor="al-pw">Password</label>
                        <div className="mp-alogin__ico">
                            <Lock size={16} aria-hidden="true" />
                            <input id="al-pw" type="password" className="mp-input" value={pw}
                                   onChange={(e) => setPw(e.target.value)} required autoComplete="current-password" />
                        </div>
                    </div>
                    <Button type="submit" variant="primary" size="lg" loading={busy} leftIcon={<LogIn size={16} />}>
                        Sign in
                    </Button>
                </form>
                <p className="mp-alogin__foot">
                    Not staff? <Link to="/">Back to the site →</Link>
                </p>
            </div>
        </div>
    );
}
