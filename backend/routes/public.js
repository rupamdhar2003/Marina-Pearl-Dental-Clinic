import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { computeAvailability } from '../lib/availability.js';
import { sendConfirmationEmail } from '../lib/email.js';

const router = Router();

// ---------- GET /services ----------
router.get('/services', async (req, res, next) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('mp_services')
            .select('id, name, slug, description, duration_min, price_min_aed, price_max_aed, sort_order')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        if (error) throw error;
        res.json({ services: data });
    } catch (e) { next(e); }
});

// ---------- GET /doctors ----------
router.get('/doctors', async (req, res, next) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('mp_doctors')
            .select('id, name, credentials, specialty, bio, photo_url, languages, working_hours')
            .eq('is_active', true)
            .order('name', { ascending: true });
        if (error) throw error;
        res.json({ doctors: data });
    } catch (e) { next(e); }
});

// ---------- GET /availability ----------
const availabilitySchema = z.object({
    doctor_id:  z.string().uuid().optional(),
    service_id: z.string().uuid().optional(),
    date:       z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

router.get('/availability', async (req, res, next) => {
    try {
        const q = availabilitySchema.parse(req.query);
        if (q.doctor_id) {
            const slots = await computeAvailability({ doctorId: q.doctor_id, serviceId: q.service_id, date: q.date });
            return res.json({ slots, doctor_id: q.doctor_id });
        }
        // "Any doctor" — union of all active doctors' slots.
        const { data: doctors } = await supabaseAdmin.from('mp_doctors').select('id').eq('is_active', true);
        const results = await Promise.all(
            (doctors || []).map(async (d) => ({
                doctor_id: d.id,
                slots: await computeAvailability({ doctorId: d.id, serviceId: q.service_id, date: q.date }),
            }))
        );
        // Merge, dedupe by start-time. A slot is only "taken" for the
        // "any doctor" view if EVERY doctor has it booked. Prefer a free
        // (doctor, slot) pair when one exists so the client can book it.
        const merged = new Map();
        for (const r of results) {
            for (const s of r.slots) {
                const existing = merged.get(s.start);
                if (!existing) {
                    merged.set(s.start, { ...s, doctor_id: r.doctor_id });
                } else if (existing.taken && !s.taken) {
                    merged.set(s.start, { ...s, doctor_id: r.doctor_id });
                }
            }
        }
        const slots = [...merged.values()].sort((a, b) => a.start.localeCompare(b.start));
        res.json({ slots, doctor_id: null });
    } catch (e) { next(e); }
});

// ---------- POST /appointments (guest booking) ----------
const bookingSchema = z.object({
    service_id:     z.string().uuid(),
    doctor_id:      z.string().uuid(),
    start_time:     z.string().datetime(),
    patient_name:   z.string().trim().min(2).max(120),
    patient_email:  z.string().trim().email().max(200),
    patient_phone:  z.string().trim().min(6).max(30),
    consent:        z.literal(true),
    patient_profile_id: z.string().uuid().optional().nullable(),
    notes:          z.string().max(500).optional().nullable(),
});

router.post('/appointments', async (req, res, next) => {
    try {
        const body = bookingSchema.parse(req.body);
        const { data: service, error: sErr } = await supabaseAdmin
            .from('mp_services').select('id, name, duration_min').eq('id', body.service_id).single();
        if (sErr || !service) return res.status(400).json({ error: 'Service not found' });

        const { data: doctor, error: dErr } = await supabaseAdmin
            .from('mp_doctors').select('id, name, is_active').eq('id', body.doctor_id).single();
        if (dErr || !doctor || !doctor.is_active) return res.status(400).json({ error: 'Doctor not found' });

        const start = new Date(body.start_time);
        const end = new Date(start.getTime() + service.duration_min * 60_000);

        // Prevent double-book: reject if any pending/confirmed appointment overlaps.
        const { data: conflicts } = await supabaseAdmin
            .from('mp_appointments')
            .select('id')
            .eq('doctor_id', doctor.id)
            .in('status', ['pending', 'confirmed'])
            .lt('start_time', end.toISOString())
            .gt('end_time',   start.toISOString());
        if (conflicts && conflicts.length > 0) {
            return res.status(409).json({ error: 'Slot no longer available. Please pick a different time.' });
        }

        const { data: appt, error } = await supabaseAdmin
            .from('mp_appointments')
            .insert({
                patient_name: body.patient_name,
                patient_email: body.patient_email,
                patient_phone: body.patient_phone,
                patient_profile_id: body.patient_profile_id || null,
                doctor_id: doctor.id,
                service_id: service.id,
                start_time: start.toISOString(),
                end_time: end.toISOString(),
                status: 'confirmed',
                consent_given_at: new Date().toISOString(),
                notes: body.notes || null,
            })
            .select()
            .single();
        if (error) throw error;

        // Await the email BEFORE responding. On Vercel serverless the runtime
        // freezes the container as soon as the response is sent, so any
        // in-flight fetch (like the one to Resend) gets paused until the next
        // invocation — which is why booking N's email would arrive when
        // booking N+1 hits the same warm container. try/catch so a failed
        // send doesn't 500 an otherwise-successful booking.
        try {
            await sendConfirmationEmail({ appointment: appt, doctor, service });
        } catch (mailErr) {
            console.error('sendConfirmationEmail failed (booking still confirmed):', mailErr?.message);
        }

        res.status(201).json({ appointment: appt, doctor: { name: doctor.name }, service: { name: service.name } });
    } catch (e) { next(e); }
});

// ---------- GET /appointments/:token (guest lookup) ----------
router.get('/appointments/:token', async (req, res, next) => {
    try {
        const token = String(req.params.token || '');
        if (token.length < 8) return res.status(404).json({ error: 'Not found' });
        const { data, error } = await supabaseAdmin
            .from('mp_appointments')
            .select(`
                id, patient_name, patient_email, patient_phone,
                start_time, end_time, status, notes, reschedule_token,
                doctors:doctor_id ( id, name, specialty ),
                services:service_id ( id, name, duration_min, price_min_aed, price_max_aed )
            `)
            .eq('reschedule_token', token)
            .single();
        if (error || !data) return res.status(404).json({ error: 'Not found' });
        res.json({ appointment: data });
    } catch (e) { next(e); }
});

// ---------- PATCH /appointments/:token (guest reschedule/cancel) ----------
const guestUpdateSchema = z.object({
    action:     z.enum(['reschedule', 'cancel']),
    start_time: z.string().datetime().optional(),
});

router.patch('/appointments/:token', async (req, res, next) => {
    try {
        const token = String(req.params.token || '');
        const body = guestUpdateSchema.parse(req.body);
        const { data: existing, error: e0 } = await supabaseAdmin
            .from('mp_appointments')
            .select('id, start_time, doctor_id, service_id, status')
            .eq('reschedule_token', token)
            .single();
        if (e0 || !existing) return res.status(404).json({ error: 'Not found' });

        // Enforce 24-hour rule.
        const hoursUntil = (new Date(existing.start_time) - new Date()) / (1000 * 60 * 60);
        if (hoursUntil < 24) {
            return res.status(400).json({ error: 'Changes must be at least 24 hours before your appointment. Please call the clinic.' });
        }
        if (['cancelled', 'completed', 'no_show'].includes(existing.status)) {
            return res.status(400).json({ error: `Appointment is ${existing.status}.` });
        }

        if (body.action === 'cancel') {
            const { data, error } = await supabaseAdmin
                .from('mp_appointments').update({ status: 'cancelled' })
                .eq('id', existing.id).select().single();
            if (error) throw error;
            return res.json({ appointment: data });
        }

        if (!body.start_time) return res.status(400).json({ error: 'start_time required to reschedule' });
        const { data: svc } = await supabaseAdmin
            .from('mp_services').select('duration_min').eq('id', existing.service_id).single();
        const newStart = new Date(body.start_time);
        const newEnd = new Date(newStart.getTime() + (svc?.duration_min || 30) * 60_000);

        // Slot check
        const { data: conflicts } = await supabaseAdmin
            .from('mp_appointments')
            .select('id')
            .eq('doctor_id', existing.doctor_id)
            .in('status', ['pending', 'confirmed'])
            .neq('id', existing.id)
            .lt('start_time', newEnd.toISOString())
            .gt('end_time',   newStart.toISOString());
        if (conflicts && conflicts.length > 0) {
            return res.status(409).json({ error: 'That slot is no longer free.' });
        }

        const { data, error } = await supabaseAdmin
            .from('mp_appointments')
            .update({
                start_time: newStart.toISOString(),
                end_time: newEnd.toISOString(),
                status: 'confirmed',
            })
            .eq('id', existing.id)
            .select()
            .single();
        if (error) throw error;
        res.json({ appointment: data });
    } catch (e) { next(e); }
});

// ---------- POST /contact (Web3Forms proxy) ----------
const contactSchema = z.object({
    name:    z.string().trim().min(2).max(120),
    email:   z.string().trim().email(),
    phone:   z.string().trim().max(30).optional().default(''),
    subject: z.string().trim().min(2).max(120).optional().default('Website enquiry'),
    message: z.string().trim().min(5).max(2000),
});

router.post('/contact', async (req, res, next) => {
    try {
        const body = contactSchema.parse(req.body);
        const key = process.env.WEB3FORMS_ACCESS_KEY;
        if (!key) {
            console.log('---- contact enquiry (stub, WEB3FORMS_ACCESS_KEY not set) ----');
            console.log(body);
            return res.json({ ok: true, stub: true });
        }
        const resp = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                access_key: key,
                subject: `[Marina Pearl] ${body.subject}`,
                from_name: body.name,
                email: body.email,
                phone: body.phone,
                message: body.message,
            }),
        });
        if (!resp.ok) {
            const t = await resp.text();
            console.error('Web3Forms failed:', t);
            return res.status(502).json({ error: 'Contact provider unavailable' });
        }
        res.json({ ok: true });
    } catch (e) { next(e); }
});

export default router;
