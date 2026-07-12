import { useEffect, useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import '../AdminShell/AdminCommon.css';
import '../AdminAppointments/AdminAppointments.css'; // modal styles

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function emptyHours() {
    return { 0:{open:'09:00',close:'21:00'}, 1:{open:'09:00',close:'21:00'}, 2:{open:'09:00',close:'21:00'},
             3:{open:'09:00',close:'21:00'}, 4:{open:'09:00',close:'21:00'},
             5:{open:'14:00',close:'21:00'}, 6:{open:'09:00',close:'21:00'} };
}

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState(null);
    const [editing, setEditing] = useState(null); // null | 'new' | doctor object
    const [msg, setMsg] = useState(null);

    async function load() {
        setDoctors(null);
        try { const r = await api.staffDoctors(); setDoctors(r.doctors || []); }
        catch (e) { setMsg({ variant: 'error', text: e.message }); setDoctors([]); }
    }
    useEffect(() => { load(); }, []);

    return (
        <>
            <div className="mp-admpage__head">
                <div>
                    <h1>Doctors</h1>
                    <p>Manage the clinical team, working hours, and availability.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setEditing('new')}>
                    Add doctor
                </Button>
            </div>

            {msg && <Alert variant={msg.variant}>{msg.text}</Alert>}

            {!doctors ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>
            ) : (
                <div className="mp-admtable-wrap">
                    <table className="mp-admtable">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Credentials</th>
                                <th>Specialty</th>
                                <th>Languages</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'end' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((d) => (
                                <tr key={d.id}>
                                    <td><strong>{d.name}</strong></td>
                                    <td>{d.credentials}</td>
                                    <td>{d.specialty}</td>
                                    <td>{(d.languages || []).join(', ')}</td>
                                    <td>
                                        <span className={`mp-admchip ${d.is_active ? 'is-active' : 'is-inactive'}`}>
                                            {d.is_active ? 'active' : 'inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'end' }}>
                                        <Button variant="ghost" size="sm" onClick={() => setEditing(d)}>Edit</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <DoctorForm
                    initial={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => { setEditing(null); load(); setMsg({ variant: 'success', text: 'Saved.' }); }}
                />
            )}
        </>
    );
}

function DoctorForm({ initial, onClose, onSaved }) {
    const [form, setForm] = useState(() => initial ? {
        name: initial.name || '',
        credentials: initial.credentials || '',
        specialty: initial.specialty || '',
        bio: initial.bio || '',
        photo_url: initial.photo_url || '',
        languages: (initial.languages || []).join(', '),
        working_hours: initial.working_hours || emptyHours(),
        is_active: initial.is_active !== false,
    } : {
        name: '', credentials: '', specialty: '', bio: '', photo_url: '', languages: 'English',
        working_hours: emptyHours(), is_active: true,
    });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);

    function upd(k, v) { setForm((f) => ({ ...f, [k]: v })); }
    function updHours(day, part, val) {
        setForm((f) => ({
            ...f, working_hours: { ...f.working_hours, [day]: { ...(f.working_hours[day] || {open:'09:00',close:'21:00'}), [part]: val } },
        }));
    }
    function toggleDay(day) {
        setForm((f) => ({ ...f, working_hours: {
            ...f.working_hours,
            [day]: f.working_hours[day] ? null : { open: '09:00', close: '21:00' },
        }}));
    }

    async function submit(e) {
        e.preventDefault();
        setBusy(true); setErr(null);
        try {
            const payload = {
                name: form.name,
                credentials: form.credentials,
                specialty: form.specialty,
                bio: form.bio,
                photo_url: form.photo_url || null,
                languages: form.languages.split(',').map((x) => x.trim()).filter(Boolean),
                working_hours: form.working_hours,
                is_active: form.is_active,
            };
            if (initial) await api.staffUpdateDoctor(initial.id, payload);
            else         await api.staffCreateDoctor(payload);
            onSaved();
        } catch (e) { setErr(e.message); }
        finally { setBusy(false); }
    }

    return (
        <div className="mp-modal" role="dialog" aria-modal="true">
            <div className="mp-modal__backdrop" onClick={onClose} />
            <div className="mp-modal__panel">
                <div className="mp-modal__head">
                    <h2>{initial ? 'Edit doctor' : 'Add doctor'}</h2>
                    <button className="mp-modal__close" onClick={onClose}><X size={18} /></button>
                </div>
                <form className="mp-modal__form" onSubmit={submit}>
                    {err && <Alert variant="error">{err}</Alert>}
                    <div className="mp-modal__row">
                        <div className="mp-field">
                            <label className="mp-label">Name</label>
                            <input className="mp-input" value={form.name} onChange={(e) => upd('name', e.target.value)} required />
                        </div>
                        <div className="mp-field">
                            <label className="mp-label">Credentials</label>
                            <input className="mp-input" value={form.credentials} onChange={(e) => upd('credentials', e.target.value)} />
                        </div>
                    </div>
                    <div className="mp-field">
                        <label className="mp-label">Specialty</label>
                        <input className="mp-input" value={form.specialty} onChange={(e) => upd('specialty', e.target.value)} />
                    </div>
                    <div className="mp-field">
                        <label className="mp-label">Bio</label>
                        <textarea className="mp-textarea" rows={4} value={form.bio} onChange={(e) => upd('bio', e.target.value)} />
                    </div>
                    <div className="mp-modal__row">
                        <div className="mp-field">
                            <label className="mp-label">Photo URL</label>
                            <input className="mp-input" value={form.photo_url} onChange={(e) => upd('photo_url', e.target.value)}
                                   placeholder="https://…" />
                        </div>
                        <div className="mp-field">
                            <label className="mp-label">Languages (comma-separated)</label>
                            <input className="mp-input" value={form.languages} onChange={(e) => upd('languages', e.target.value)} />
                        </div>
                    </div>

                    <div className="mp-field">
                        <label className="mp-label">Working hours</label>
                        <div className="mp-hours">
                            {DAYS.map((label, i) => {
                                const hrs = form.working_hours[i];
                                return (
                                    <div key={i} className={`mp-hour ${!hrs ? 'is-off' : ''}`}>
                                        <div className="mp-hour__day">
                                            <input type="checkbox" checked={!!hrs}
                                                   onChange={() => toggleDay(i)} />
                                            <span>{label}</span>
                                        </div>
                                        {hrs && (
                                            <div className="mp-hour__times">
                                                <input type="time" className="mp-input" value={hrs.open}
                                                       onChange={(e) => updHours(i, 'open', e.target.value)} />
                                                <span>–</span>
                                                <input type="time" className="mp-input" value={hrs.close}
                                                       onChange={(e) => updHours(i, 'close', e.target.value)} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <label className="mp-consent" style={{ background: 'var(--mp-bg)' }}>
                        <input type="checkbox" checked={form.is_active}
                               onChange={(e) => upd('is_active', e.target.checked)} />
                        <span>Active (bookable by patients)</span>
                    </label>

                    <div className="mp-modal__actions">
                        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" type="submit" loading={busy} leftIcon={<Save size={16} />}>Save</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
