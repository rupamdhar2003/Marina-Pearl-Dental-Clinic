import './Spinner.css';

export default function Spinner({ size = 22, label = 'Loading' }) {
    return (
        <span className="mp-spinner" role="status" aria-label={label}
              style={{ inlineSize: size, blockSize: size }}>
            <span className="mp-sr-only">{label}</span>
        </span>
    );
}
