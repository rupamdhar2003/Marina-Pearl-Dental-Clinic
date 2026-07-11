import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Globe } from 'lucide-react';
import Button from '../Button/Button.jsx';
import Logo from '../Logo/Logo.jsx';
import { useI18n } from '../../lib/i18n.jsx';
import './Header.css';

const NAV = [
    { to: '/',          key: 'nav.home' },
    { to: '/services',  key: 'nav.services' },
    { to: '/doctors',   key: 'nav.doctors' },
    { to: '/about',     key: 'nav.about' },
    { to: '/contact',   key: 'nav.contact' },
];

export default function Header() {
    const { t, locale, setLocale } = useI18n();
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => setOpen(false), [location.pathname]);

    useEffect(() => {
        function onScroll() { setScrolled(window.scrollY > 8); }
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    return (
        <header className={`mp-header ${scrolled ? 'is-scrolled' : ''}`}>
            <div className="mp-container mp-header__inner">
                <Link to="/" className="mp-header__brand" aria-label={t('brand.nameFull')}>
                    <Logo />
                </Link>
                <nav className="mp-header__nav" aria-label="Primary">
                    {NAV.map((n) => (
                        <NavLink
                            key={n.to}
                            to={n.to}
                            end={n.to === '/'}
                            className={({ isActive }) =>
                                `mp-header__link ${isActive ? 'is-active' : ''}`
                            }
                        >
                            {t(n.key)}
                        </NavLink>
                    ))}
                </nav>

                <div className="mp-header__actions">
                    <a href="tel:+97140000000" className="mp-header__phone" aria-label={t('cta.call')}>
                        <Phone size={16} /> <span>+971 4 000 0000</span>
                    </a>
                    <button
                        className="mp-header__lang"
                        onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                        aria-label="Change language"
                        title="Change language"
                    >
                        <Globe size={16} aria-hidden="true" />
                        <span>{locale === 'en' ? 'العربية' : 'EN'}</span>
                    </button>
                    <Button as={Link} to="/book" variant="primary" size="md">
                        {t('nav.book')}
                    </Button>
                    <button
                        className="mp-header__burger"
                        onClick={() => setOpen((v) => !v)}
                        aria-label={open ? 'Close menu' : 'Open menu'}
                        aria-expanded={open}
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {open && (
                <div className="mp-header__mobile" role="dialog" aria-modal="true">
                    <nav aria-label="Mobile primary">
                        {NAV.map((n) => (
                            <NavLink
                                key={n.to}
                                to={n.to}
                                end={n.to === '/'}
                                className={({ isActive }) =>
                                    `mp-header__mlink ${isActive ? 'is-active' : ''}`
                                }
                            >
                                {t(n.key)}
                            </NavLink>
                        ))}
                        <div className="mp-header__msep" />
                        <a href="tel:+97140000000" className="mp-header__mlink">
                            <Phone size={16} /> +971 4 000 0000
                        </a>
                        <button
                            className="mp-header__mlink"
                            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                            style={{ textAlign: 'inline-start' }}
                        >
                            <Globe size={16} /> {locale === 'en' ? 'العربية' : 'English'}
                        </button>
                        <Button as={Link} to="/book" variant="primary" block>
                            {t('nav.book')}
                        </Button>
                    </nav>
                </div>
            )}
        </header>
    );
}
