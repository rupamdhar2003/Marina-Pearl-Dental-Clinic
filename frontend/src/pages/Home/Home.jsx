import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Sparkles, Clock3, Baby, Stethoscope, Smile,
    Zap, HeartPulse, Star, Quote, Phone } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import SectionHead from '../../components/SectionHead/SectionHead.jsx';
import WhatsAppIcon from '../../components/Icons/WhatsAppIcon.jsx';
import { api } from '../../lib/api.js';
import { useI18n } from '../../lib/i18n.jsx';
import './Home.css';

const SERVICES = [
    { slug: 'checkup-cleaning', name: 'Checkups & Cleaning', icon: <Stethoscope />, tag: 'From AED 250', line: 'Comprehensive exam, scaling, polishing.' },
    { slug: 'cosmetic',         name: 'Cosmetic Dentistry',  icon: <Sparkles />,    tag: 'From AED 1,200', line: 'Veneers, whitening & smile design.' },
    { slug: 'orthodontics',     name: 'Invisalign & Braces', icon: <Smile />,       tag: 'From AED 8,000', line: 'Clear aligners built around your life.' },
    { slug: 'implants',         name: 'Dental Implants',     icon: <ShieldCheck />, tag: 'From AED 5,500', line: 'Titanium fixtures with CAD crowns.' },
    { slug: 'pediatric',        name: 'Kids Dentistry',      icon: <Baby />,        tag: 'From AED 200',   line: 'Gentle care for children age 2+.' },
    { slug: 'emergency',        name: 'Emergency Care',      icon: <Zap />,         tag: 'Same day',       line: 'Same-day slots for pain or trauma.' },
];

