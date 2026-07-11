import { useEffect, useMemo, useState } from 'react';
import { addDays, startOfDay, format as fmt, isSameDay, startOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as Cal } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import { formatDubai } from '../../lib/format.js';
import '../AdminShell/AdminCommon.css';
import './AdminCalendar.css';

const HOURS = Array.from({ length: 13 }).map((_, i) => 9 + i); // 9..21

export default function AdminCalendar() {
    const [view, setView] = useState('week'); // day | week
    const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
    const [appts, setAppts] = useState(null);

    const range = useMemo(() => {
        if (view === 'day') return { from: anchor, to: addDays(anchor, 1) };
        const start = startOfWeek(anchor, { weekStartsOn: 6 });
        return { from: start, to: addDays(start, 7) };
    }, [anchor, view]);

    useEffect(() => {
        setAppts(null);
        api.staffAppointments({
            from: range.from.toISOString(),
            to:   range.to.toISOString(),
        }).then((r) => setAppts(r.appointments || [])).catch(() => setAppts([]));
    }, [range.from, range.to]);

    const days = useMemo(() => {
        if (view === 'day') return [anchor];
        const start = startOfWeek(anchor, { weekStartsOn: 6 });
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [anchor, view]);

    function shift(delta) {
        setAnchor((a) => addDays(a, view === 'day' ? delta : delta * 7));
    }

    return (
        <>
            <div className="mp-admpage__head">
                <div>
                    <h1>Calendar</h1>
                    <p>Day and week views of appointments.</p>
                </div>
                <div className="mp-cal__toolbar">
                    <div className="mp-cal__viewsw" role="tablist">
                        <button role="tab" aria-selected={view === 'day'}
                                className={view === 'day' ? 'is-on' : ''}
                                onClick={() => setView('day')}>Day</button>
                        <button role="tab" aria-selected={view === 'week'}
                                className={view === 'week' ? 'is-on' : ''}
                                onClick={() => setView('week')}>Week</button>
                    </div>
                    <div className="mp-cal__nav">
                        <button className="mp-cal__navbtn" onClick={() => shift(-1)} aria-label="Previous">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="mp-cal__label">
                            <Cal size={14} /> {fmt(range.from, 'd MMM')} {view === 'week' ? `— ${fmt(addDays(range.from, 6), 'd MMM')}` : ''}
                        </span>
                        <button className="mp-cal__navbtn" onClick={() => shift(1)} aria-label="Next">
                            <ChevronRight size={16} />
                        </button>
                        <Button variant="ghost" size="sm" onClick={() => setAnchor(startOfDay(new Date()))}>Today</Button>
                    </div>
                </div>
            </div>

            {!appts ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>
            ) : (
                <div className={`mp-cal mp-cal--${view}`} style={{ gridTemplateColumns: `60px repeat(${days.length}, 1fr)` }}>
                    <div className="mp-cal__cornr" />
                    {days.map((d) => (
                        <div key={d.toISOString()} className={`mp-cal__daylbl ${isSameDay(d, new Date()) ? 'is-today' : ''}`}>
                            <span>{fmt(d, 'EEE')}</span>
                            <strong>{fmt(d, 'd')}</strong>
                        </div>
                    ))}
                    {HOURS.map((h) => (
                        <FragmentRow key={h} hour={h} days={days} appts={appts} />
                    ))}
                </div>
            )}
        </>
    );
}

function FragmentRow({ hour, days, appts }) {
    return (
        <>
            <div className="mp-cal__hourlbl">{String(hour).padStart(2, '0')}:00</div>
            {days.map((d) => {
                const cellStart = new Date(d);
                cellStart.setHours(hour, 0, 0, 0);
                const cellEnd = new Date(d);
                cellEnd.setHours(hour + 1, 0, 0, 0);
                const inCell = appts.filter((a) => {
                    const s = new Date(a.start_time);
                    return s >= cellStart && s < cellEnd;
                });
                return (
                    <div className="mp-cal__cell" key={d.toISOString() + hour}>
                        {inCell.map((a) => (
                            <div key={a.id} className={`mp-cal__evt is-${a.status}`}
                                 title={`${a.patient_name} — ${a.service?.name}`}>
                                <strong>{formatDubai(a.start_time, 'HH:mm')} · {a.patient_name.split(' ')[0]}</strong>
                                <span>{a.service?.name}</span>
                            </div>
                        ))}
                    </div>
                );
            })}
        </>
    );
}
