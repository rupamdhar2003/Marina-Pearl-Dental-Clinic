// Slot availability: doctor working hours minus existing appointments minus holidays.
import { supabaseAdmin } from './supabase.js';
import { fromZonedTime, toZonedTime, format as tzFormat } from 'date-fns-tz';
import { addMinutes } from 'date-fns';

const TZ = 'Asia/Dubai';
const SLOT_MIN = 30;

function hmToMinutes(hm) {
    const [h, m] = hm.split(':').map(Number);
    return h * 60 + m;
}

/**
 * Compute 30-minute slots for one doctor on one date (YYYY-MM-DD in Dubai TZ).
 * Returns ALL slots within working hours (past times excluded), each with a
 * `taken` boolean so the client can render booked slots as disabled instead
 * of hiding them.
 */
export async function computeAvailability({ doctorId, serviceId, date }) {
    if (!doctorId || !date) throw new Error('doctor_id and date required');

    // Fetch doctor + service + holidays + existing appointments in parallel.
    const [{ data: doctor, error: dErr }, { data: service, error: sErr },
           { data: holiday }, { data: appts, error: aErr }] = await Promise.all([
        supabaseAdmin.from('mp_doctors').select('id, working_hours, is_active').eq('id', doctorId).single(),
        serviceId
            ? supabaseAdmin.from('mp_services').select('id, duration_min').eq('id', serviceId).single()
            : Promise.resolve({ data: null }),
        supabaseAdmin.from('mp_holidays').select('date').eq('date', date).maybeSingle(),
        supabaseAdmin.from('mp_appointments')
            .select('start_time, end_time, status')
            .eq('doctor_id', doctorId)
            .gte('start_time', `${date}T00:00:00+04:00`)
            .lt('start_time',  `${date}T23:59:59+04:00`)
            .in('status', ['pending', 'confirmed']),
    ]);
    if (dErr) throw dErr;
    if (sErr && serviceId) throw sErr;
    if (aErr) throw aErr;
    if (!doctor || !doctor.is_active) return [];
    if (holiday) return [];

    // Determine working hours for this day-of-week (0=Sunday).
    const midnight = fromZonedTime(`${date}T00:00:00`, TZ);
    const dow = toZonedTime(midnight, TZ).getDay();
    const hours = doctor.working_hours?.[String(dow)];
    if (!hours) return [];

    const openMin  = hmToMinutes(hours.open);
    const closeMin = hmToMinutes(hours.close);
    const durationMin = service?.duration_min ?? SLOT_MIN;

    // Build candidate 30-min slots that fit before close - duration.
    const candidates = [];
    for (let m = openMin; m + durationMin <= closeMin; m += SLOT_MIN) {
        const hh = String(Math.floor(m / 60)).padStart(2, '0');
        const mm = String(m % 60).padStart(2, '0');
        // Interpret HH:MM as Dubai wall time.
        const startUtc = fromZonedTime(`${date}T${hh}:${mm}:00`, TZ);
        candidates.push(startUtc);
    }

    // Exclude past times (if today).
    const now = new Date();
    const nonPast = candidates.filter((start) => start >= now);

    // For each remaining slot, mark whether it overlaps any pending/confirmed
    // appointment on this doctor. Client uses the flag to disable+style it.
    const takenRanges = (appts || []).map((a) => [new Date(a.start_time), new Date(a.end_time)]);

    return nonPast.map((d) => {
        const end = addMinutes(d, durationMin);
        const taken = takenRanges.some(([bStart, bEnd]) => d < bEnd && end > bStart);
        return {
            start: d.toISOString(),
            label: tzFormat(toZonedTime(d, TZ), 'HH:mm', { timeZone: TZ }),
            taken,
        };
    });
}
