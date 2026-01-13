"use server";

import {
    RawNewsArticle,
    validateArticle,
    formatArticle,
    getDateRange,
    calculateNewsDistribution,
} from "@/lib/utils";
import { cache } from "react";
import { POPULAR_STOCK_SYMBOLS } from "@/lib/constants";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

// --- Interfaces ---

interface FinnhubSearchResult {
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
    exchange?: string;
}

interface FinnhubSearchResponse {
    count: number;
    result: FinnhubSearchResult[];
}

export type StockWithWatchlistStatus = {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
    isInWatchlist: boolean;
};

export interface WatchlistData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    name?: string;
    marketCap?: number;
    logo?: string;
}

// --- Helper Fetch ---

async function fetchJSON(url: string, revalidateSeconds?: number) {
    if (!FINNHUB_API_KEY) {
        throw new Error("Missing NEXT_PUBLIC_FINNHUB_API_KEY");
    }
    const separator = url.includes("?") ? "&" : "?";
    const fullUrl = `${FINNHUB_BASE_URL}${url}${separator}token=${FINNHUB_API_KEY}`;

    const options: RequestInit = revalidateSeconds
        ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
        : { cache: "no-store" };

    const res = await fetch(fullUrl, options);

    // Handle 403 Forbidden specifically (Plan Limits)
    if (res.status === 403) {
        // console.warn(`Finnhub 403 Forbidden for ${url}. This symbol might require a premium plan.`);
        return { error: 'FORBIDDEN' };
    }

    // Handle 429 Too Many Requests (Rate Limit) logic silent
    if (res.status === 429) {
        // Não logar erro no console para não poluir, apenas retornar sinalizador
        return { error: 'RATE_LIMIT' };
    }

    if (!res.ok) {
        // If 429, we might want to throw to trigger retry or catch logic, but simple logging is safer for now to avoid crashing entire batch
        console.error(`Finnhub API error: ${res.status} ${res.statusText} for URL: ${url}`);
        // Return null or error object to be handled by caller
        return { error: res.status };
    }

    return res.json();
}

// --- Funções Principais ---

