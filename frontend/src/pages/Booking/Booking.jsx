import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarCheck, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { z } from 'zod';
import Button from '../../components/Button/Button.jsx';
import Stepper from '../../components/Stepper/Stepper.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import WhatsAppIcon from '../../components/Icons/WhatsAppIcon.jsx';
import { api } from '../../lib/api.js';
import { formatPriceRange, formatDubai, shortRef } from '../../lib/format.js';
import { useI18n } from '../../lib/i18n.jsx';
import './Booking.css';
import { addDays, format as fmt, startOfDay, isSameDay } from 'date-fns';

const STEPS = ['Service', 'Doctor', 'Time', 'Details', 'Confirm'];

const phoneRe = /^[0-9\s+()-]{6,20}$/;
const detailsSchema = z.object({
    patient_name:  z.string().trim().min(2, 'Enter your full name'),
    patient_email: z.string().trim().email('Enter a valid email'),
    patient_phone: z.string().trim().regex(phoneRe, 'Enter a valid phone number'),
    consent:       z.literal(true, { errorMap: () => ({ message: 'Please accept to continue' }) }),
});

function buildWhatsappUrl({ appt, doctorName, serviceName }) {
    const ref = shortRef(appt.reschedule_token);
    const when = formatDubai(appt.start_time);
    const msg = [
        `Marina Pearl Dental — booking confirmed`,
        ``,
        `Ref: ${ref}`,
        `Service: ${serviceName}`,
        `Doctor: ${doctorName}`,
        `When: ${when} (Dubai)`,
        ``,
        `Marina Plaza, Level 12, Dubai Marina`,
    ].join('\n');
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

export default function Booking() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { t } = useI18n();

    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [step, setStep] = useState(0);
    const [service, setService] = useState(null);
    const [doctorMode, setDoctorMode] = useState('any'); // 'any' | 'specific'
    const [doctor, setDoctor] = useState(null);
    const [date, setDate] = useState(() => startOfDay(new Date()));
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slot, setSlot] = useState(null); // { start, doctor_id, label }
    const [details, setDetails] = useState({
        patient_name: '', patient_email: '', patient_phone: '', consent: false,
    });
    const [detailErrs, setDetailErrs] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState(null);
    const [result, setResult] = useState(null); // { appointment, doctor, service }

    // Initial data + prefill
    useEffect(() => {
        (async () => {
            try {
                const [s, d] = await Promise.all([api.services(), api.doctors()]);
                setServices(s.services || []);
                setDoctors(d.doctors || []);
                const pSlug = params.get('service');
                const pDoc  = params.get('doctor');
                if (pSlug) {
                    const found = (s.services || []).find((x) => x.slug === pSlug);
                    if (found) { setService(found); setStep(1); }
                }
                if (pDoc) {
                    const found = (d.doctors || []).find((x) => x.id === pDoc);
                    if (found) { setDoctor(found); setDoctorMode('specific'); }
                }
            } catch {
                // The marketing pages have fallbacks, but booking really needs the API to work.
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Load slots when date/service/doctor changes on the Time step.
    useEffect(() => {
        if (step !== 2) return;
        if (!service) return;
        setSlotsLoading(true);
        setSlot(null);
        api.availability({
            doctorId: doctorMode === 'specific' ? doctor?.id : undefined,
            serviceId: service.id,
            date: fmt(date, 'yyyy-MM-dd'),
        })
            .then((r) => setSlots(r.slots || []))
            .catch(() => setSlots([]))
            .finally(() => setSlotsLoading(false));
    }, [step, service, doctorMode, doctor, date]);

    // 14-day date strip
    const dateStrip = useMemo(() => {
        const start = startOfDay(new Date());
        return Array.from({ length: 14 }).map((_, i) => addDays(start, i));
    }, []);

    // ---------- validators / navigation ----------
    function canAdvance() {
        if (step === 0) return !!service;
        if (step === 1) return doctorMode === 'any' || !!doctor;
        if (step === 2) return !!slot;
        if (step === 3) {
            const p = detailsSchema.safeParse(details);
            return p.success;
        }
        return true;
    }

    function next() {
        if (step === 3) {
            const p = detailsSchema.safeParse(details);
            if (!p.success) {
                const errs = {};
                p.error.issues.forEach((i) => { errs[i.path[0]] = i.message; });
                setDetailErrs(errs);
                return;
            }
        }
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }

    function back() {
        setStep((s) => Math.max(s - 1, 0));
    }

    async function onConfirm() {
        setSubmitting(true);
        setSubmitErr(null);
        try {
            const payload = {
                service_id: service.id,
                doctor_id: slot.doctor_id || doctor?.id,
                start_time: slot.start,
                patient_name: details.patient_name,
                patient_email: details.patient_email,
                patient_phone: details.patient_phone.startsWith('+')
                    ? details.patient_phone
                    : `+971${details.patient_phone.replace(/^0/, '').replace(/\s+/g, '')}`,
                consent: true,
            };
            const r = await api.guestBook(payload);
            setResult(r);
        } catch (err) {
            setSubmitErr(err.message || 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    // ---------- success ----------
    if (result) {
        const doctorName = result.doctor?.name || doctor?.name || 'your dentist';
        const serviceName = result.service?.name || service?.name;
        const whatsappUrl = buildWhatsappUrl({ appt: result.appointment, doctorName, serviceName });
        return (
            <section className="mp-book mp-book--success">
                <div className="mp-container mp-book__success-inner">
                    <div className="mp-book__success-badge" aria-hidden="true">
                        <CheckCircle2 size={40} />
                    </div>
                    <span className="mp-eyebrow">Confirmed</span>
                    <h1 className="mp-hero-title">You&apos;re booked.</h1>
                    <p className="mp-lead">
                        We&apos;ve sent a confirmation email to <strong>{details.patient_email}</strong>. You can
                        reschedule or cancel up to 24 hours before.
                    </p>

                    <div className="mp-book__success-card">
                        <div className="mp-book__success-row">
                            <span>Reference</span>
                            <strong>{shortRef(result.appointment.reschedule_token)}</strong>
                        </div>
                        <div className="mp-book__success-row">
                            <span>Service</span>
                            <strong>{serviceName}</strong>
                        </div>
                        <div className="mp-book__success-row">
                            <span>Doctor</span>
                            <strong>{doctorName}</strong>
                        </div>
                        <div className="mp-book__success-row">
                            <span>When</span>
                            <strong>{formatDubai(result.appointment.start_time)}</strong>
                        </div>
                        <div className="mp-book__success-row">
                            <span>Where</span>
                            <strong>Marina Plaza, Level 12, Dubai Marina</strong>
                        </div>
                    </div>

                    <div className="mp-book__success-ctas">
                        <Button as="a" href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                                variant="gold" leftIcon={<WhatsAppIcon size={16} />}>
                            Send confirmation to WhatsApp
                        </Button>
                        <Button as={Link} to={`/manage/${result.appointment.reschedule_token}`} variant="secondary">
                            Manage booking
                        </Button>
                        <Button as={Link} to="/" variant="ghost">Back to home</Button>
                    </div>
                </div>
            </section>
        );
    }

    // ---------- wizard ----------
    return (
        <section className="mp-book">
            <div className="mp-container">
                <div className="mp-book__header">
                    <div>
                        <span className="mp-eyebrow">Book an appointment</span>
                        <h1>Two minutes. Five steps. Zero calls.</h1>
                    </div>
                    <div className="mp-book__stepper">
                        <Stepper steps={STEPS} current={step} />
                    </div>
                </div>

                <div className="mp-book__grid">
                    <div className="mp-book__panel">
                        {step === 0 && (
                            <StepService
                                services={services}
                                value={service}
                                onChange={setService}
                                t={t}
                            />
                        )}
                        {step === 1 && (
                            <StepDoctor
                                doctors={doctors}
                                mode={doctorMode}
                                onMode={setDoctorMode}
                                value={doctor}
                                onChange={setDoctor}
                                t={t}
                            />
                        )}
                        {step === 2 && (
                            <StepTime
                                strip={dateStrip}
                                date={date}
                                onDate={setDate}
                                slots={slots}
                                loading={slotsLoading}
                                slot={slot}
                                onSlot={setSlot}
                                doctors={doctors}
                                doctorMode={doctorMode}
                                t={t}
                            />
                        )}
                        {step === 3 && (
                            <StepDetails
                                value={details}
                                errs={detailErrs}
                                onChange={(patch) => {
                                    setDetails((d) => ({ ...d, ...patch }));
                                    setDetailErrs((e) => {
                                        const c = { ...e };
                                        Object.keys(patch).forEach((k) => delete c[k]);
                                        return c;
                                    });
                                }}
                                t={t}
                            />
                        )}
                        {step === 4 && (
                            <StepConfirm
                                service={service}
                                doctor={doctor || doctors.find((d) => d.id === slot?.doctor_id)}
                                slot={slot}
                                details={details}
                                submitting={submitting}
                                error={submitErr}
                                onConfirm={onConfirm}
                                t={t}
                            />
                        )}

                        <div className="mp-book__nav">
                            <Button variant="ghost" size="md" onClick={step === 0 ? () => navigate(-1) : back}
                                    leftIcon={<ArrowLeft size={16} />}>
                                {step === 0 ? 'Cancel' : t('booking.back')}
                            </Button>
                            {step < STEPS.length - 1 && (
                                <Button variant="primary" size="md" onClick={next}
                                        disabled={!canAdvance()}
                                        rightIcon={<ArrowRight size={16} />}>
                                    {t('booking.next')}
                                </Button>
                            )}
                        </div>
                    </div>

                    <aside className="mp-book__side">
                        <SummarySide
                            service={service}
                            doctor={doctor || doctors.find((d) => d.id === slot?.doctor_id)}
                            slot={slot}
                            details={details}
                        />
                        <div className="mp-book__trust">
                            <Sparkles size={16} />
                            <div>
                                <strong>Free digital scan</strong>
                                <p>Every first-time patient receives a full intraoral 3D scan at no cost.</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
}

/* ---------------- step components ---------------- */

function StepService({ services, value, onChange, t }) {
    return (
        <div className="mp-step">
            <h2>{t('booking.servicePrompt')}</h2>
            {services.length === 0 ? (
                <div className="mp-book__empty"><Spinner /></div>
            ) : (
                <div className="mp-book__services">
                    {services.map((s) => {
                        const active = value?.id === s.id;
                        return (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => onChange(s)}
                                className={`mp-choice ${active ? 'is-active' : ''}`}
                            >
                                <div className="mp-choice__main">
                                    <h3>{s.name}</h3>
                                    <p>{s.description}</p>
                                </div>
                                <div className="mp-choice__meta">
                                    <span className="mp-chip mp-chip--gold">{formatPriceRange(s.price_min_aed, s.price_max_aed)}</span>
                                    <span className="mp-choice__dur">{s.duration_min} min</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function StepDoctor({ doctors, mode, onMode, value, onChange, t }) {
    return (
        <div className="mp-step">
            <h2>{t('booking.doctorPrompt')}</h2>
            <div className="mp-book__doctors">
                <button
                    type="button"
                    className={`mp-doctor-pick mp-doctor-pick--any ${mode === 'any' ? 'is-active' : ''}`}
                    onClick={() => { onMode('any'); onChange(null); }}
                >
                    <div className="mp-doctor-pick__mark" aria-hidden="true">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3>{t('booking.anyDoctor')}</h3>
                        <p>{t('booking.anyDoctorSub')}</p>
                    </div>
                </button>
                {doctors.map((d) => {
                    const active = mode === 'specific' && value?.id === d.id;
                    return (
                        <button
                            key={d.id}
                            type="button"
                            className={`mp-doctor-pick ${active ? 'is-active' : ''}`}
                            onClick={() => { onMode('specific'); onChange(d); }}
                        >
                            <img className="mp-doctor-pick__photo" src={d.photo_url} alt="" />
                            <div>
                                <span className="mp-doctor-pick__cred">{d.credentials}</span>
                                <h3>{d.name}</h3>
                                <p>{d.specialty}</p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function StepTime({ strip, date, onDate, slots, loading, slot, onSlot, doctors, doctorMode, t }) {
    return (
        <div className="mp-step">
            <h2>{t('booking.datePrompt')}</h2>
            <div className="mp-datestrip">
                {strip.map((d) => {
                    const active = isSameDay(d, date);
                    return (
                        <button
                            key={d.toISOString()}
                            type="button"
                            onClick={() => onDate(d)}
                            className={`mp-datestrip__day ${active ? 'is-active' : ''}`}
                        >
                            <span className="mp-datestrip__dow">{fmt(d, 'EEE')}</span>
                            <span className="mp-datestrip__num">{fmt(d, 'd')}</span>
                            <span className="mp-datestrip__mon">{fmt(d, 'MMM')}</span>
                        </button>
                    );
                })}
            </div>
            <h3 className="mp-slot-heading">{t('booking.slotPrompt')}</h3>
            {loading ? (
                <div className="mp-book__empty"><Spinner /></div>
            ) : slots.length === 0 ? (
                <Alert variant="info">{t('booking.noSlots')}</Alert>
            ) : (
                <div className="mp-slots">
                    {slots.map((s) => {
                        const active = slot?.start === s.start;
                        const doc = doctors.find((d) => d.id === s.doctor_id);
                        return (
                            <button
                                key={`${s.start}-${s.doctor_id}`}
                                type="button"
                                onClick={() => onSlot(s)}
                                className={`mp-slot ${active ? 'is-active' : ''}`}
                            >
                                <span className="mp-slot__time">{s.label}</span>
                                {doctorMode === 'any' && doc && (
                                    <span className="mp-slot__doc">{doc.name.replace('Dr. ', '')}</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function StepDetails({ value, errs, onChange, t }) {
    return (
        <div className="mp-step">
            <h2>{t('booking.detailsPrompt')}</h2>
            <div className="mp-book__form">
                <div className="mp-field">
                    <label className="mp-label" htmlFor="b-name">Full name</label>
                    <input id="b-name" className="mp-input" value={value.patient_name}
                           onChange={(e) => onChange({ patient_name: e.target.value })}
                           autoComplete="name"
                           placeholder={t('booking.namePlaceholder')} aria-invalid={!!errs.patient_name} required />
                    {errs.patient_name && <span className="mp-error-text">{errs.patient_name}</span>}
                </div>
                <div className="mp-field">
                    <label className="mp-label" htmlFor="b-email">Email</label>
                    <input id="b-email" type="email" className="mp-input" value={value.patient_email}
                           onChange={(e) => onChange({ patient_email: e.target.value })}
                           autoComplete="email"
                           placeholder={t('booking.emailPlaceholder')} aria-invalid={!!errs.patient_email} required />
                    {errs.patient_email && <span className="mp-error-text">{errs.patient_email}</span>}
                </div>
                <div className="mp-field">
                    <label className="mp-label" htmlFor="b-phone">Phone</label>
                    <div className="mp-phone">
                        <span className="mp-phone__prefix" aria-hidden="true">+971</span>
                        <input id="b-phone" className="mp-input mp-phone__input" value={value.patient_phone}
                               onChange={(e) => onChange({ patient_phone: e.target.value })}
                               autoComplete="tel-national"
                               inputMode="tel"
                               placeholder={t('booking.phonePlaceholder')} aria-invalid={!!errs.patient_phone} required />
                    </div>
                    {errs.patient_phone && <span className="mp-error-text">{errs.patient_phone}</span>}
                </div>
                <label className="mp-consent">
                    <input type="checkbox" checked={value.consent}
                           onChange={(e) => onChange({ consent: e.target.checked })} />
                    <span>{t('booking.consent')}</span>
                </label>
                {errs.consent && <span className="mp-error-text" style={{ marginBlockStart: '-0.5rem' }}>{errs.consent}</span>}
            </div>
        </div>
    );
}

function StepConfirm({ service, doctor, slot, details, submitting, error, onConfirm, t }) {
    return (
        <div className="mp-step">
            <h2>{t('booking.confirmPrompt')}</h2>
            <div className="mp-book__review">
                <ReviewRow label="Service" value={service?.name} />
                <ReviewRow label="Doctor"  value={doctor?.name || 'Any available'} />
                <ReviewRow label="When"    value={slot ? formatDubai(slot.start) : '—'} />
                <ReviewRow label="Name"    value={details.patient_name} />
                <ReviewRow label="Email"   value={details.patient_email} />
                <ReviewRow label="Phone"   value={details.patient_phone.startsWith('+') ? details.patient_phone : `+971 ${details.patient_phone}`} />
            </div>
            {error && <Alert variant="error" title="Couldn't complete booking.">{error}</Alert>}
            <Button variant="primary" size="lg" loading={submitting} onClick={onConfirm}
                    leftIcon={<CalendarCheck size={18} />}>
                {t('booking.confirmCta')}
            </Button>
            <p className="mp-book__disclaim">
                <Star size={13} /> No payment required at booking. Reschedule or cancel free up to 24h before.
            </p>
        </div>
    );
}

function ReviewRow({ label, value }) {
    return (
        <div className="mp-book__review-row">
            <span>{label}</span>
            <strong>{value || '—'}</strong>
        </div>
    );
}

function SummarySide({ service, doctor, slot }) {
    return (
        <div className="mp-book__summary">
            <h3>Your booking</h3>
            <div className="mp-book__summary-list">
                <div>
                    <span>Service</span>
                    <strong>{service?.name || 'Not selected'}</strong>
                </div>
                <div>
                    <span>Doctor</span>
                    <strong>{doctor?.name || 'Any available'}</strong>
                </div>
                <div>
                    <span>When</span>
                    <strong>{slot ? formatDubai(slot.start) : 'Pick a time'}</strong>
                </div>
                {service && (
                    <div>
                        <span>Price</span>
                        <strong>{formatPriceRange(service.price_min_aed, service.price_max_aed)}</strong>
                    </div>
                )}
            </div>
        </div>
    );
}
