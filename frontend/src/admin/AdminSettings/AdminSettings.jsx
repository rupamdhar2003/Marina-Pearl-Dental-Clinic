import { useEffect, useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import '../AdminShell/AdminCommon.css';
import '../AdminDoctors/AdminDoctors.css';
import './AdminSettings.css';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function AdminSettings() {
    const [state, setState] = useState(null);
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);

    async function load() {
        setState(null);
        try {
            const r = await api.staffSettings();
            setState({ clinic_hours: r.settings.clinic_hours, holidays: r.holidays });
        } catch (e) {
            setMsg({ variant: 'error', text: e.message });
        }
    }
    useEffect(() => { load(); }, []);

    function updHours(day, part, val) {
        setState((s) => ({ ...s, clinic_hours: {
            ...s.clinic_hours, [day]: { ...(s.clinic_hours[day] || {open:'09:00',close:'21:00'}), [part]: val },
        }}));
    }
    function toggleDay(day) {
        setState((s) => ({ ...s, clinic_hours: {
            ...s.clinic_hours,
            [day]: s.clinic_hours[day] ? null : { open: '09:00', close: '21:00' },
        }}));
    }
    function addHoliday() {
        setState((s) => ({ ...s, holidays: [...s.holidays, { date: '', reason: '' }] }));
    }
    function updHoliday(i, k, v) {
        setState((s) => {
            const list = s.holidays.slice();
            list[i] = { ...list[i], [k]: v };
            return { ...s, holidays: list };
        });
    }
    function delHoliday(i) {
        setState((s) => ({ ...s, holidays: s.holidays.filter((_, x) => x !== i) }));
    }

    async function save() {
        setBusy(true); setMsg(null);
        try {
            await api.staffUpdateSettings({
                clinic_hours: state.clinic_hours,
                holidays: state.holidays.filter((h) => /^\d{4}-\d{2}-\d{2}$/.test(h.date)),
            });
            setMsg({ variant: 'success', text: 'Settings saved.' });
        } catch (e) { setMsg({ variant: 'error', text: e.message }); }
        finally { setBusy(false); }
    }

    if (!state) return <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>;

    return (
        <>
            <div className="mp-admpage__head">
                <div>
                    <h1>Settings</h1>
                    <p>Clinic-wide hours and holidays.</p>
                </div>
                <Button variant="primary" onClick={save} loading={busy} leftIcon={<Save size={16} />}>
                    Save changes
                </Button>
            </div>

            {msg && <Alert variant={msg.variant}>{msg.text}</Alert>}

            <div className="mp-set__grid">
                <div className="mp-admcard">
                    <h2 className="mp-set__h2">Clinic hours</h2>
                    <p className="mp-help">These are the default hours used for new doctors. Individual doctors can override in their profile.</p>
                    <div className="mp-hours" style={{ marginBlockStart: '1rem' }}>
                        {DAYS.map((label, i) => {
                            const hrs = state.clinic_hours[i];
                            return (
                                <div key={i} className={`mp-hour ${!hrs ? 'is-off' : ''}`}>
                                    <div className="mp-hour__day">
                                        <input type="checkbox" checked={!!hrs} onChange={() => toggleDay(i)} />
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

                <div className="mp-admcard">
                    <h2 className="mp-set__h2">Holidays</h2>
                    <p className="mp-help">On holiday dates, no slots are shown to patients across all doctors.</p>
                    <div className="mp-holidays">
                        {state.holidays.length === 0 && (
                            <p style={{ color: 'var(--mp-ink-500)' }}>No holidays scheduled.</p>
                        )}
                        {state.holidays.map((h, i) => (
                            <div key={i} className="mp-holiday">
                                <input type="date" className="mp-input" value={h.date}
                                       onChange={(e) => updHoliday(i, 'date', e.target.value)} />
                                <input className="mp-input" placeholder="Reason (optional)" value={h.reason || ''}
                                       onChange={(e) => updHoliday(i, 'reason', e.target.value)} />
                                <button className="mp-holiday__del" onClick={() => delHoliday(i)} aria-label="Remove">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <Button variant="secondary" leftIcon={<Plus size={14} />} size="sm" onClick={addHoliday}
                            style={{ marginBlockStart: '0.75rem' }}>
                        Add holiday
                    </Button>
                </div>
            </div>
        </>
    );
}
