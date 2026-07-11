import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import './Alert.css';

const ICON = {
    error:   <AlertCircle size={18} />,
    success: <CheckCircle2 size={18} />,
    info:    <Info size={18} />,
};

export default function Alert({ variant = 'info', title, children }) {
    return (
        <div className={`mp-alert mp-alert--${variant}`} role="status">
            <span className="mp-alert__icon" aria-hidden="true">{ICON[variant] || ICON.info}</span>
            <div className="mp-alert__body">
                {title && <strong>{title}</strong>}
                <span>{children}</span>
            </div>
        </div>
    );
}
