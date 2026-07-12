import { forwardRef } from 'react';
import './Button.css';

const Button = forwardRef(function Button(
    {
        as = 'button',
        variant = 'primary',
        size = 'md',
        leftIcon,
        rightIcon,
        loading = false,
        disabled = false,
        block = false,
        className = '',
        children,
        ...rest
    },
    ref
) {
    const Tag = as;
    const cls = [
        'mp-btn',
        `mp-btn--${variant}`,
        `mp-btn--${size}`,
        block && 'mp-btn--block',
        loading && 'mp-btn--loading',
        className,
    ].filter(Boolean).join(' ');

    return (
        <Tag
            ref={ref}
            className={cls}
            disabled={Tag === 'button' ? (disabled || loading) : undefined}
            aria-busy={loading ? 'true' : undefined}
            {...rest}
        >
            {leftIcon && <span className="mp-btn__icon" aria-hidden="true">{leftIcon}</span>}
            <span className="mp-btn__label">{children}</span>
            {rightIcon && <span className="mp-btn__icon" aria-hidden="true">{rightIcon}</span>}
        </Tag>
    );
});

export default Button;
