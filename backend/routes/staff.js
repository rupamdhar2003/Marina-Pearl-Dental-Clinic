import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { addDays, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';

const router = Router();

// ---------- GET /dashboard ----------
router.get('/dashboard', async (req, res, next) => {
    try {
        const now = new Date();
        const wStart = startOfWeek(now, { weekStartsOn: 6 }); // Sat = 6
        const wEnd   = endOfWeek(now,   { weekStartsOn: 6 });

        const { data: weekAppts } = await supabaseAdmin
            .from('mp_appointments')
            .select('id, start_time, status, service:service_id(price_min_aed, price_max_aed)')
            .gte('start_time', wStart.toISOString())
            .lte('start_time', wEnd.toISOString())
            .neq('status', 'cancelled');

        const { data: todayAppts } = await supabaseAdmin
            .from('mp_appointments')
            .select(`
                id, patient_name, start_time, end_time, status,
                doctor:doctor_id (name), service:service_id (name)
            `)
            .gte('start_time', startOfDay(now).toISOString())
            .lte('start_time', endOfDay(now).toISOString())
            .neq('status', 'cancelled')
            .order('start_time', { ascending: true });

        const revenueLow = (weekAppts || [])
            .filter((a) => a.status === 'confirmed' || a.status === 'completed')
            .reduce((sum, a) => sum + (a.service?.price_min_aed || 0), 0);

        res.json({
            weekCount: weekAppts?.length || 0,
            todayCount: todayAppts?.length || 0,
            todaySchedule: todayAppts || [],
            estWeekRevenueAed: revenueLow,
        });
    } catch (e) { next(e); }
});

// ---------- GET /appointments (filter) ----------
router.get('/appointments', async (req, res, next) => {
    try {
        const {
            doctor_id, service_id, status,
            from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            to   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        } = req.query;

        let q = supabaseAdmin
            .from('mp_appointments')
            .select(`
                id, patient_name, patient_email, patient_phone,
                start_time, end_time, status, notes, reschedule_token,
                doctor:doctor_id (id, name),
                service:service_id (id, name, duration_min, price_min_aed, price_max_aed)
            `)
            .gte('start_time', from).lte('start_time', to)
            .order('start_time', { ascending: true });

        if (doctor_id)  q = q.eq('doctor_id', doctor_id);
        if (service_id) q = q.eq('service_id', service_id);
        if (status)     q = q.eq('status', status);

        const { data, error } = await q;
        if (error) throw error;
        res.json({ appointments: data });
    } catch (e) { next(e); }
});

// ---------- POST /appointments (walk-in — no consent required) ----------
const walkInSchema = z.object({
    service_id:    z.string().uuid(),
    doctor_id:     z.string().uuid(),
    start_time:    z.string().datetime(),
    patient_name:  z.string().trim().min(2).max(120),
    patient_email: z.string().trim().email(),
    patient_phone: z.string().trim().min(6).max(30),
    notes:         z.string().max(500).optional().nullable(),
});

router.post('/appointments', async (req, res, next) => {
    try {
        const body = walkInSchema.parse(req.body);
        const { data: svc } = await supabaseAdmin
            .from('mp_services').select('id, duration_min').eq('id', body.service_id).single();
        if (!svc) return res.status(400).json({ error: 'Service not found' });
        const start = new Date(body.start_time);
        const end   = new Date(start.getTime() + svc.duration_min * 60_000);
        const { data, error } = await supabaseAdmin
            .from('mp_appointments')
            .insert({
                patient_name: body.patient_name,
                patient_email: body.patient_email,
                patient_phone: body.patient_phone,
                doctor_id: body.doctor_id,
                service_id: svc.id,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
                status: 'confirmed',
                notes: body.notes || null,
            }).select().single();
        if (error) throw error;
        res.status(201).json({ appointment: data });
    } catch (e) { next(e); }
});

// ---------- PATCH /appointments/:id (status change / reschedule) ----------
const apptUpdateSchema = z.object({
    status:     z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional(),
    start_time: z.string().datetime().optional(),
    notes:      z.string().max(500).optional().nullable(),
});

router.patch('/appointments/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const body = apptUpdateSchema.parse(req.body);
        const patch = { ...body };
        if (body.start_time) {
            const { data: existing } = await supabaseAdmin
                .from('mp_appointments').select('service_id').eq('id', id).single();
            const { data: svc } = await supabaseAdmin
                .from('mp_services').select('duration_min').eq('id', existing.service_id).single();
            const start = new Date(body.start_time);
            patch.end_time = new Date(start.getTime() + (svc?.duration_min || 30) * 60_000).toISOString();
        }
        const { data, error } = await supabaseAdmin
            .from('mp_appointments').update(patch).eq('id', id).select().single();
        if (error) throw error;
        res.json({ appointment: data });
    } catch (e) { next(e); }
});

