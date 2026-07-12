import './Logo.css';

export default function Logo({ variant = 'dark', showText = true }) {
    const fillMark = variant === 'light' ? '#ffffff' : 'var(--mp-teal-700)';
    const fillAccent = 'var(--mp-gold-600)';
    return (
        <span className={`mp-logo mp-logo--${variant}`}>
            <svg className="mp-logo__mark" viewBox="0 0 40 40" aria-hidden="true">
                <circle cx="20" cy="20" r="18.5" fill="none" stroke={fillMark} strokeWidth="1.4" />
                <path
                    d="M20 9c-3.6 0-5.6 2.4-5.6 4.8 0 1.9 1.2 3.1 1.9 4.9.6 1.7.6 3.6.6 5.4 0 2.4 1.3 6.7 3.1 6.7 1.2 0 1.9-2.4 2.4-5.4.1-1.3.6-1.9 1.3-1.9s1.2.7 1.4 1.9c.5 3 1.2 5.4 2.4 5.4 1.8 0 3.1-4.3 3.1-6.7 0-1.8 0-3.7.6-5.4.7-1.8 1.9-3 1.9-4.9 0-2.4-2-4.8-5.6-4.8-1.9 0-2.5 1.2-3.7 1.2s-1.9-1.2-3.8-1.2z"
                    fill={fillAccent}
                />
            </svg>
            {showText && (
                <span className="mp-logo__text">
                    <span className="mp-logo__brand">Marina Pearl</span>
                    <span className="mp-logo__kicker">Dental Clinic</span>
                </span>
            )}
        </span>
    );
}
