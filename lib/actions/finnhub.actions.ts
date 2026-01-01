"use server";

import {
    RawNewsArticle,
    validateArticle,
    formatArticle,
    getDateRange,
    calculateNewsDistribution,
} from "@/lib/utils";
import { revalidateTag } from "next/cache";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";
const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

async function fetchJSON(url: string, revalidateSeconds?: number) {
    if (!FINNHUB_API_KEY) {
        throw new Error("Missing NEXT_PUBLIC_FINNHUB_API_KEY");
    }
    const separator = url.includes("?") ? "&" : "?";
    const fullUrl = `${FINNHUB_BASE_URL}${url}${separator}token=${FINNHUB_API_KEY}`;

    const options: RequestInit = revalidateSeconds
        ? { next: { revalidate: revalidateSeconds } }
        : { cache: "no-store" };

    const res = await fetch(fullUrl, options);

    if (!res.ok) {
        throw new Error(`Finnhub API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
}

export async function getNews(symbols?: string[]) {
    try {
        const newsArticles: ReturnType<typeof formatArticle>[] = [];


        if (symbols && symbols.length > 0) {
            const uniqueSymbols = Array.from(new Set(symbols.map(s => s.toUpperCase())));

            const { targetNewsCount } = calculateNewsDistribution(uniqueSymbols.length)

            const { from, to } = getDateRange(5);

            const symbolNewsMap = new Map<string, RawNewsArticle[]>();

            await Promise.all(
                uniqueSymbols.map(async (symbol) => {
                    try {
                        const data = await fetchJSON(
                            `/company-news?symbol=${symbol}&from=${from}&to=${to}`,
                            3600 // Cache for 1 hour
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
            while (gatheredCount < targetNewsCount && round < 10) {
                for (const symbol of uniqueSymbols) {
                    if (gatheredCount >= targetNewsCount) break;

                    const articles = symbolNewsMap.get(symbol);
                    if (!articles || articles.length === 0) continue;

                    const article = articles.shift(); // Take the first one
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

        const generalNews = await fetchJSON("/news?category=general", 3600); // Cache 1hr

        if (!Array.isArray(generalNews)) {
            throw new Error("Invalid general news format");
        }

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

        const top6 = uniqueGeneral.slice(0, 6).map((item, idx) =>
            formatArticle(item, false, undefined, idx)
        );

        return top6;

    } catch (error) {
        console.error("Failed to fetch news:", error);
        throw new Error("Failed to fetch news");
    }
}
