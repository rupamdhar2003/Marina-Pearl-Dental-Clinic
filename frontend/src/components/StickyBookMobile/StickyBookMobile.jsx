import { Link, useLocation } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import { useI18n } from '../../lib/i18n.jsx';
import './StickyBookMobile.css';

const HIDE_ON = ['/book', '/admin', '/manage'];

export default function StickyBookMobile() {
    const { t } = useI18n();
    const { pathname } = useLocation();
    if (HIDE_ON.some((p) => pathname.startsWith(p))) return null;
    return (
        <Link className="mp-sticky-book" to="/book" aria-label={t('cta.book')}>
            <CalendarCheck size={18} aria-hidden="true" />
            <span>{t('nav.book')}</span>
        </Link>
    );
}