// ---------- GET /patients (derived from appointments) ----------
router.get('/patients', async (req, res, next) => {
    try {
        const search = String(req.query.search || '').trim().toLowerCase();
        const { data, error } = await supabaseAdmin
            .from('mp_appointments')
            .select('patient_name, patient_email, patient_phone, start_time, status')
            .order('start_time', { ascending: false });
        if (error) throw error;
        const byEmail = new Map();
        for (const a of data || []) {
            const key = a.patient_email.toLowerCase();
            const prev = byEmail.get(key);
            if (!prev) {
                byEmail.set(key, {
                    name: a.patient_name, email: a.patient_email, phone: a.patient_phone,
                    lastVisit: a.start_time, visits: 1,
                });
            } else {
                prev.visits += 1;
                if (a.start_time > prev.lastVisit) prev.lastVisit = a.start_time;
            }
        }
        let patients = [...byEmail.values()];
        if (search) {
            patients = patients.filter((p) =>
                p.name.toLowerCase().includes(search) ||
                p.email.toLowerCase().includes(search) ||
                (p.phone || '').includes(search)
            );
        }
        patients.sort((a, b) => b.lastVisit.localeCompare(a.lastVisit));
        res.json({ patients });
    } catch (e) { next(e); }
});

// ---------- doctors CRUD ----------
router.get('/doctors', async (req, res, next) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('mp_doctors').select('*').order('name', { ascending: true });
        if (error) throw error;
        res.json({ doctors: data });
    } catch (e) { next(e); }
});

const doctorSchema = z.object({
    name:          z.string().trim().min(2).max(120),
    credentials:   z.string().max(120).optional().nullable(),
    specialty:     z.string().max(200).optional().nullable(),
    bio:           z.string().max(2000).optional().nullable(),
    photo_url:     z.string().url().max(500).optional().nullable(),
    languages:     z.array(z.string()).optional(),
    working_hours: z.record(z.union([z.object({ open: z.string(), close: z.string() }), z.null()])).optional(),
    is_active:     z.boolean().optional(),
});

router.post('/doctors', async (req, res, next) => {
    try {
        const body = doctorSchema.parse(req.body);
        const { data, error } = await supabaseAdmin.from('mp_doctors').insert(body).select().single();
        if (error) throw error;
        res.status(201).json({ doctor: data });
    } catch (e) { next(e); }
});

router.patch('/doctors/:id', async (req, res, next) => {
    try {
        const body = doctorSchema.partial().parse(req.body);
        const { data, error } = await supabaseAdmin
            .from('mp_doctors').update(body).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json({ doctor: data });
    } catch (e) { next(e); }
});

// ---------- services CRUD ----------
router.get('/services', async (req, res, next) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('mp_services').select('*').order('sort_order', { ascending: true });
        if (error) throw error;
        res.json({ services: data });
    } catch (e) { next(e); }
});

const serviceSchema = z.object({
    name:          z.string().trim().min(2).max(120),
    slug:          z.string().trim().min(2).max(120).regex(/^[a-z0-9-]+$/),
    description:   z.string().max(2000).optional().nullable(),
    duration_min:  z.number().int().positive().max(600),
    price_min_aed: z.number().int().min(0),
    price_max_aed: z.number().int().min(0),
    is_active:     z.boolean().optional(),
    sort_order:    z.number().int().optional(),
});

router.post('/services', async (req, res, next) => {
    try {
        const body = serviceSchema.parse(req.body);
        const { data, error } = await supabaseAdmin.from('mp_services').insert(body).select().single();
        if (error) throw error;
        res.status(201).json({ service: data });
    } catch (e) { next(e); }
});

router.patch('/services/:id', async (req, res, next) => {
    try {
        const body = serviceSchema.partial().parse(req.body);
        const { data, error } = await supabaseAdmin
            .from('mp_services').update(body).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json({ service: data });
    } catch (e) { next(e); }
});

// ---------- settings ----------
router.get('/settings', async (req, res, next) => {
    try {
        const [{ data: settings }, { data: holidays }] = await Promise.all([
            supabaseAdmin.from('mp_settings').select('*').eq('id', 1).single(),
            supabaseAdmin.from('mp_holidays').select('*').order('date', { ascending: true }),
        ]);
        res.json({ settings, holidays: holidays || [] });
    } catch (e) { next(e); }
});

const settingsSchema = z.object({
    clinic_hours: z.record(z.union([z.object({ open: z.string(), close: z.string() }), z.null()])).optional(),
    holidays: z.array(z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        reason: z.string().max(120).optional().nullable(),
    })).optional(),
});

router.patch('/settings', async (req, res, next) => {
    try {
        const body = settingsSchema.parse(req.body);
        if (body.clinic_hours) {
            await supabaseAdmin
                .from('mp_settings').update({ clinic_hours: body.clinic_hours, updated_at: new Date().toISOString() })
                .eq('id', 1);
        }
        if (body.holidays) {
            await supabaseAdmin.from('mp_holidays').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (body.holidays.length > 0) {
                await supabaseAdmin.from('mp_holidays').insert(body.holidays);
            }
        }
        res.json({ ok: true });
    } catch (e) { next(e); }
});

export default router;
