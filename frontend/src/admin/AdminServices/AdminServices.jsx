import { useEffect, useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import { formatPriceRange } from '../../lib/format.js';
import '../AdminShell/AdminCommon.css';
import '../AdminAppointments/AdminAppointments.css';

export default function AdminServices() {
    const [services, setServices] = useState(null);
    const [editing, setEditing] = useState(null);
    const [msg, setMsg] = useState(null);

    async function load() {
        setServices(null);
        try { const r = await api.staffServices(); setServices(r.services || []); }
        catch (e) { setMsg({ variant: 'error', text: e.message }); setServices([]); }
    }
    useEffect(() => { load(); }, []);

    return (
        <>
            <div className="mp-admpage__head">
                <div>
                    <h1>Services</h1>
                    <p>Treatments, durations and AED price ranges.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setEditing('new')}>
                    Add service
                </Button>
            </div>

            {msg && <Alert variant={msg.variant}>{msg.text}</Alert>}

            {!services ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>
            ) : (
                <div className="mp-admtable-wrap">
                    <table className="mp-admtable">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Duration</th>
                                <th>Price (AED)</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'end' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((s) => (
                                <tr key={s.id}>
                                    <td><strong>{s.name}</strong></td>
                                    <td><code>{s.slug}</code></td>
                                    <td>{s.duration_min} min</td>
                                    <td>{formatPriceRange(s.price_min_aed, s.price_max_aed)}</td>
                                    <td>
                                        <span className={`mp-admchip ${s.is_active ? 'is-active' : 'is-inactive'}`}>
                                            {s.is_active ? 'active' : 'inactive'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'end' }}>
                                        <Button variant="ghost" size="sm" onClick={() => setEditing(s)}>Edit</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <ServiceForm
                    initial={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => { setEditing(null); load(); setMsg({ variant: 'success', text: 'Saved.' }); }}
                />
            )}
        </>
    );
}

function ServiceForm({ initial, onClose, onSaved }) {
    const [form, setForm] = useState(() => initial || {
        name: '', slug: '', description: '',
        duration_min: 30, price_min_aed: 0, price_max_aed: 0,
        is_active: true, sort_order: 100,
    });
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState(null);

    function upd(k, v) { setForm((f) => ({ ...f, [k]: v })); }

    async function submit(e) {
        e.preventDefault();
        setBusy(true); setErr(null);
        try {
            const payload = {
                ...form,
                duration_min:  Number(form.duration_min),
                price_min_aed: Number(form.price_min_aed),
                price_max_aed: Number(form.price_max_aed),
                sort_order:    Number(form.sort_order),
            };
            if (initial) await api.staffUpdateService(initial.id, payload);
            else         await api.staffCreateService(payload);
            onSaved();
        } catch (e) { setErr(e.message); }
        finally { setBusy(false); }
    }

    return (
        <div className="mp-modal" role="dialog" aria-modal="true">
            <div className="mp-modal__backdrop" onClick={onClose} />
            <div className="mp-modal__panel">
                <div className="mp-modal__head">
                    <h2>{initial ? 'Edit service' : 'Add service'}</h2>
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
                            <label className="mp-label">Slug</label>
                            <input className="mp-input" value={form.slug}
                                   onChange={(e) => upd('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                                   required disabled={!!initial} />
                        </div>
                    </div>
                    <div className="mp-field">
                        <label className="mp-label">Description</label>
                        <textarea className="mp-textarea" rows={3} value={form.description || ''}
                                  onChange={(e) => upd('description', e.target.value)} />
                    </div>
                    <div className="mp-modal__row">
                        <div className="mp-field">
                            <label className="mp-label">Duration (min)</label>
                            <input type="number" className="mp-input" value={form.duration_min}
                                   min={5} max={600} step={5}
                                   onChange={(e) => upd('duration_min', e.target.value)} />
                        </div>
                        <div className="mp-field">
                            <label className="mp-label">Sort order</label>
                            <input type="number" className="mp-input" value={form.sort_order}
                                   onChange={(e) => upd('sort_order', e.target.value)} />
                        </div>
                    </div>
                    <div className="mp-modal__row">
                        <div className="mp-field">
                            <label className="mp-label">Price min (AED)</label>
                            <input type="number" className="mp-input" value={form.price_min_aed}
                                   onChange={(e) => upd('price_min_aed', e.target.value)} />
                        </div>
                        <div className="mp-field">
                            <label className="mp-label">Price max (AED)</label>
                            <input type="number" className="mp-input" value={form.price_max_aed}
                                   onChange={(e) => upd('price_max_aed', e.target.value)} />
                        </div>
                    </div>
                    <label className="mp-consent" style={{ background: 'var(--mp-bg)' }}>
                        <input type="checkbox" checked={form.is_active}
                               onChange={(e) => upd('is_active', e.target.checked)} />
                        <span>Active (shown to patients)</span>
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
