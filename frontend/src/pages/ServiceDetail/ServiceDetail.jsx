import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Clock, Check } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import { formatPriceRange } from '../../lib/format.js';
import './ServiceDetail.css';

const SVC_LONG = {
    'checkup-cleaning': {
        hero: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1200&auto=format&fit=crop',
        long: 'A comprehensive dental checkup includes a full-mouth exam, panoramic X-rays where indicated, ultrasonic scaling to remove tartar, and a fluoride polish. We finish with tailored advice on brushing technique and any early risks we\'ve spotted.',
        includes: ['Full-mouth exam', 'Ultrasonic scaling', 'Polish & fluoride', 'Oral cancer screening', 'Written follow-up plan'],
    },
    'cosmetic': {
        hero: 'https://images.unsplash.com/photo-1588776814546-7c8b23c1c7f9?w=1200&auto=format&fit=crop',
        long: 'Cosmetic work at Marina Pearl starts with a smile design consult. We take a 3D scan, walk through veneer, whitening or bonding options, and preview the outcome digitally before any tooth is touched.',
        includes: ['Digital smile design', 'Porcelain veneers', 'In-office whitening', 'Composite bonding', 'Preview mock-up'],
    },
    'orthodontics': {
        hero: 'https://images.unsplash.com/photo-1606811842093-3a91d4e8ea7c?w=1200&auto=format&fit=crop',
        long: 'Dr. Nikhil is a certified Invisalign provider. Treatment plans are shared before you commit, with monthly check-ins that can be done in the clinic or by video call.',
        includes: ['Invisalign & clear aligners', 'Traditional braces', 'Retainer planning', 'Monthly progress reviews', 'Adult and teen options'],
    },
    'implants': {
        hero: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&auto=format&fit=crop',
        long: 'Titanium fixtures placed with guided surgery and topped with CAD-designed crowns. From single-tooth implants to full-arch rehabilitation.',
        includes: ['Guided surgery', 'CAD-designed crowns', 'Bone-graft options', 'Full-arch rehabilitation', '5-year warranty'],
    },
    'pediatric': {
        hero: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?w=1200&auto=format&fit=crop',
        long: 'A child-first environment. Dr. Elena uses tell-show-do techniques, and every appointment ends with a fluoride varnish and a small win to celebrate.',
        includes: ['Preventive check-ups', 'Fissure sealants', 'Fluoride varnish', 'Tell-show-do approach', 'Habit counseling'],
    },
    'root-canal': {
        hero: 'https://images.unsplash.com/photo-1588776814546-7c8b23c1c7f9?w=1200&auto=format&fit=crop',
        long: 'Modern endodontics with rotary instrumentation and anaesthesia protocols that keep pain to a whisper. Most cases finish in one visit.',
        includes: ['Rotary endodontics', 'Digital apex locator', 'One-visit treatment (most cases)', 'Crown planning', 'Follow-up X-ray'],
    },
    'emergency': {
        hero: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=1200&auto=format&fit=crop',
        long: 'Call the clinic on +971 4 000 0000 for same-day emergency slots. Broken tooth, lost crown, sudden pain — we\'ll see you today.',
        includes: ['Same-day slots', 'Pain management', 'Temporary restorations', 'Trauma triage', '24/7 WhatsApp triage'],
    },
};

export default function ServiceDetail() {
    const { slug } = useParams();
    const [service, setService] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.services()
            .then((r) => {
                const s = (r.services || []).find((x) => x.slug === slug);
                if (!s) setError('not found'); else setService(s);
            })
            .catch(() => setError('offline'));
    }, [slug]);

    const long = SVC_LONG[slug];

    if (error === 'not found') {
        return (
            <div className="mp-container mp-svc-detail__err">
                <p>Service not found.</p>
                <Button as={Link} to="/services" variant="secondary">Back to services</Button>
            </div>
        );
    }
    if (!service && !error) return <div className="mp-container" style={{ paddingBlock: '4rem' }}><Spinner /></div>;

    const s = service || { name: slug, description: '', duration_min: 30, price_min_aed: 0, price_max_aed: 0 };

    return (
        <>
            <section className="mp-svc-detail__hero">
                <div className="mp-container mp-svc-detail__grid">
                    <div className="mp-svc-detail__copy">
                        <Link to="/services" className="mp-back">
                            <ChevronLeft size={16} /> All treatments
                        </Link>
                        <span className="mp-eyebrow">Treatment</span>
                        <h1 className="mp-hero-title">{s.name}</h1>
                        <p className="mp-lead">{s.description}</p>
                        <div className="mp-svc-detail__meta">
                            <span className="mp-chip mp-chip--gold">{formatPriceRange(s.price_min_aed, s.price_max_aed)}</span>
                            <span className="mp-chip"><Clock size={13} /> {s.duration_min} min</span>
                        </div>
                        <div className="mp-svc-detail__ctas">
                            <Button as={Link} to={`/book?service=${slug}`} variant="primary" size="lg"
                                    rightIcon={<ArrowRight size={18} />}>Book this treatment</Button>
                            <Button as={Link} to="/contact" variant="secondary" size="lg">Ask a question</Button>
                        </div>
                    </div>
                    <div className="mp-svc-detail__media">
                        <img src={long?.hero || 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1200'}
                             alt={s.name} loading="eager" />
                    </div>
                </div>
            </section>

            {long && (
                <section>
                    <div className="mp-container mp-svc-detail__body">
                        <div>
                            <h2>What to expect</h2>
                            <p>{long.long}</p>
                        </div>
                        <div>
                            <h2>Included</h2>
                            <ul className="mp-svc-detail__list">
                                {long.includes.map((i) => (
                                    <li key={i}><Check size={16} /> {i}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
