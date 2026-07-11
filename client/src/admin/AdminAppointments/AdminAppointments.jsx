import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Ban, XCircle, UserX, Plus } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import { formatDubai } from '../../lib/format.js';
import WalkInModal from './WalkInModal.jsx';
import '../AdminShell/AdminCommon.css';
import './AdminAppointments.css';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

export default function AdminAppointments() {
    const [appts, setAppts] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [filters, setFilters] = useState({ doctor_id: '', service_id: '', status: '' });
    const [msg, setMsg] = useState(null);
    const [modal, setModal] = useState(false);

    async function load() {
        setAppts(null);
        try {
            const q = {};
            if (filters.doctor_id) q.doctor_id = filters.doctor_id;
            if (filters.service_id) q.service_id = filters.service_id;
            if (filters.status) q.status = filters.status;
            const r = await api.staffAppointments(q);
            setAppts(r.appointments || []);
        } catch (e) {
            setMsg({ variant: 'error', text: e.message });
            setAppts([]);
        }
    }

    useEffect(() => {
        (async () => {
            const [d, s] = await Promise.all([api.staffDoctors(), api.staffServices()]);
            setDoctors(d.doctors || []);
            setServices(s.services || []);
        })();
    }, []);

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filters]);

    async function changeStatus(id, status) {
        try {
            await api.staffUpdateAppt(id, { status });
            await load();
        } catch (e) { alert(e.message); }
    }

    const groups = useMemo(() => {
        if (!appts) return [];
        const map = new Map();
        for (const a of appts) {
            const key = formatDubai(a.start_time, 'EEEE, d MMM');
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(a);
        }
        return [...map.entries()];
    }, [appts]);

    return (
        <>
            <div className="mp-admpage__head">
                <div>
                    <h1>Appointments</h1>
                    <p>Filter and manage bookings across the clinic.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setModal(true)}>
                    Walk-in booking
                </Button>
            </div>

            {msg && <Alert variant={msg.variant}>{msg.text}</Alert>}

            <div className="mp-admcard mp-apt__filters">
                <div className="mp-field">
                    <label className="mp-label" htmlFor="f-doc">Doctor</label>
                    <select id="f-doc" className="mp-select" value={filters.doctor_id}
                            onChange={(e) => setFilters((f) => ({ ...f, doctor_id: e.target.value }))}>
                        <option value="">All doctors</option>
                        {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <div className="mp-field">
                    <label className="mp-label" htmlFor="f-svc">Service</label>
                    <select id="f-svc" className="mp-select" value={filters.service_id}
                            onChange={(e) => setFilters((f) => ({ ...f, service_id: e.target.value }))}>
                        <option value="">All services</option>
                        {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="mp-field">
                    <label className="mp-label" htmlFor="f-st">Status</label>
                    <select id="f-st" className="mp-select" value={filters.status}
                            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
                        <option value="">All statuses</option>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {!appts ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>
            ) : appts.length === 0 ? (
                <div className="mp-admcard" style={{ textAlign: 'center', color: 'var(--mp-ink-500)' }}>
                    No appointments match the current filters.
                </div>
            ) : (
                <div className="mp-apt__list">
                    {groups.map(([day, list]) => (
                        <div key={day} className="mp-apt__group">
                            <h3 className="mp-apt__daylbl">{day}</h3>
                            <div className="mp-admtable-wrap">
                                <table className="mp-admtable">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Patient</th>
                                            <th>Service</th>
                                            <th>Doctor</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'end' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {list.map((a) => (
                                            <tr key={a.id}>
                                                <td><strong>{formatDubai(a.start_time, 'HH:mm')}</strong></td>
                                                <td>
                                                    {a.patient_name}
                                                    <br />
                                                    <small style={{ color: 'var(--mp-ink-500)' }}>
                                                        {a.patient_email} · {a.patient_phone}
                                                    </small>
                                                </td>
                                                <td>{a.service?.name}</td>
                                                <td>{a.doctor?.name}</td>
                                                <td><span className={`mp-admchip is-${a.status}`}>{a.status}</span></td>
                                                <td style={{ textAlign: 'end' }}>
                                                    <div className="mp-apt__actions">
                                                        <button className="mp-apt__act" title="Confirm"
                                                                onClick={() => changeStatus(a.id, 'confirmed')} aria-label="Confirm">
                                                            <CheckCircle2 size={16} />
                                                        </button>
                                                        <button className="mp-apt__act" title="Complete"
                                                                onClick={() => changeStatus(a.id, 'completed')} aria-label="Complete">
                                                            <CheckCircle2 size={16} style={{ color: 'var(--mp-success)' }} />
                                                        </button>
                                                        <button className="mp-apt__act" title="No-show"
                                                                onClick={() => changeStatus(a.id, 'no_show')} aria-label="No-show">
                                                            <UserX size={16} />
                                                        </button>
                                                        <button className="mp-apt__act mp-apt__act--danger" title="Cancel"
                                                                onClick={() => changeStatus(a.id, 'cancelled')} aria-label="Cancel">
                                                            <XCircle size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <WalkInModal
                    doctors={doctors}
                    services={services}
                    onClose={() => setModal(false)}
                    onCreated={() => { setModal(false); load(); setMsg({ variant: 'success', text: 'Walk-in added.' }); }}
                />
            )}
        </>
    );
}
