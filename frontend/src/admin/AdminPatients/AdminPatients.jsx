import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import { formatDubai } from '../../lib/format.js';
import '../AdminShell/AdminCommon.css';
import './AdminPatients.css';

export default function AdminPatients() {
    const [patients, setPatients] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const h = setTimeout(() => {
            setPatients(null);
            api.staffPatients(search).then((r) => setPatients(r.patients || [])).catch(() => setPatients([]));
        }, 200);
        return () => clearTimeout(h);
    }, [search]);

    return (
        <>
            <div className="mp-admpage__head">
                <div>
                    <h1>Patients</h1>
                    <p>Derived from booking records. Search by name, email, or phone.</p>
                </div>
                <div className="mp-patients__search">
                    <Search size={16} aria-hidden="true" />
                    <input className="mp-input" placeholder="Search patients…"
                           value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {!patients ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}><Spinner /></div>
            ) : patients.length === 0 ? (
                <div className="mp-admcard" style={{ textAlign: 'center', color: 'var(--mp-ink-500)' }}>
                    No patients found.
                </div>
            ) : (
                <div className="mp-admtable-wrap">
                    <table className="mp-admtable">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Visits</th>
                                <th>Last visit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map((p) => (
                                <tr key={p.email}>
                                    <td><strong>{p.name}</strong></td>
                                    <td>{p.email}</td>
                                    <td>{p.phone}</td>
                                    <td>{p.visits}</td>
                                    <td>{formatDubai(p.lastVisit, 'd MMM yyyy')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}
