import './SectionHead.css';

export default function SectionHead({ eyebrow, title, subtitle, align = 'start', as: Tag = 'h2' }) {
    return (
        <header className={`mp-sh mp-sh--${align}`}>
            {eyebrow && <span className="mp-eyebrow">{eyebrow}</span>}
            <Tag className="mp-sh__title">{title}</Tag>
            {subtitle && <p className="mp-sh__sub">{subtitle}</p>}
        </header>
    );
}
