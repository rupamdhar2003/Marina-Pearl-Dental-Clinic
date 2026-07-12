import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Globe } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import SectionHead from '../../components/SectionHead/SectionHead.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import './Doctors.css';

const FALLBACK = [
    { id: '1', name: 'Dr. Farah Al Zaabi', credentials: 'BDS, MSc',
      specialty: 'Cosmetic & Restorative (Clinical Director)',
      bio: 'A decade of experience in aesthetic and restorative dentistry.',
      photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800',
      languages: ['English', 'Arabic'] },
    { id: '2', name: 'Dr. Nikhil Chandran', credentials: 'BDS, MDS',
      specialty: 'Orthodontics & Invisalign',
      bio: 'Certified Invisalign provider with a focus on adult orthodontics.',
      photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800',
      languages: ['English', 'Hindi', 'Malayalam'] },
    { id: '3', name: 'Dr. Elena Rossi', credentials: 'DDS',
      specialty: 'Pediatric & Preventive',
      bio: 'Gentle, child-first approach.',
      photo_url: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=800',
      languages: ['English', 'Italian'] },
];

export default function Doctors() {
    const [doctors, setDoctors] = useState(null);

    useEffect(() => {
        api.doctors()
            .then((r) => setDoctors(r.doctors || FALLBACK))
            .catch(() => setDoctors(FALLBACK));
    }, []);

    return (
        <>
            <section className="mp-drs-hero">
                <div className="mp-container">
                    <span className="mp-eyebrow">Meet the team</span>
                    <h1 className="mp-hero-title">Three specialists. <em>One clinic.</em></h1>
                    <p className="mp-lead">
                        Every treatment at Marina Pearl is planned and delivered by a specialist in that discipline —
                        no hand-offs, no assistants doing the actual work.
                    </p>
                </div>
            </section>

            <section>
                <div className="mp-container">
                    {!doctors ? (
                        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
                    ) : (
                        <div className="mp-drs-grid">
                            {doctors.map((d) => (
                                <article key={d.id} className="mp-dr-card">
                                    <div className="mp-dr-card__photo">
                                        <img src={d.photo_url} alt={`Portrait of ${d.name}`} loading="lazy" />
                                    </div>
                                    <div className="mp-dr-card__body">
                                        <span className="mp-dr-card__cred">{d.credentials}</span>
                                        <h2>{d.name}</h2>
                                        <p className="mp-dr-card__spec">{d.specialty}</p>
                                        <p className="mp-dr-card__bio">{d.bio}</p>
                                        <div className="mp-dr-card__langs">
                                            <Globe size={14} aria-hidden="true" />
                                            {d.languages?.join(' · ')}
                                        </div>
                                        <div className="mp-dr-card__actions">
                                            <Button as={Link} to={`/doctors/${d.id}`} variant="secondary" size="sm">
                                                Read profile
                                            </Button>
                                            <Button as={Link} to={`/book?doctor=${d.id}`} variant="primary" size="sm"
                                                    rightIcon={<ArrowRight size={14} />}>
                                                Book with {d.name.split(' ')[1]}
                                            </Button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <section className="mp-band">
                <div className="mp-container">
                    <SectionHead
                        eyebrow="Not sure who to see?"
                        title={<>Pick <em>"Any available"</em> and we'll match you.</>}
                        subtitle="At booking, choose 'Any available doctor' and our system will assign the earliest-available specialist appropriate for your treatment."
                    />
                    <Button as={Link} to="/book" variant="primary" rightIcon={<ArrowRight size={16} />}>
                        Start booking
                    </Button>
                </div>
            </section>
        </>
    );
}
