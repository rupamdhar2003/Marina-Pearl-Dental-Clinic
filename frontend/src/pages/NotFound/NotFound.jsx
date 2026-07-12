import { Link } from 'react-router-dom';
import Button from '../../components/Button/Button.jsx';
import './NotFound.css';

export default function NotFound() {
    return (
        <section className="mp-404">
            <div className="mp-container mp-404__inner">
                <span className="mp-eyebrow">Not found</span>
                <h1 className="mp-hero-title">
                    We couldn&apos;t find that page.
                </h1>
                <p className="mp-lead">
                    The link may be old, or we may have moved the content. Try one of the links below.
                </p>
                <div className="mp-404__ctas">
                    <Button as={Link} to="/" variant="primary">Back to home</Button>
                    <Button as={Link} to="/services" variant="secondary">See treatments</Button>
                    <Button as={Link} to="/contact" variant="secondary">Contact us</Button>
                </div>
            </div>
        </section>
    );
}
