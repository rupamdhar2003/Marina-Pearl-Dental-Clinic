// Seed script — run with `npm run seed`
// Populates doctors, services, one staff user, and sample appointments.
// .env is loaded by Node's --env-file flag in package.json's seed script.
import { createClient } from '@supabase/supabase-js';
import { addDays, setHours, setMinutes, formatISO } from 'date-fns';

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    SEED_STAFF_EMAIL,
    SEED_STAFF_PASSWORD,
} = process.env;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
});

const doctors = [
    {
        name: 'Dr. Farah Al Zaabi',
        credentials: 'BDS, MSc',
        specialty: 'Cosmetic & Restorative (Clinical Director)',
        bio: 'A decade of experience in aesthetic and restorative dentistry. Trained in London and Dubai. Focuses on natural-looking veneers and precision restorations.',
        photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=600&auto=format&fit=crop',
        languages: ['English', 'Arabic'],
    },
    {
        name: 'Dr. Nikhil Chandran',
        credentials: 'BDS, MDS',
        specialty: 'Orthodontics & Invisalign',
        bio: 'Certified Invisalign provider with a focus on adult orthodontics. Believes every smile deserves a plan that fits the person, not the other way around.',
        photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&auto=format&fit=crop',
        languages: ['English', 'Hindi', 'Malayalam'],
    },
    {
        name: 'Dr. Elena Rossi',
        credentials: 'DDS',
        specialty: 'Pediatric & Preventive',
        bio: 'Gentle, child-first approach. Trained in Milan with a focus on preventive care and helping kids build lifelong healthy habits.',
        photo_url: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=600&auto=format&fit=crop',
        languages: ['English', 'Italian'],
    },
];

const services = [
    { name: 'General Checkup & Cleaning', slug: 'checkup-cleaning',
      description: 'Comprehensive exam, scaling, polishing and personalised advice. Every six months keeps things simple.',
      duration_min: 45, price_min_aed: 250, price_max_aed: 450, sort_order: 1 },
    { name: 'Cosmetic Dentistry',           slug: 'cosmetic',
      description: 'Veneers, professional whitening and smile design tailored to your face shape and tone.',
      duration_min: 60, price_min_aed: 1200, price_max_aed: 6500, sort_order: 2 },
    { name: 'Orthodontics (Invisalign & Braces)', slug: 'orthodontics',
      description: 'Clear aligners and traditional braces with a treatment plan built around your lifestyle.',
      duration_min: 45, price_min_aed: 8000, price_max_aed: 22000, sort_order: 3 },
    { name: 'Dental Implants',              slug: 'implants',
      description: 'Single-tooth or full-arch implants using titanium fixtures and CAD-designed crowns.',
      duration_min: 90, price_min_aed: 5500, price_max_aed: 14000, sort_order: 4 },
    { name: 'Pediatric Dentistry',          slug: 'pediatric',
      description: 'Gentle, playful care for children age 2+. Preventive first, treatment second.',
      duration_min: 30, price_min_aed: 200, price_max_aed: 700, sort_order: 5 },
    { name: 'Root Canal Therapy',           slug: 'root-canal',
      description: 'Modern endodontics with rotary tools and anaesthesia protocols that keep discomfort low.',
      duration_min: 75, price_min_aed: 1500, price_max_aed: 3500, sort_order: 6 },
    { name: 'Emergency Dental Care',        slug: 'emergency',
      description: 'Same-day appointments for pain, trauma, or lost restorations. Call the clinic directly.',
      duration_min: 45, price_min_aed: 400, price_max_aed: 1500, sort_order: 7 },
];

