import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, Ban, RefreshCw } from 'lucide-react';
import { addDays, format as fmt, startOfDay, isSameDay } from 'date-fns';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import { formatDubai, shortRef } from '../../lib/format.js';
import './ManageAppointment.css';

export default function ManageAppointment() {
    const { token } = useParams();
    const [appt, setAppt] = useState(null);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('view'); // view | reschedule | cancelling | cancelled
    const [date, setDate] = useState(() => startOfDay(new Date()));
    const [slots, setSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [slot, setSlot] = useState(null);
    const [message, setMessage] = useState(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        api.lookupByToken(token)
            .then((r) => setAppt(r.appointment))
            .catch((e) => setError(e.message || 'Booking not found'));
    }, [token]);

    useEffect(() => {
        if (mode !== 'reschedule' || !appt) return;
        setSlotsLoading(true);
        setSlot(null);
        api.availability({
            doctorId: appt.doctors?.id,
            serviceId: appt.services?.id,
            date: fmt(date, 'yyyy-MM-dd'),
        })
            .then((r) => setSlots(r.slots || []))
            .catch(() => setSlots([]))
            .finally(() => setSlotsLoading(false));
    }, [mode, date, appt]);

    async function doCancel() {
        setBusy(true);
        setMessage(null);
        try {
            await api.guestUpdate(token, { action: 'cancel' });
            setAppt((a) => ({ ...a, status: 'cancelled' }));
            setMode('cancelled');
        } catch (e) {
            setMessage({ variant: 'error', text: e.message || 'Cancellation failed' });
        } finally { setBusy(false); }
    }

    async function doReschedule() {
        if (!slot) return;
        setBusy(true);
        setMessage(null);
        try {
            const r = await api.guestUpdate(token, { action: 'reschedule', start_time: slot.start });
            setAppt((a) => ({ ...a, ...r.appointment }));
            setMode('view');
            setMessage({ variant: 'success', text: 'Your appointment has been rescheduled.' });
        } catch (e) {
            setMessage({ variant: 'error', text: e.message || 'Reschedule failed' });
        } finally { setBusy(false); }
    }

    const strip = Array.from({ length: 14 }).map((_, i) => addDays(startOfDay(new Date()), i));

    if (error) {
        return (
            <div className="mp-container mp-manage__err">
                <p>{error}</p>
                <Button as={Link} to="/" variant="secondary">Back to home</Button>
            </div>
        );
    }
    if (!appt) return <div className="mp-container" style={{ paddingBlock: '4rem' }}><Spinner /></div>;

    const hoursUntil = (new Date(appt.start_time) - new Date()) / 3600000;
    const canChange = hoursUntil >= 24 && ['pending', 'confirmed'].includes(appt.status);

    return (
        <section className="mp-manage">
            <div className="mp-container mp-manage__inner">
                <Link to="/" className="mp-back"><ArrowLeft size={16} /> Back to site</Link>
                <span className="mp-eyebrow">Booking · {shortRef(token)}</span>
                <h1 className="mp-hero-title">Manage your appointment</h1>

                {message && <Alert variant={message.variant}>{message.text}</Alert>}

                <div className="mp-manage__card">
                    <div className="mp-manage__row"><span>Service</span><strong>{appt.services?.name}</strong></div>
                    <div className="mp-manage__row"><span>Doctor</span><strong>{appt.doctors?.name}</strong></div>
                    <div className="mp-manage__row"><span>When</span><strong>{formatDubai(appt.start_time)}</strong></div>
                    <div className="mp-manage__row"><span>Status</span><strong className={`mp-manage__status is-${appt.status}`}>{appt.status}</strong></div>
                </div>

                {mode === 'view' && (
                    <div className="mp-manage__actions">
                        {canChange && (
                            <>
                                <Button variant="primary" leftIcon={<RefreshCw size={16} />}
                                        onClick={() => setMode('reschedule')}>
                                    Reschedule
                                </Button>
                                <Button variant="danger" leftIcon={<Ban size={16} />}
                                        onClick={() => setMode('cancelling')}>
                                    Cancel appointment
                                </Button>
                            </>
                        )}
                        {!canChange && appt.status !== 'cancelled' && (
                            <Alert variant="info">
                                Changes must be at least 24 hours before your appointment. Please call the clinic
                                on <a href="tel:+97140000000">+971 4 000 0000</a>.
                            </Alert>
                        )}
                    </div>
                )}

                {mode === 'cancelling' && (
                    <div className="mp-manage__panel">
                        <h2>Cancel this appointment?</h2>
                        <p>This will free your slot for another patient. You can rebook any time.</p>
                        <div className="mp-manage__actions">
                            <Button variant="danger" loading={busy} onClick={doCancel}>Yes, cancel</Button>
                            <Button variant="ghost" onClick={() => setMode('view')}>Keep it</Button>
                        </div>
                    </div>
                )}

                {mode === 'reschedule' && (
                    <div className="mp-manage__panel">
                        <h2>Pick a new time</h2>
                        <div className="mp-datestrip">
                            {strip.map((d) => (
                                <button key={d.toISOString()}
                                        onClick={() => setDate(d)}
                                        className={`mp-datestrip__day ${isSameDay(d, date) ? 'is-active' : ''}`}>
                                    <span className="mp-datestrip__dow">{fmt(d, 'EEE')}</span>
                                    <span className="mp-datestrip__num">{fmt(d, 'd')}</span>
                                    <span className="mp-datestrip__mon">{fmt(d, 'MMM')}</span>
                                </button>
                            ))}
                        </div>
                        {slotsLoading ? (
                            <div style={{ padding: '2rem 0', textAlign: 'center' }}><Spinner /></div>
                        ) : slots.length === 0 ? (
                            <Alert variant="info">No open slots that day. Try another date.</Alert>
                        ) : (
                            <div className="mp-slots">
                                {slots.map((s) => (
                                    <button key={s.start} onClick={() => setSlot(s)}
                                            className={`mp-slot ${slot?.start === s.start ? 'is-active' : ''}`}>
                                        <span className="mp-slot__time">{s.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="mp-manage__actions">
                            <Button variant="primary" leftIcon={<CalendarCheck size={16} />}
                                    disabled={!slot} loading={busy} onClick={doReschedule}>
                                Confirm new time
                            </Button>
                            <Button variant="ghost" onClick={() => setMode('view')}>Back</Button>
                        </div>
                    </div>
                )}

                {mode === 'cancelled' && (
                    <Alert variant="success" title="Cancelled.">
                        Your appointment has been cancelled. You&apos;re welcome to book again any time.
                    </Alert>
                )}
            </div>
        </section>
    );
}
