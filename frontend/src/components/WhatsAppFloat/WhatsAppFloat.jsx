import WhatsAppIcon from '../Icons/WhatsAppIcon.jsx';
import './WhatsAppFloat.css';

export default function WhatsAppFloat() {
    return (
        <a
            className="mp-wa"
            href="https://wa.me/971500000000?text=Hi%20Marina%20Pearl%20Dental%20—%20I%27d%20like%20to%20ask%20about%20an%20appointment."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Marina Pearl Dental on WhatsApp"
        >
            <span className="mp-wa__ring" aria-hidden="true"></span>
            <WhatsAppIcon size={22} />
            <span className="mp-wa__label">WhatsApp</span>
        </a>
    );
}
