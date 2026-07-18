import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import Logo from '../Logo/Logo.jsx';
import WhatsAppIcon from '../Icons/WhatsAppIcon.jsx';
import { useI18n } from '../../lib/i18n.jsx';
import './Footer.css';

export default function Footer() {
    const { t } = useI18n();
    return (
        <footer className="mp-footer">
            <div className="mp-container mp-footer__grid">
                <div className="mp-footer__brand">
                    <Logo variant="light" />
                    <p className="mp-footer__tagline">{t('brand.tagline')}</p>
                </div>

                <div className="mp-footer__col">
                    <h4 className="mp-footer__heading">Clinic</h4>
                    <ul>
                        <li><Link to="/about">About us</Link></li>
                        <li><Link to="/doctors">Meet the dentists</Link></li>
                        <li><Link to="/services">Treatments</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                    </ul>
                </div>

                <div className="mp-footer__col">
                    <h4 className="mp-footer__heading">For patients</h4>
                    <ul>
                        <li><Link to="/book">Book an appointment</Link></li>
                        <li><Link to="/services/emergency">Emergency care</Link></li>
                        <li><a href="tel:+97140000000">Call the clinic</a></li>
                        <li><Link to="/privacy">{t('footer.privacy')}</Link></li>
                        <li><Link to="/terms">{t('footer.terms')}</Link></li>
                    </ul>
                </div>

                <div className="mp-footer__col mp-footer__contact">
                    <h4 className="mp-footer__heading">Visit</h4>
                    <a href="https://maps.google.com/?q=Dubai+Marina" className="mp-footer__row">
                        <MapPin size={16} aria-hidden="true" />
                        <span>Marina Plaza, Level 12<br />Dubai Marina, UAE</span>
                    </a>
                    <a href="tel:+97140000000" className="mp-footer__row">
                        <Phone size={16} aria-hidden="true" /> +971 4 000 0000
                    </a>
                    <a href="https://wa.me/971500000000" className="mp-footer__row">
                        <WhatsAppIcon size={16} /> +971 50 000 0000
                    </a>
                    <a href="mailto:hello@marinapearldental.example" className="mp-footer__row">
                        <Mail size={16} aria-hidden="true" /> hello@marinapearldental.example
                    </a>
                    <div className="mp-footer__row">
                        <Clock size={16} aria-hidden="true" />
                        <span>
                            Sat–Thu · 9:00 – 21:00<br />
                            Fri · 14:00 – 21:00
                        </span>
                    </div>
                </div>
            </div>

            <div className="mp-footer__base">
                <div className="mp-container mp-footer__baseInner">
                    <span>{t('footer.rights')}</span>
                    <span className="mp-footer__baseLinks">
                        <Link to="/privacy">{t('footer.privacy')}</Link>
                        <Link to="/terms">{t('footer.terms')}</Link>
                        <span className="mp-footer__credit">
                            Website by{' '}
                            <a
                                href="https://rupamdhar.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mp-footer__creditLink"
                            >
                                Rupam
                                <ExternalLink size={12} aria-hidden="true" />
                            </a>
                        </span>
                    </span>
                </div>
            </div>
        </footer>
    );
}
