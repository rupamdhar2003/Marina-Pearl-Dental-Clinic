import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import { api } from '../../lib/api.js';
import { z } from 'zod';

const schema = z.object({
    service_id:    z.string().uuid('Choose a service'),
    doctor_id:     z.string().uuid('Choose a doctor'),
    start_time:    z.string().min(1, 'Pick a start time'),
    patient_name:  z.string().min(2, 'Enter a name'),
    patient_email: z.string().email('Invalid email'),
    patient_phone: z.string().min(6, 'Enter a phone number'),
    notes: z.string().optional().nullable(),
});

export default function WalkInModal({ doctors, services, onClose, onCreated }) {
    const [form, setForm] = useState({
        service_id: '', doctor_id: '', start_time: '',
        patient_name: '', patient_email: '', patient_phone: '', notes: '',
    });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);
    const [errs, setErrs] = useState({});

    function upd(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })); }

    async function submit(e) {
        e.preventDefault();
        setErr(null); setErrs({});
        const p = schema.safeParse(form);
        if (!p.success) {
            const m = {};
            p.error.issues.forEach((i) => { m[i.path[0]] = i.message; });
            setErrs(m);
            return;
        }
        setBusy(true);
        try {
            await api.staffWalkIn({
                ...p.data,
                start_time: new Date(p.data.start_time).toISOString(),
                notes: p.data.notes || null,
            });
            onCreated();
        } catch (e) {
            setErr(e.message);
        } finally { setBusy(false); }
    }

    return (
        <div className="mp-modal" role="dialog" aria-modal="true">
            <div className="mp-modal__backdrop" onClick={onClose} />
            <div className="mp-modal__panel">
                <div className="mp-modal__head">
                    <h2>Walk-in booking</h2>
                    <button className="mp-modal__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
                </div>
                <form className="mp-modal__form" onSubmit={submit}>
                    {err && <Alert variant="error">{err}</Alert>}
                    <div className="mp-field">
                        <label className="mp-label" htmlFor="w-svc">Service</label>
                        <select id="w-svc" className="mp-select" value={form.service_id} onChange={upd('service_id')}
                                aria-invalid={!!errs.service_id}>
                            <option value="">Choose…</option>
                            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        {errs.service_id && <span className="mp-error-text">{errs.service_id}</span>}
                    </div>
                    <div className="mp-field">
                        <label className="mp-label" htmlFor="w-doc">Doctor</label>
                        <select id="w-doc" className="mp-select" value={form.doctor_id} onChange={upd('doctor_id')}
                                aria-invalid={!!errs.doctor_id}>
                            <option value="">Choose…</option>
                            {doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        {errs.doctor_id && <span className="mp-error-text">{errs.doctor_id}</span>}
                    </div>
                    <div className="mp-field">
                        <label className="mp-label" htmlFor="w-when">Start time (Dubai)</label>
                        <input id="w-when" type="datetime-local" className="mp-input" value={form.start_time}
                               onChange={upd('start_time')} aria-invalid={!!errs.start_time} />
                        {errs.start_time && <span className="mp-error-text">{errs.start_time}</span>}
                    </div>
                    <div className="mp-field">
                        <label className="mp-label" htmlFor="w-name">Patient name</label>
                        <input id="w-name" className="mp-input" value={form.patient_name} onChange={upd('patient_name')}
                               aria-invalid={!!errs.patient_name} />
                        {errs.patient_name && <span className="mp-error-text">{errs.patient_name}</span>}
                    </div>
                    <div className="mp-modal__row">
                        <div className="mp-field">
                            <label className="mp-label" htmlFor="w-email">Email</label>
                            <input id="w-email" type="email" className="mp-input" value={form.patient_email}
                                   onChange={upd('patient_email')} aria-invalid={!!errs.patient_email} />
                            {errs.patient_email && <span className="mp-error-text">{errs.patient_email}</span>}
                        </div>
                        <div className="mp-field">
                            <label className="mp-label" htmlFor="w-phone">Phone</label>
                            <input id="w-phone" className="mp-input" value={form.patient_phone} onChange={upd('patient_phone')}
                                   aria-invalid={!!errs.patient_phone} />
                            {errs.patient_phone && <span className="mp-error-text">{errs.patient_phone}</span>}
                        </div>
                    </div>
                    <div className="mp-field">
                        <label className="mp-label" htmlFor="w-notes">Notes (optional)</label>
                        <textarea id="w-notes" className="mp-textarea" rows={3} value={form.notes} onChange={upd('notes')} />
                    </div>
                    <div className="mp-modal__actions">
                        <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
                        <Button variant="primary" type="submit" loading={busy}>Create booking</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
