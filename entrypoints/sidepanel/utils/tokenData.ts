import { Address } from "@solana/addresses"

export type TokenData = {
    mint: Address;
    amount: bigint;
    name: string;
    symbol: string;
    icon: string | null;
    decimals: number;
    usdPriceUnit: number | null;
    usdValue: number | null;
    jupiterIsVerified: boolean;
    priceChange24hPercent: number | null;
}

type OrbitApiToken = {
    mint: string;
    amount: string;
    name: string;
    symbol: string;
    icon: string | null;
    decimals: number;
    usdPriceUnit: number | null;
    usdValue: number | null;
    jupiterIsVerified: boolean;
    priceChange24hPercent: number | null;
}

type OrbitApiResponse = {
    tokens: OrbitApiToken[];
}

export async function getTokensForAddress(address: Address): Promise<TokenData[]> {
    const response = await fetch(`https://orbit-api-sol.vercel.app/api/tokens/${address}`);
    if (!response.ok) {
        throw new Error(`Error fetching token data: ${response.statusText}`);
    }
    const { tokens: apiTokens }: OrbitApiResponse = await response.json();

    const tokenData: TokenData[] = apiTokens.map(token => ({
        mint: token.mint as Address,
        amount: BigInt(token.amount),
        name: token.name,
        symbol: token.symbol,
        icon: token.icon,
        decimals: token.decimals,
        usdPriceUnit: token.usdPriceUnit,
        usdValue: token.usdValue,
        jupiterIsVerified: token.jupiterIsVerified,
        priceChange24hPercent: token.priceChange24hPercent,
    }));

    // Sort with SOL first, then by USD value descending
    tokenData.sort((a, b) => {
        if (a.symbol === 'SOL' && b.symbol !== 'SOL') return -1;
        if (a.symbol !== 'SOL' && b.symbol === 'SOL') return 1;
        return (b.usdValue || 0) - (a.usdValue || 0);
    });

    return tokenData;
}
