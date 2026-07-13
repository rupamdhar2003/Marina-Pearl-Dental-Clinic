import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { z } from 'zod';
import Button from '../../components/Button/Button.jsx';
import Alert from '../../components/Alert/Alert.jsx';
import WhatsAppIcon from '../../components/Icons/WhatsAppIcon.jsx';
import { api } from '../../lib/api.js';
import './Contact.css';

const schema = z.object({
    name:    z.string().trim().min(2, 'Please enter your name'),
    email:   z.string().trim().email('Please enter a valid email'),
    phone:   z.string().trim().optional().default(''),
    subject: z.string().trim().min(2, 'Please add a subject'),
    message: z.string().trim().min(10, 'Tell us a little more (min 10 characters)'),
});

const initial = { name: '', email: '', phone: '', subject: '', message: '' };

export default function Contact() {
    const [form, setForm]   = useState(initial);
    const [errs, setErrs]   = useState({});
    const [state, setState] = useState('idle'); // idle | loading | success | error
    const [error, setError] = useState(null);

    function update(field) {
        return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setErrs({});
        setError(null);
        const parsed = schema.safeParse(form);
        if (!parsed.success) {
            const map = {};
            parsed.error.issues.forEach((i) => { map[i.path[0]] = i.message; });
            setErrs(map);
            return;
        }
        setState('loading');
        try {
            await api.contact(parsed.data);
            setState('success');
            setForm(initial);
        } catch (err) {
            setState('error');
            setError(err.message || 'Something went wrong. Please try again.');
        }
    }

    return (
        <section className="mp-contact">
            <div className="mp-container mp-contact__grid">
                <div className="mp-contact__intro">
                    <span className="mp-eyebrow">Get in touch</span>
                    <h1 className="mp-hero-title">Talk to us <em>directly.</em></h1>
                    <p className="mp-lead">
                        For appointments and quick questions, WhatsApp is fastest. For anything longer, use the form and
                        we'll be back to you within one working day.
                    </p>

                    <div className="mp-contact__grid-info">
                        <a href="tel:+97140000000" className="mp-contact__info">
                            <span className="mp-contact__ic"><Phone size={18} /></span>
                            <div>
                                <span className="mp-contact__lbl">Phone</span>
                                <span className="mp-contact__val">+971 4 000 0000</span>
                            </div>
                        </a>
                        <a href="https://wa.me/971500000000" className="mp-contact__info">
                            <span className="mp-contact__ic"><WhatsAppIcon size={18} /></span>
                            <div>
                                <span className="mp-contact__lbl">WhatsApp</span>
                                <span className="mp-contact__val">+971 50 000 0000</span>
                            </div>
                        </a>
                        <a href="mailto:hello@marinapearldental.example" className="mp-contact__info">
                            <span className="mp-contact__ic"><Mail size={18} /></span>
                            <div>
                                <span className="mp-contact__lbl">Email</span>
                                <span className="mp-contact__val">hello@marinapearldental.example</span>
                            </div>
                        </a>
                        <div className="mp-contact__info">
                            <span className="mp-contact__ic"><MapPin size={18} /></span>
                            <div>
                                <span className="mp-contact__lbl">Visit us</span>
                                <span className="mp-contact__val">Marina Plaza, Level 12<br />Dubai Marina, UAE</span>
                            </div>
                        </div>
                        <div className="mp-contact__info">
                            <span className="mp-contact__ic"><Clock size={18} /></span>
                            <div>
                                <span className="mp-contact__lbl">Hours</span>
                                <span className="mp-contact__val">
                                    Sat–Thu · 9:00 – 21:00<br />
                                    Fri · 14:00 – 21:00
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <form className="mp-contact__form" onSubmit={onSubmit} noValidate>
                    <h2>Send an enquiry</h2>
                    {state === 'success' && (
                        <Alert variant="success" title="Message received.">
                            We&apos;ll get back to you within one working day.
                        </Alert>
                    )}
                    {state === 'error' && error && (
                        <Alert variant="error" title="Couldn&apos;t send.">{error}</Alert>
                    )}
                    <div className="mp-contact__row">
                        <div className="mp-field">
                            <label className="mp-label" htmlFor="c-name">Full name</label>
                            <input id="c-name" className="mp-input" value={form.name} onChange={update('name')}
                                   aria-invalid={!!errs.name} autoComplete="name" required />
                            {errs.name && <span className="mp-error-text">{errs.name}</span>}
                        </div>
                        <div className="mp-field">
                            <label className="mp-label" htmlFor="c-email">Email</label>
                            <input id="c-email" className="mp-input" type="email" value={form.email} onChange={update('email')}
                                   aria-invalid={!!errs.email} autoComplete="email" required />
                            {errs.email && <span className="mp-error-text">{errs.email}</span>}
                        </div>
                    </div>
                    <div className="mp-contact__row">
                        <div className="mp-field">
                            <label className="mp-label" htmlFor="c-phone">Phone <span className="mp-muted">(optional)</span></label>
                            <input id="c-phone" className="mp-input" value={form.phone} onChange={update('phone')}
                                   autoComplete="tel" />
                        </div>
                        <div className="mp-field">
                            <label className="mp-label" htmlFor="c-subject">Subject</label>
                            <input id="c-subject" className="mp-input" value={form.subject} onChange={update('subject')}
                                   aria-invalid={!!errs.subject} required />
                            {errs.subject && <span className="mp-error-text">{errs.subject}</span>}
                        </div>
                    </div>
                    <div className="mp-field">
                        <label className="mp-label" htmlFor="c-message">Message</label>
                        <textarea id="c-message" className="mp-textarea" rows={6}
                                  value={form.message} onChange={update('message')} aria-invalid={!!errs.message} required />
                        {errs.message && <span className="mp-error-text">{errs.message}</span>}
                    </div>
                    <Button type="submit" variant="primary" size="lg" loading={state === 'loading'}
                            rightIcon={<Send size={16} />}>
                        Send message
                    </Button>
                </form>
            </div>
        </section>
    );
}
