import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import SectionHead from '../../components/SectionHead/SectionHead.jsx';
import Spinner from '../../components/Spinner/Spinner.jsx';
import { api } from '../../lib/api.js';
import { formatPriceRange } from '../../lib/format.js';
import './Services.css';

const FALLBACK = [
    { slug: 'checkup-cleaning', name: 'General Checkup & Cleaning',
      description: 'Comprehensive exam, scaling, polishing and personalised advice.', duration_min: 45, price_min_aed: 250, price_max_aed: 450 },
    { slug: 'cosmetic', name: 'Cosmetic Dentistry',
      description: 'Veneers, professional whitening and smile design.', duration_min: 60, price_min_aed: 1200, price_max_aed: 6500 },
    { slug: 'orthodontics', name: 'Orthodontics (Invisalign & Braces)',
      description: 'Clear aligners and traditional braces.', duration_min: 45, price_min_aed: 8000, price_max_aed: 22000 },
    { slug: 'implants', name: 'Dental Implants',
      description: 'Single-tooth or full-arch implants.', duration_min: 90, price_min_aed: 5500, price_max_aed: 14000 },
    { slug: 'pediatric', name: 'Pediatric Dentistry',
      description: 'Gentle, playful care for children age 2+.', duration_min: 30, price_min_aed: 200, price_max_aed: 700 },
    { slug: 'root-canal', name: 'Root Canal Therapy',
      description: 'Modern endodontics with rotary tools.', duration_min: 75, price_min_aed: 1500, price_max_aed: 3500 },
    { slug: 'emergency', name: 'Emergency Dental Care',
      description: 'Same-day appointments for pain or trauma.', duration_min: 45, price_min_aed: 400, price_max_aed: 1500 },
];

export default function Services() {
    const [services, setServices] = useState(null);

    useEffect(() => {
        api.services()
            .then((r) => setServices(r.services || FALLBACK))
            .catch(() => setServices(FALLBACK));
    }, []);

    return (
        <>
            <section className="mp-svc-hero">
                <div className="mp-container">
                    <span className="mp-eyebrow">Treatments</span>
                    <h1 className="mp-hero-title">Every treatment, <em>planned around you.</em></h1>
                    <p className="mp-lead">
                        From routine cleanings to full-arch implants, our specialists offer transparent AED pricing and a
                        written plan before any treatment begins.
                    </p>
                </div>
            </section>

            <section>
                <div className="mp-container">
                    {!services ? (
                        <div className="mp-svc-loading"><Spinner /></div>
                    ) : (
                        <ul className="mp-svc-list">
                            {services.map((s) => (
                                <li key={s.slug} className="mp-svc-row">
                                    <div className="mp-svc-row__main">
                                        <div className="mp-svc-row__meta">
                                            <span className="mp-chip mp-chip--gold">{formatPriceRange(s.price_min_aed, s.price_max_aed)}</span>
                                            <span className="mp-svc-row__dur">
                                                <Clock size={14} aria-hidden="true" /> {s.duration_min} min
                                            </span>
                                        </div>
                                        <h2>{s.name}</h2>
                                        <p>{s.description}</p>
                                    </div>
                                    <div className="mp-svc-row__actions">
                                        <Button as={Link} to={`/services/${s.slug}`} variant="secondary">
                                            Learn more
                                        </Button>
                                        <Button as={Link} to={`/book?service=${s.slug}`} variant="primary"
                                                rightIcon={<ArrowRight size={16} />}>
                                            Book
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section className="mp-band">
                <div className="mp-container mp-svc-inclusion">
                    <SectionHead
                        eyebrow="What's included"
                        title="Every treatment includes the following, at no extra charge."
                    />
                    <div className="mp-svc-inclusion__grid">
                        {[
                            { title: 'Digital intraoral scan', body: 'No goopy impressions. Ever.' },
                            { title: 'Written treatment plan', body: 'A quote before we start work.' },
                            { title: 'Insurance direct-billing', body: 'Daman, AXA, Allianz supported.' },
                            { title: 'Same-day follow-up', body: 'A WhatsApp check-in after any procedure.' },
                        ].map((f) => (
                            <div key={f.title} className="mp-svc-inclusion__item">
                                <Sparkles size={18} aria-hidden="true" />
                                <div>
                                    <h4>{f.title}</h4>
                                    <p>{f.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}
