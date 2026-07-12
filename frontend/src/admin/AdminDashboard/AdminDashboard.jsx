import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, Users, Wallet, ArrowRight } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import { formatDubai } from '../../lib/format.js';
import '../AdminShell/AdminCommon.css';

export default function AdminDashboard() {
    const [data, setData] = useState(null);

    useEffect(() => {
        api.staffDashboard().then(setData).catch(() => setData({ weekCount: 0, todayCount: 0, todaySchedule: [], estWeekRevenueAed: 0 }));
    }, []);

    if (!data) return <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>;

    return (
        <>
            <div className="mp-admpage__head">
                <div>
                    <h1>Dashboard</h1>
                    <p>Overview of today and the current week.</p>
                </div>
                <Button as={Link} to="/admin/appointments" variant="secondary" rightIcon={<ArrowRight size={14} />}>
                    See all appointments
                </Button>
            </div>

            <div className="mp-admstat-grid">
                <div className="mp-admstat">
                    <CalendarDays size={18} className="mp-admstat__icon" />
                    <span className="mp-admstat__lbl">This week</span>
                    <span className="mp-admstat__val">{data.weekCount}</span>
                    <span className="mp-admstat__sub">appointments booked</span>
                </div>
                <div className="mp-admstat">
                    <Clock size={18} className="mp-admstat__icon" />
                    <span className="mp-admstat__lbl">Today</span>
                    <span className="mp-admstat__val">{data.todayCount}</span>
                    <span className="mp-admstat__sub">on the schedule</span>
                </div>
                <div className="mp-admstat">
                    <Wallet size={18} className="mp-admstat__icon" />
                    <span className="mp-admstat__lbl">Est. week revenue</span>
                    <span className="mp-admstat__val">AED {(data.estWeekRevenueAed || 0).toLocaleString()}</span>
                    <span className="mp-admstat__sub">from confirmed price minimums</span>
                </div>
                <div className="mp-admstat">
                    <Users size={18} className="mp-admstat__icon" />
                    <span className="mp-admstat__lbl">Team</span>
                    <span className="mp-admstat__val">3</span>
                    <span className="mp-admstat__sub">active specialists</span>
                </div>
            </div>

            <div className="mp-admcard">
                <div className="mp-admpage__head" style={{ padding: 0, border: 0, marginBottom: '1rem' }}>
                    <h2 style={{ fontFamily: 'var(--mp-font-heading)', fontSize: '1.25rem', fontWeight: 500 }}>
                        Today&apos;s schedule
                    </h2>
                </div>
                {data.todaySchedule.length === 0 ? (
                    <p style={{ color: 'var(--mp-ink-500)' }}>No appointments left today.</p>
                ) : (
                    <div className="mp-admtable-wrap" style={{ border: 0 }}>
                        <table className="mp-admtable">
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Patient</th>
                                    <th>Service</th>
                                    <th>Doctor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.todaySchedule.map((a) => (
                                    <tr key={a.id}>
                                        <td><strong>{formatDubai(a.start_time, 'HH:mm')}</strong></td>
                                        <td>{a.patient_name}</td>
                                        <td>{a.service?.name}</td>
                                        <td>{a.doctor?.name}</td>
                                        <td><span className={`mp-admchip is-${a.status}`}>{a.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
}
