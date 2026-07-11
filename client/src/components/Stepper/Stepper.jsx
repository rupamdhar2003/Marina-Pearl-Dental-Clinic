import { Check } from 'lucide-react';
import './Stepper.css';

export default function Stepper({ steps, current }) {
    return (
        <ol className="mp-stepper" aria-label="Booking progress">
            {steps.map((label, i) => {
                const state = i < current ? 'done' : i === current ? 'active' : 'todo';
                return (
                    <li key={label} className={`mp-stepper__item is-${state}`}>
                        <span className="mp-stepper__dot" aria-hidden="true">
                            {state === 'done' ? <Check size={14} /> : <span>{i + 1}</span>}
                        </span>
                        <span className="mp-stepper__label">{label}</span>
                    </li>
                );
            })}
        </ol>
    );
}
