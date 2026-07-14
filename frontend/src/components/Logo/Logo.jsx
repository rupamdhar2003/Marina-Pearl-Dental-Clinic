import './Logo.css';

export default function Logo({ variant = 'dark', showText = true }) {
    const fillMark = variant === 'light' ? '#ffffff' : 'var(--mp-teal-700)';
    const fillAccent = 'var(--mp-gold-600)';
    return (
        <span className={`mp-logo mp-logo--${variant}`}>
            <svg
                className="mp-logo__mark"
                viewBox="0 0 40 40"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                {/* Molar-shaped tooth silhouette: rounded crown, two roots */}
                <path
                    d="M20 4c-6 0-9 4-9 10 0 4 1 7 1.5 10 .5 5 1.5 10 3.5 10 1.5 0 2.5-5 3.5-10 .2-2 .8-2 1 0 1 5 2 10 3.5 10 2 0 3-5 3.5-10 .5-3 1.5-6 1.5-10 0-6-3-10-9-10z"
                    fill={fillMark}
                />
                {/* Pearl highlight — a small gold accent, off-centre, that
                    reads as a shine on the tooth and echoes the brand name. */}
                <circle cx="26" cy="10.5" r="2.2" fill={fillAccent} />
                {/* Micro white glint on the pearl to give it depth */}
                <circle cx="25.3" cy="9.8" r="0.7" fill="#ffffff" opacity="0.55" />
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