export async function getNews(symbols?: string[]) {
    try {
        const newsArticles: ReturnType<typeof formatArticle>[] = [];

        if (symbols && symbols.length > 0) {
            const uniqueSymbols = Array.from(new Set(symbols.map(s => s.toUpperCase())));
            const { targetNewsCount } = calculateNewsDistribution(uniqueSymbols.length);
            const { from, to } = getDateRange(5);
            const symbolNewsMap = new Map<string, RawNewsArticle[]>();

            await Promise.all(
                uniqueSymbols.map(async (symbol) => {
                    try {
                        const data = await fetchJSON(
                            `/company-news?symbol=${symbol}&from=${from}&to=${to}`,
                            3600
                        );
                        if (Array.isArray(data)) {
                            symbolNewsMap.set(symbol, data.filter(validateArticle));
                        }
                    } catch (e) {
                        console.error(`Failed to fetch news for ${symbol}`, e);
                    }
                })
            );

            let gatheredCount = 0;
            let round = 0;
            while (gatheredCount < targetNewsCount && round < 6) {
                for (const symbol of uniqueSymbols) {
                    if (gatheredCount >= targetNewsCount) break;
                    const articles = symbolNewsMap.get(symbol);
                    if (!articles || articles.length === 0) continue;

                    const article = articles.shift();
                    if (article) {
                        newsArticles.push(formatArticle(article, true, symbol));
                        gatheredCount++;
                    }
                }
                round++;
                const hasMore = Array.from(symbolNewsMap.values()).some(arr => arr.length > 0);
                if (!hasMore) break;
            }

            newsArticles.sort((a, b) => b.datetime - a.datetime);
            return newsArticles;
        }

        const generalNews = await fetchJSON("/news?category=general", 3600);
        if (!Array.isArray(generalNews)) throw new Error("Invalid general news format");

        const validGeneral = generalNews.filter(validateArticle);
        const seen = new Set<string>();
        const uniqueGeneral: RawNewsArticle[] = [];

        for (const item of validGeneral) {
            const key = `${item.id}-${item.url}-${item.headline}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueGeneral.push(item);
            }
        }

        return uniqueGeneral.slice(0, 6).map((item, idx) =>
            formatArticle(item, false, undefined, idx)
        );

    } catch (error) {
        console.error("Failed to fetch news:", error);
        return [];
    }
}

export const searchStocks = cache(async (query?: string) => {
    try {
        let results: FinnhubSearchResult[] = [];

        if (!query || query.trim() === '') {
            const topSymbols = POPULAR_STOCK_SYMBOLS.slice(0, 10);
            const profiles: (FinnhubSearchResult | null)[] = [];

            // Otimização: Evitar 429 no load inicial da busca (Sequential Fetch)
            for (const sym of topSymbols) {
                // Lógica especial para Cripto
                if (['BTC', 'ETH', 'ETHUSD', 'BTCUSD'].includes(sym.toUpperCase()) || sym.includes('BINANCE:')) {
                    profiles.push({
                        symbol: sym,
                        description: sym.includes('ETH') ? 'Ethereum' : 'Bitcoin',
                        displaySymbol: sym,
                        type: 'Crypto',
                        exchange: 'Crypto'
                    });
                    continue;
                }

                try {
                    const profile = await fetchJSON(`/stock/profile2?symbol=${sym}`, 86400); // 24h cache

                    if (profile && !profile.error && profile.name) {
                        profiles.push({
                            symbol: sym,
                            description: profile.name,
                            displaySymbol: sym,
                            type: 'Common Stock',
                            exchange: profile.exchange || 'US'
                        });
                    }
                } catch (e) {
                    // ignore
                }

                // Pequeno delay para respirar a API
                await new Promise(r => setTimeout(r, 100));
            }

            results = profiles.filter((p): p is FinnhubSearchResult => p !== null);
        } else {
            const q = encodeURIComponent(query.trim());
            const searchData = await fetchJSON(`/search?q=${q}`, 1800);
            results = searchData.result || [];
        }

        const mappedResults: StockWithWatchlistStatus[] = results
            .slice(0, 15)
            .map((item) => ({
                symbol: item.symbol.toUpperCase(),
                name: item.description,
                exchange: item.displaySymbol || 'US',
                type: item.type || 'Stock',
                isInWatchlist: false,
            }));

        return mappedResults;
    } catch (error) {
        console.error('Error in stock search:', error);
        return [];
    }
});

// Essa é a função que a Watchlist vai usar
export async function getWatchlistQuotes(symbols: string[]) {
    if (!symbols || symbols.length === 0) return [];

    const uniqueSymbols = Array.from(new Set(symbols));
    const quotes: WatchlistData[] = [];

    // Otimização Extrema: Sequencial Estrito para evitar 429 em massa
    const CONCURRENCY_LIMIT = 1;

    // Divide symbols em blocos (aqui de 1 em 1)
    for (let i = 0; i < uniqueSymbols.length; i += CONCURRENCY_LIMIT) {
        const batch = uniqueSymbols.slice(i, i + CONCURRENCY_LIMIT);

        await Promise.all(batch.map(async (symbol) => {
            try {
                let querySymbol = symbol.toUpperCase();
                // Ajustes de Símbolos Cripto
                if (symbol === 'BTC') querySymbol = 'BINANCE:BTCUSDT';
                else if (symbol === 'ETH') querySymbol = 'BINANCE:ETHUSDT';
                else if (symbol === 'ETHUSD') querySymbol = 'BINANCE:ETHUSDT';

                // Tenta buscar cotação (Cache 60s)
                const quote = await fetchJSON(`/quote?symbol=${querySymbol}`, 60);

                let profile: any = { name: symbol, marketCapitalization: 0 };

                // Tenta buscar profile se não for cripto conhecida
                if (!['BTC', 'ETH', 'ETHUSD'].includes(symbol)) {
                    try {
                        // Cache de 24 HORAS para Profile, pois não muda quase nunca
                        const p = await fetchJSON(`/stock/profile2?symbol=${symbol}`, 86400);
                        if (p && !p.error && p.name) {
                            profile = p;
                        }
                    } catch (e) { /* ignore */ }
                }

                // Lógica de erros de API (403 Forbidden ou 429 Rate Limit)
                const errorType = quote?.error || profile?.error;
                const isRestricted = errorType === 'FORBIDDEN';

                // Se for 429 (Rate Limit), aceitamos se tivermos pelo menos o nome, ou retornamos dados zerados temporariamente
                const isRateLimited = errorType === 'RATE_LIMIT';

                if (!quote?.error || isRestricted || isRateLimited) {
                    quotes.push({
                        symbol: symbol,
                        name: profile.name || symbol,
                        price: (isRestricted || isRateLimited) ? 0 : (quote.c || 0),
                        change: (isRestricted || isRateLimited) ? 0 : (quote.d || 0),
                        changePercent: (isRestricted || isRateLimited) ? 0 : (quote.dp || 0),
                        marketCap: profile.marketCapitalization || 0,
                        logo: profile.logo,
                    });
                }
            } catch (error: any) {
                console.warn(`Unexpected error fetching ${symbol}:`, error);
                quotes.push({
                    symbol: symbol,
                    name: symbol,
                    price: 0,
                    change: 0,
                    changePercent: 0,
                    marketCap: 0
                });
            }
        }));

        // Delay significativo entre requisições
        if (i + CONCURRENCY_LIMIT < uniqueSymbols.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return quotes;
}