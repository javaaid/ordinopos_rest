export const countryToCurrencyMap: Record<string, { symbol: string, code: string }> = {
    // Middle East
    'SA': { symbol: 'SAR', code: 'SAR' }, // Saudi Arabia
    'AE': { symbol: 'د.إ', code: 'AED' }, // UAE
    'EG': { symbol: 'E£', code: 'EGP' }, // Egypt
    'KW': { symbol: 'K.D.', code: 'KWD' }, // Kuwait
    'QA': { symbol: 'Q.R.', code: 'QAR' }, // Qatar

    // North America
    'US': { symbol: '$', code: 'USD' },   // USA
    'CA': { symbol: 'C$', code: 'CAD' }, // Canada
    'MX': { symbol: 'Mex$', code: 'MXN' },// Mexico
    
    // Europe
    'GB': { symbol: '£', code: 'GBP' },   // UK
    'DE': { symbol: '€', code: 'EUR' },   // Germany (Euro)
    'FR': { symbol: '€', code: 'EUR' },   // France (Euro)
    'IT': { symbol: '€', code: 'EUR' },   // Italy (Euro)
    'ES': { symbol: '€', code: 'EUR' },   // Spain (Euro)

    // Asia
    'JP': { symbol: '¥', code: 'JPY' },   // Japan
    'IN': { symbol: '₹', code: 'INR' },   // India
    'CN': { symbol: '¥', code: 'CNY' },   // China
    'KR': { symbol: '₩', code: 'KRW' },   // South Korea
};

export function getCurrencyForLocale(locale: string): { symbol: string, code: string } | null {
    try {
        const countryCode = locale.split('-')[1]?.toUpperCase();
        if (countryCode && countryToCurrencyMap[countryCode]) {
            return countryToCurrencyMap[countryCode];
        }
        // Fallback for general language codes
        if (locale.startsWith('ar')) return countryToCurrencyMap['SA'];
        if (locale.startsWith('en')) return countryToCurrencyMap['US'];
    } catch (e) {
        console.error("Could not determine currency from locale", e);
    }
    return null;
}
