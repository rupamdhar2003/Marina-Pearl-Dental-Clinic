import { Link } from 'react-router-dom';
import { ArrowRight, Award, Heart, ShieldCheck, Users } from 'lucide-react';
import Button from '../../components/Button/Button.jsx';
import SectionHead from '../../components/SectionHead/SectionHead.jsx';
import './About.css';

const VALUES = [
    { icon: <Heart size={20} />,       title: 'Calm-first',
      body: 'A single-loop appointment: same room, same dentist, same nurse. No corridor hand-offs.' },
    { icon: <Award size={20} />,       title: 'Specialist-led',
      body: 'Every treatment is planned and delivered by a specialist in that discipline. No exceptions.' },
    { icon: <ShieldCheck size={20} />, title: 'Transparent quotes',
      body: 'A written estimate before any drill or scan. If we can\'t hold the price, we tell you first.' },
    { icon: <Users size={20} />,       title: 'Multilingual',
      body: 'English, Arabic, Hindi, Italian and Malayalam spoken across the team.' },
];

const TIMELINE = [
    { year: '2018', title: 'Marina Pearl opens',
      body: 'Two chairs, one dentist, and a promise: every appointment starts on time.' },
    { year: '2020', title: 'Digital-first shift',
      body: 'Retired plaster impressions. Installed intraoral scanners across all treatment rooms.' },
    { year: '2022', title: 'Team grows to three specialists',
      body: 'Dr. Nikhil joins for orthodontics; Dr. Elena joins for pediatric care.' },
    { year: '2025', title: '4,200+ smiles',
      body: 'Four out of five new patients arrive through personal referrals from existing patients.' },
];

export default function About() {
    return (
        <>
            <section className="mp-about-hero">
                <div className="mp-container">
                    <span className="mp-eyebrow">About the clinic</span>
                    <h1 className="mp-hero-title mp-about-hero__title">
                        A dental practice where <em>the treatment plan starts with a listening.</em>
                    </h1>
                    <p className="mp-lead mp-about-hero__lead">
                        Marina Pearl is a boutique, five-chair dental clinic on Level 12 of Marina Plaza. We opened
                        in 2018 with a simple hypothesis: patients don't dislike dentistry, they dislike being rushed.
                        Everything we do — the room design, the scheduling software, the way our specialists are paired
                        to a treatment — flows from that idea.
                    </p>
                </div>
            </section>

            <section>
                <div className="mp-container mp-about-story">
                    <div className="mp-about-story__media">
                        <img
                            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=900&auto=format&fit=crop"
                            alt="A treatment room at Marina Pearl."
                            loading="lazy"
                        />
                        <img
                            src="https://images.unsplash.com/photo-1606811842093-3a91d4e8ea7c?w=700&auto=format&fit=crop"
                            alt="Detail of dental equipment."
                            loading="lazy"
                            className="mp-about-story__media--sm"
                        />
                    </div>
                    <div className="mp-about-story__copy">
                        <SectionHead
                            eyebrow="The story"
                            title={<>Five chairs. Three specialists. <em>One promise.</em></>}
                            subtitle="We chose Dubai Marina because it's a neighbourhood, not a corridor. Our patients live and work within a two-kilometre radius. That means we see the same people, over the years — and that we're accountable in a way a chain clinic can't be."
                        />
                        <p>
                            The clinic was founded by Dr. Farah Al Zaabi in 2018 after ten years across London and Dubai.
                            The building — a converted marina-facing corner unit — was designed by an architect who normally
                            builds boutique hotels. That's deliberate. When you walk in, we want it to feel less like a hospital
                            and more like a room where difficult conversations happen well.
                        </p>
                        <p>
                            Every treatment plan is written by the specialist who will actually do the work. We don't hand you
                            off, and we don't upsell. If the right answer is a filling, we won't quote a crown.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mp-band">
                <div className="mp-container">
                    <SectionHead
                        eyebrow="What we stand for"
                        title="Four ideas we can't compromise on."
                    />
                    <div className="mp-values">
                        {VALUES.map((v) => (
                            <div key={v.title} className="mp-value">
                                <span className="mp-value__icon" aria-hidden="true">{v.icon}</span>
                                <h3>{v.title}</h3>
                                <p>{v.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section>
                <div className="mp-container mp-timeline">
                    <SectionHead
                        eyebrow="Milestones"
                        title="Seven years, four rooms, thousands of smiles."
                        align="center"
                    />
                    <ol className="mp-timeline__list">
                        {TIMELINE.map((t) => (
                            <li key={t.year}>
                                <span className="mp-timeline__year">{t.year}</span>
                                <div>
                                    <h3>{t.title}</h3>
                                    <p>{t.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="mp-band-teal">
                <div className="mp-container mp-about-cta">
                    <div>
                        <span className="mp-eyebrow">Ready when you are</span>
                        <h2>Come and meet us.</h2>
                        <p>Book a checkup or a no-obligation consultation. First-time patients receive a full digital scan on the house.</p>
                    </div>
                    <Button as={Link} to="/book" variant="onDark" size="lg" rightIcon={<ArrowRight size={18} />}>
                        Book an appointment
                    </Button>
                </div>
            </section>
        </>
    );
}
