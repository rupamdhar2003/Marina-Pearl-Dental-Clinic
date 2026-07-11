import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, ListChecks, Users, Stethoscope, Wrench, Settings, LogOut } from 'lucide-react';
import Logo from '../../components/Logo/Logo.jsx';
import { supabase } from '../../lib/supabase.js';
import './AdminShell.css';

const NAV = [
    { to: '/admin',              end: true,  label: 'Dashboard',    icon: <LayoutDashboard size={16} /> },
    { to: '/admin/calendar',      label: 'Calendar',    icon: <CalendarDays size={16} /> },
    { to: '/admin/appointments',  label: 'Appointments', icon: <ListChecks size={16} /> },
    { to: '/admin/patients',      label: 'Patients',    icon: <Users size={16} /> },
    { to: '/admin/doctors',       label: 'Doctors',     icon: <Stethoscope size={16} /> },
    { to: '/admin/services',      label: 'Services',    icon: <Wrench size={16} /> },
    { to: '/admin/settings',      label: 'Settings',    icon: <Settings size={16} /> },
];

export default function AdminShell() {
    const nav = useNavigate();
    async function signOut() {
        await supabase.auth.signOut();
        nav('/admin/login');
    }
    return (
        <div className="mp-adm">
            <aside className="mp-adm__side">
                <div className="mp-adm__brand"><Logo /></div>
                <nav className="mp-adm__nav" aria-label="Admin">
                    {NAV.map((n) => (
                        <NavLink key={n.to} to={n.to} end={n.end}
                                 className={({ isActive }) => `mp-adm__link ${isActive ? 'is-active' : ''}`}>
                            {n.icon} <span>{n.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <button className="mp-adm__signout" onClick={signOut}>
                    <LogOut size={16} /> Sign out
                </button>
            </aside>
            <main className="mp-adm__main">
                <Outlet />
            </main>
        </div>
    );
}
