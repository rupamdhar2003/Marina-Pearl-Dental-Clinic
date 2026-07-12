import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Globe, GraduationCap, Sparkles } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import './DoctorDetail.css';

export default function DoctorDetail() {
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.doctors()
            .then((r) => {
                const d = (r.doctors || []).find((x) => x.id === id);
                if (!d) setError('not found'); else setDoctor(d);
            })
            .catch(() => setError('offline'));
    }, [id]);

    if (error === 'not found') {
        return (
            <div className="mp-container mp-drd__err">
                <p>Doctor not found.</p>
                <Button as={Link} to="/doctors" variant="secondary">Back to team</Button>
            </div>
        );
    }
    if (!doctor) return <div className="mp-container" style={{ paddingBlock: '4rem' }}><Spinner /></div>;

    return (
        <section className="mp-drd">
            <div className="mp-container mp-drd__grid">
                <div className="mp-drd__media">
                    <img src={doctor.photo_url} alt={doctor.name} />
                </div>
                <div className="mp-drd__body">
                    <Link to="/doctors" className="mp-back">
                        <ChevronLeft size={16} /> All dentists
                    </Link>
                    <span className="mp-eyebrow">{doctor.credentials}</span>
                    <h1 className="mp-hero-title">{doctor.name}</h1>
                    <p className="mp-drd__spec">{doctor.specialty}</p>
                    <p className="mp-drd__bio">{doctor.bio}</p>

                    <div className="mp-drd__facts">
                        <div>
                            <GraduationCap size={16} aria-hidden="true" />
                            <div>
                                <span className="mp-drd__fact-lbl">Credentials</span>
                                <span className="mp-drd__fact-val">{doctor.credentials}</span>
                            </div>
                        </div>
                        <div>
                            <Sparkles size={16} aria-hidden="true" />
                            <div>
                                <span className="mp-drd__fact-lbl">Focus</span>
                                <span className="mp-drd__fact-val">{doctor.specialty}</span>
                            </div>
                        </div>
                        <div>
                            <Globe size={16} aria-hidden="true" />
                            <div>
                                <span className="mp-drd__fact-lbl">Languages</span>
                                <span className="mp-drd__fact-val">{(doctor.languages || ['English']).join(' · ')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mp-drd__ctas">
                        <Button as={Link} to={`/book?doctor=${doctor.id}`} variant="primary" size="lg"
                                rightIcon={<ArrowRight size={18} />}>
                            Book with {doctor.name.split(' ')[1]}
                        </Button>
                        <Button as={Link} to="/contact" variant="secondary" size="lg">Ask a question</Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
