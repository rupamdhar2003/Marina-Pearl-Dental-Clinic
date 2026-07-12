import { supabase } from './supabase.js';

const BASE = import.meta.env.VITE_API_BASE_URL || '';

async function authHeader() {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
    if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
            const body = await res.json();
            msg = body.error || msg;
        } 
        catch { /* body not json */ }
        
        const err = new Error(msg);
        err.status = res.status;
        throw err;
    }
    if (res.status === 204) return null;
    return res.json();
}

export const api = {
    // ---------- public ----------
    async services() {
        return handle(await fetch(`${BASE}/api/public/services`));
    },
    async doctors() {
        return handle(await fetch(`${BASE}/api/public/doctors`));
    },
    async availability({ doctorId, serviceId, date }) {
        const q = new URLSearchParams({ date });
        if (doctorId)  q.set('doctor_id',  doctorId);
        if (serviceId) q.set('service_id', serviceId);
        return handle(await fetch(`${BASE}/api/public/availability?${q}`));
    },
    async guestBook(payload) {
        return handle(await fetch(`${BASE}/api/public/appointments`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }));
    },
    async lookupByToken(token) {
        return handle(await fetch(`${BASE}/api/public/appointments/${encodeURIComponent(token)}`));
    },
    async guestUpdate(token, payload) {
        return handle(await fetch(`${BASE}/api/public/appointments/${encodeURIComponent(token)}`, {
            method: 'PATCH', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }));
    },
    async contact(payload) {
        return handle(await fetch(`${BASE}/api/public/contact`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        }));
    },

    // ---------- staff ----------
    async staffDashboard() {
        return handle(await fetch(`${BASE}/api/staff/dashboard`, { headers: await authHeader() }));
    },
    async staffAppointments(query = {}) {
        const q = new URLSearchParams(query);
        return handle(await fetch(`${BASE}/api/staff/appointments?${q}`, { headers: await authHeader() }));
    },
    async staffWalkIn(payload) {
        return handle(await fetch(`${BASE}/api/staff/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
            body: JSON.stringify(payload),
        }));
    },
    async staffUpdateAppt(id, payload) {
        return handle(await fetch(`${BASE}/api/staff/appointments/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
            body: JSON.stringify(payload),
        }));
    },
    async staffPatients(search = '') {
        const q = search ? `?search=${encodeURIComponent(search)}` : '';
        return handle(await fetch(`${BASE}/api/staff/patients${q}`, { headers: await authHeader() }));
    },
    async staffDoctors() {
        return handle(await fetch(`${BASE}/api/staff/doctors`, { headers: await authHeader() }));
    },
    async staffCreateDoctor(payload) {
        return handle(await fetch(`${BASE}/api/staff/doctors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
            body: JSON.stringify(payload),
        }));
    },
    async staffUpdateDoctor(id, payload) {
        return handle(await fetch(`${BASE}/api/staff/doctors/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
            body: JSON.stringify(payload),
        }));
    },
    async staffServices() {
        return handle(await fetch(`${BASE}/api/staff/services`, { headers: await authHeader() }));
    },
    async staffCreateService(payload) {
        return handle(await fetch(`${BASE}/api/staff/services`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
            body: JSON.stringify(payload),
        }));
    },
    async staffUpdateService(id, payload) {
        return handle(await fetch(`${BASE}/api/staff/services/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
            body: JSON.stringify(payload),
        }));
    },
    async staffSettings() {
        return handle(await fetch(`${BASE}/api/staff/settings`, { headers: await authHeader() }));
    },
    async staffUpdateSettings(payload) {
        return handle(await fetch(`${BASE}/api/staff/settings`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
            body: JSON.stringify(payload),
        }));
    },
};