// Fallback shown only if the API is unreachable. Real ids come from the API
// so "Read profile" links resolve to /doctors/<real-uuid>.
const DOCTOR_FALLBACK = [
    { id: 'fallback-1', name: 'Dr. Farah Al Zaabi',
      credentials: 'BDS, MSc',
      specialty: 'Cosmetic & Restorative',
      photo_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&auto=format&fit=crop' },
    { id: 'fallback-2', name: 'Dr. Nikhil Chandran',
      credentials: 'BDS, MDS',
      specialty: 'Orthodontics & Invisalign',
      photo_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop' },
    { id: 'fallback-3', name: 'Dr. Elena Rossi',
      credentials: 'DDS',
      specialty: 'Pediatric & Preventive',
      photo_url: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=800&auto=format&fit=crop' },
];

const TESTIMONIALS = [
    { name: 'Layla A.', role: 'Dubai Marina resident',
      quote: 'The most relaxed dental visit I have ever had. Dr. Farah walked me through every step and my veneers look completely natural.',
      rating: 5 },
    { name: 'Marcus W.', role: 'Expat, JLT',
      quote: 'I was terrified of getting an implant. Marina Pearl uses digital scans and everything was painless. Booked my wife the next week.',
      rating: 5 },
    { name: 'Priya S.', role: 'Mother of two',
      quote: 'My son actually asked when he can come back. Dr. Elena is magic with children — she made him feel like the hero of the appointment.',
      rating: 5 },
];

const TRUST_STATS = [
    { n: '18+', l: 'Years combined experience' },
    { n: '4,200+', l: 'Smiles restored' },
    { n: '4.9',   l: 'Google rating',
      // eslint-disable-next-line react/no-unescaped-entities
      sub: 'from 380+ reviews' },
    { n: '24/7', l: 'Emergency support' },
];

export default function Home() {
    const { t } = useI18n();
    const [doctors, setDoctors] = useState(DOCTOR_FALLBACK);

    useEffect(() => {
        api.doctors()
            .then((r) => { if (r?.doctors?.length) setDoctors(r.doctors); })
            .catch(() => { /* keep the fallback */ });
    }, []);

    return (
        <>
            {/* ---------------- HERO ---------------- */}
            <section className="mp-hero">
                <div className="mp-hero__bg" aria-hidden="true">
                    <div className="mp-hero__glow" />
                    <div className="mp-hero__grain" />
                </div>
                <div className="mp-container mp-hero__inner">
                    <div className="mp-hero__copy">
                        <span className="mp-eyebrow">{t('hero.eyebrow')}</span>
                        <h1 className="mp-hero-title mp-hero__title">
                            {t('hero.titleA')}
                            <br />
                            <em>{t('hero.titleB')}</em>
                        </h1>
                        <p className="mp-hero__sub mp-lead">{t('hero.sub')}</p>
                        <div className="mp-hero__ctas">
                            <Button as={Link} to="/book" variant="primary" size="lg"
                                rightIcon={<ArrowRight size={18} />}>
                                {t('hero.primary')}
                            </Button>
                            <Button as={Link} to="/doctors" variant="secondary" size="lg">
                                {t('hero.secondary')}
                            </Button>
                        </div>
                        <ul className="mp-hero__trust">
                            <li><ShieldCheck size={16} /> DHA-licensed clinicians</li>
                            <li><Clock3 size={16} /> Same-day emergency slots</li>
                            <li><HeartPulse size={16} /> English · Arabic · Hindi</li>
                        </ul>
                    </div>
                    <div className="mp-hero__visual">
                        <div className="mp-hero__portrait">
                            {/* REPLACE — Unsplash placeholder */}
                            <img
                                src="https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=1000&auto=format&fit=crop"
                                alt="A calm treatment room at Marina Pearl Dental."
                                loading="eager"
                            />
                            <div className="mp-hero__badge">
                                <span className="mp-hero__badge-num">4.9</span>
                                <span className="mp-hero__badge-stars">
                                    {[0,1,2,3,4].map((i) => <Star key={i} size={12} fill="currentColor" />)}
                                </span>
                                <span className="mp-hero__badge-txt">380+ reviews</span>
                            </div>
                            <div className="mp-hero__pill">
                                <span className="mp-hero__pill-dot" />
                                Booking today · 6 slots left
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------- TRUST STRIP ---------------- */}
            <section className="mp-strip">
                <div className="mp-container">
                    <ul className="mp-strip__list">
                        {TRUST_STATS.map((s) => (
                            <li key={s.l}>
                                <span className="mp-strip__num">{s.n}</span>
                                <span className="mp-strip__lbl">{s.l}</span>
                                {s.sub && <span className="mp-strip__sub">{s.sub}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ---------------- SERVICES ---------------- */}
            <section className="mp-band">
                <div className="mp-container">
                    <SectionHead
                        eyebrow="What we do"
                        title={<>Treatments planned around <em>your teeth</em>, your budget, and your calendar.</>}
                        subtitle={t('services.sub')}
                    />
                    <div className="mp-services-grid">
                        {SERVICES.map((s) => (
                            <Link key={s.slug} to={`/services/${s.slug}`} className="mp-service">
                                <span className="mp-service__icon" aria-hidden="true">{s.icon}</span>
                                <div className="mp-service__body">
                                    <h3>{s.name}</h3>
                                    <p>{s.line}</p>
                                </div>
                                <div className="mp-service__foot">
                                    <span className="mp-chip mp-chip--gold">{s.tag}</span>
                                    <ArrowRight size={18} className="mp-service__arrow" aria-hidden="true" />
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="mp-services-cta">
                        <Button as={Link} to="/services" variant="secondary" rightIcon={<ArrowRight size={16} />}>
                            {t('cta.seeAll')} treatments
                        </Button>
                    </div>
                </div>
            </section>

            {/* ---------------- APPROACH ---------------- */}
            <section>
                <div className="mp-container mp-approach">
                    <div className="mp-approach__copy">
                        <SectionHead
                            eyebrow="Our approach"
                            title={<>Boutique care, <em>obsessively planned.</em></>}
                            subtitle="Five treatment chairs. Three specialist dentists. One shared conviction: technology should make your appointment shorter and calmer, not louder."
                        />
                        <ul className="mp-approach__list">
                            <li>
                                <span className="mp-approach__num">01</span>
                                <div>
                                    <h4>Digital-first diagnostics</h4>
                                    <p>Intraoral scanners replace goopy impressions. Same-day 3D previews of aligners, crowns, and veneers.</p>
                                </div>
                            </li>
                            <li>
                                <span className="mp-approach__num">02</span>
                                <div>
                                    <h4>One dentist, one plan</h4>
                                    <p>You keep the same specialist across your treatment. No handoffs, no repeated stories.</p>
                                </div>
                            </li>
                            <li>
                                <span className="mp-approach__num">03</span>
                                <div>
                                    <h4>Transparent AED pricing</h4>
                                    <p>Every quote is written before we start. Insurance direct-billing for Daman, AXA, and Allianz.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="mp-approach__media">
                        <img
                            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&auto=format&fit=crop"
                            alt="Dental consultation with digital imaging."
                            loading="lazy"
                        />
                        <div className="mp-approach__inline">
                            <Quote size={22} aria-hidden="true" />
                            <blockquote>
                                “The point of dentistry isn't teeth. It's the day someone smiles in a photo and doesn't ask us to retake it.”
                            </blockquote>
                            <cite>Dr. Farah Al Zaabi · Clinical Director</cite>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------- DOCTORS ---------------- */}
            <section className="mp-band">
                <div className="mp-container">
                    <SectionHead
                        eyebrow="Your dentists"
                        title="Three specialists. One clinic."
                        subtitle={t('doctors.sub')}
                    />
                    <div className="mp-doctors">
                        {doctors.map((d) => (
                            <Link to={`/doctors/${d.id}`} key={d.id} className="mp-doctor">
                                <div className="mp-doctor__photo">
                                    <img src={d.photo_url} alt={`${d.name} — ${d.specialty}`} loading="lazy" />
                                    <div className="mp-doctor__overlay" aria-hidden="true">
                                        <span>Read profile</span>
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                                <div className="mp-doctor__meta">
                                    <span className="mp-doctor__cred">{d.credentials}</span>
                                    <h3>{d.name}</h3>
                                    <span className="mp-doctor__spec">{d.specialty}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------- TESTIMONIALS ---------------- */}
            <section>
                <div className="mp-container">
                    <SectionHead
                        eyebrow="Patient stories"
                        title={<>The reviews we're <em>most proud of.</em></>}
                    />
                    <div className="mp-testimonials">
                        {TESTIMONIALS.map((tm) => (
                            <figure className="mp-testimonial" key={tm.name}>
                                <div className="mp-testimonial__stars" aria-label={`${tm.rating} out of 5`}>
                                    {Array.from({ length: tm.rating }).map((_, i) => (
                                        <Star key={i} size={14} fill="currentColor" />
                                    ))}
                                </div>
                                <blockquote>“{tm.quote}”</blockquote>
                                <figcaption>
                                    <span className="mp-testimonial__name">{tm.name}</span>
                                    <span className="mp-testimonial__role">{tm.role}</span>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------------- MAP + CTA ---------------- */}
            <section className="mp-band-teal">
                <div className="mp-container mp-cta">
                    <div className="mp-cta__copy">
                        <span className="mp-eyebrow">{t('contactBlock.heading')}</span>
                        <h2>Book in under a minute.<br /><em>See us this week.</em></h2>
                        <p>Marina Plaza, Level 12, Dubai Marina. Same-day slots available for pain, trauma, or lost restorations.</p>
                        <div className="mp-cta__ctas">
                            <Button as={Link} to="/book" variant="onDark" size="lg" rightIcon={<ArrowRight size={18} />}>
                                {t('nav.book')}
                            </Button>
                            <Button as="a" href="tel:+97140000000" variant="ghost" size="lg" leftIcon={<Phone size={18} />}
                                    className="mp-cta__ghost">
                                +971 4 000 0000
                            </Button>
                            <Button as="a" href="https://wa.me/971500000000" variant="ghost" size="lg" leftIcon={<WhatsAppIcon size={18} />}
                                    className="mp-cta__ghost">
                                WhatsApp
                            </Button>
                        </div>
                    </div>
                    <div className="mp-cta__map">
                        <iframe
                            title="Marina Pearl Dental location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3610.812!2d55.14!3d25.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sDubai%20Marina!5e0!3m2!1sen!2sae!4v1700000000000"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
