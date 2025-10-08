const twoDpFormatter = Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
});

const maxTwoDpFormatter = Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
});

const maxThreeSfFormatter = Intl.NumberFormat('en-US', {
    style: 'decimal',
    maximumSignificantDigits: 3,
});

const percentFormatter = Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumSignificantDigits: 2,
    signDisplay: 'always',
});

const usdTwoDpFormatter = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
});

const usdMaxThreeSfFormatter = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumSignificantDigits: 3,
});

export function formatNumber(balance: bigint, decimals: number) {
    // If over 1T, display to 2dp, eg 1.09T
    if (balance > Math.pow(10, decimals + 12)) {
        // @ts-expect-error // HACK: Formatter supports this.
        const formattedNumber = maxTwoDpFormatter.format(`${balance}E-${decimals + 12}`);
        return `${formattedNumber}T`;
    }

    // If over 1B, display to 2dp, eg 1.09B
    if (balance > Math.pow(10, decimals + 9)) {
        // @ts-expect-error // HACK: Formatter supports this.
        const formattedNumber = maxTwoDpFormatter.format(`${balance}E-${decimals + 9}`);
        return `${formattedNumber}B`;
    }

    // If over 1M, display to 2dp, eg 1.09M
    if (balance > Math.pow(10, decimals + 6)) {
        // @ts-expect-error // HACK: Formatter supports this.
        const formattedNumber = maxTwoDpFormatter.format(`${balance}E-${decimals + 6}`);
        return `${formattedNumber}M`;
    }

    if (balance === 0n) return `0`;

    // If under 0.00001, just show <0.00001
    if (balance < Math.pow(10, decimals - 5)) return `<0.00001`;

    // For all other cases, display up to 5 decimals
    const formatter = Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: Math.min(5, decimals),
    });

    // @ts-expect-error // HACK: Formatter supports this.
    return formatter.format(`${balance}E-${decimals}`);
}

export function formatDollars(value: number) {
    if (value >= 1) {
        return usdTwoDpFormatter.format(value);
    } else if (value === 0) {
        return '0';
    } else {
        return usdMaxThreeSfFormatter.format(value);
    }
}

export function formatPercent(value: number) {
    return percentFormatter.format(value / 100);
}