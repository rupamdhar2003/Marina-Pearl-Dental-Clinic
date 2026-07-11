import { formatInTimeZone } from 'date-fns-tz';

export const TZ = 'Asia/Dubai';

export function formatDubai(date, pattern = 'EEE, d MMM yyyy · HH:mm') {
    const d = date instanceof Date ? date : new Date(date);
    return formatInTimeZone(d, TZ, pattern);
}

export function formatPriceRange(minAed, maxAed) {
    if (!minAed && !maxAed) return 'On consultation';
    if (minAed === maxAed) return `AED ${minAed.toLocaleString()}`;
    return `AED ${minAed.toLocaleString()} – ${maxAed.toLocaleString()}`;
}

export function shortRef(token) {
    if (!token) return '';
    return token.slice(0, 8).toUpperCase();
}