async function upsertDoctors() {
    // wipe existing seeded rows to keep runs idempotent
    await admin.from('mp_doctors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { data, error } = await admin.from('mp_doctors').insert(doctors).select();
    if (error) throw error;
    return data;
}

async function upsertServices() {
    await admin.from('mp_services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { data, error } = await admin.from('mp_services').insert(services).select();
    if (error) throw error;
    return data;
}

async function ensureStaffUser() {
    if (!SEED_STAFF_EMAIL || !SEED_STAFF_PASSWORD) {
        console.warn('Skipping staff seed — SEED_STAFF_EMAIL/PASSWORD not set.');
        return null;
    }
    // Look up by email via listUsers (service-role only).
    const { data: existing } = await admin.auth.admin.listUsers();
    const found = existing?.users?.find((u) => u.email === SEED_STAFF_EMAIL);
    if (found) {
        await admin.from('mp_profiles').upsert({
            id: found.id, role: 'staff', full_name: 'Marina Pearl Admin',
        });
        return found;
    }
    const { data, error } = await admin.auth.admin.createUser({
        email: SEED_STAFF_EMAIL,
        password: SEED_STAFF_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'Marina Pearl Admin', role: 'staff' },
    });
    if (error) throw error;
    // We removed the auth.users trigger to avoid stomping on other demos in
    // this shared Supabase project, so insert the profile row explicitly.
    await admin.from('mp_profiles').upsert({
        id: data.user.id, role: 'staff', full_name: 'Marina Pearl Admin',
    });
    return data.user;
}

function scheduleSlot(daysAhead, hour, minute = 0) {
    const base = addDays(new Date(), daysAhead);
    const start = setMinutes(setHours(base, hour), minute);
    return start;
}

async function seedAppointments(doctorsData, servicesData) {
    await admin.from('mp_appointments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const [drFarah, drNikhil, drElena] = doctorsData;
    const svcBySlug = Object.fromEntries(servicesData.map((s) => [s.slug, s]));

    const rows = [
        { name: 'Aisha Rahman',     email: 'aisha@example.com',   phone: '+971501112233', doctor: drFarah,  svc: 'checkup-cleaning', days: 1, hour: 10, status: 'confirmed' },
        { name: 'Jamal Khoury',     email: 'jamal@example.com',   phone: '+971502223344', doctor: drNikhil, svc: 'orthodontics',     days: 2, hour: 11, status: 'confirmed' },
        { name: 'Priya Mehta',      email: 'priya@example.com',   phone: '+971503334455', doctor: drElena,  svc: 'pediatric',        days: 3, hour: 14, status: 'pending'   },
        { name: 'Omar Al Suwaidi',  email: 'omar@example.com',    phone: '+971504445566', doctor: drFarah,  svc: 'cosmetic',         days: 4, hour: 16, status: 'confirmed' },
        { name: 'Layla Farsi',      email: 'layla@example.com',   phone: '+971505556677', doctor: drNikhil, svc: 'checkup-cleaning', days: 5, hour: 9,  status: 'confirmed' },
        { name: 'Marcus Weber',     email: 'marcus@example.com',  phone: '+971506667788', doctor: drFarah,  svc: 'implants',         days: 6, hour: 13, status: 'pending'   },
        { name: 'Fatima Al Marri',  email: 'fatima@example.com',  phone: '+971507778899', doctor: drElena,  svc: 'pediatric',        days: 8, hour: 15, status: 'confirmed' },
        { name: 'Rahul Sharma',     email: 'rahul@example.com',   phone: '+971508889900', doctor: drNikhil, svc: 'root-canal',       days: 9, hour: 17, status: 'confirmed' },
    ];

    const inserts = rows.map((r) => {
        const svc = svcBySlug[r.svc];
        const start = scheduleSlot(r.days, r.hour);
        const end = new Date(start.getTime() + svc.duration_min * 60_000);
        return {
            patient_name: r.name,
            patient_email: r.email,
            patient_phone: r.phone,
            doctor_id: r.doctor.id,
            service_id: svc.id,
            start_time: formatISO(start),
            end_time: formatISO(end),
            status: r.status,
            consent_given_at: formatISO(new Date()),
        };
    });

    const { error } = await admin.from('mp_appointments').insert(inserts);
    if (error) throw error;
    return inserts.length;
}

async function main() {
    console.log('Seeding Marina Pearl Dental…');
    const d = await upsertDoctors();      console.log(`  doctors:  ${d.length}`);
    const s = await upsertServices();     console.log(`  services: ${s.length}`);
    const staff = await ensureStaffUser();
    if (staff) console.log(`  staff:    ${staff.email}`);
    const n = await seedAppointments(d, s);
    console.log(`  appointments: ${n}`);
    console.log('\nDone.');
    if (staff) console.log(`Staff login: ${SEED_STAFF_EMAIL} / ${SEED_STAFF_PASSWORD}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
