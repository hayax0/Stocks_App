import React from 'react';
import TradingViewWidget from '@/components/TradingViewWidget';
import WatchlistButton from '@/components/WatchlistButton';
import { getWatchlistSymbolsByEmail } from '@/lib/actions/watchlist.actions';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

// --- CONFIGURAÇÕES DE WIDGETS ---

// Função auxiliar para corrigir símbolo para TradingView
// TradingView precisa de "BMFBOVESPA:PETR4" para "PETR4.SA"
const formatTradingViewSymbol = (symbol: string) => {
    if (!symbol) return symbol;

    // Brasil
    if (symbol.endsWith('.SA')) {
        return `BMFBOVESPA:${symbol.replace('.SA', '')}`;
    }

    // Europa/Outros (exemplos comuns)
    if (symbol.endsWith('.DE')) return `XETR:${symbol.replace('.DE', '')}`;
    if (symbol.endsWith('.L')) return `LSE:${symbol.replace('.L', '')}`;
    if (symbol.endsWith('.PA')) return `EURONEXT:${symbol.replace('.PA', '')}`;

    // Cripto (Binance é seguro para maioria)
    // Se não tiver : e for cripto, tenta forçar Binance
    // Mas a busca do Finnhub muitas vezes já manda BINANCE:BTCUSDT
    // Vamos manter simples por enquanto.

    return symbol;
};

const getSymbolInfoConfig = (symbol: string) => ({
    symbol: formatTradingViewSymbol(symbol.toUpperCase()),
    colorTheme: "dark",
    isTransparent: true,
    locale: "en",
    width: "100%",
    height: 200
});

const getCandleChartConfig = (symbol: string) => ({
    symbol: formatTradingViewSymbol(symbol.toUpperCase()),
    theme: "dark",
    style: "1", // Velas
    locale: "en",
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false,
    calendar: false,
    hide_volume: false,
    details: false,
    support_host: "https://www.tradingview.com",
    backgroundColor: "rgba(0,0,0,0)",
    width: "100%",
    height: 600,
    autosize: true
});

// Gráfico com Barra Lateral (Key Stats)
const getDetailedChartConfig = (symbol: string) => ({
    symbol: formatTradingViewSymbol(symbol.toUpperCase()),
    theme: "dark",
    style: "1",
    locale: "en",
    enable_publishing: false,
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false,
    calendar: true,
    hide_volume: false,
    details: true, // Barra lateral ativa
    hotlist: true,
    support_host: "https://www.tradingview.com",
    backgroundColor: "rgba(0,0,0,0)",
    width: "100%",
    height: 600,
    autosize: true
});

const getTechnicalAnalysisConfig = (symbol: string) => ({
    symbol: formatTradingViewSymbol(symbol.toUpperCase()),
    colorTheme: "dark",
    isTransparent: true,
    locale: "en",
    width: "100%",
    height: 450,
    interval: "1h"
});

const getCompanyProfileConfig = (symbol: string) => ({
    symbol: formatTradingViewSymbol(symbol.toUpperCase()),
    colorTheme: "dark",
    isTransparent: true,
    locale: "en",
    width: "100%",
    height: 500
});

const getFinancialsConfig = (symbol: string) => ({
    symbol: formatTradingViewSymbol(symbol.toUpperCase()),
    colorTheme: "dark",
    isTransparent: true,
    locale: "en",
    width: "100%",
    height: 500,
    displayMode: "regular",
    largeChartUrl: ""
});

const StockDetails = async ({ params }: { params: Promise<{ symbol: string }> }) => {
    const { symbol } = await params;
    const formattedSymbol = decodeURIComponent(symbol).toUpperCase();

    const session = await auth.api.getSession({
        headers: await headers()
    });

    const watchlistSymbols = session?.user?.email
        ? await getWatchlistSymbolsByEmail(session.user.email)
        : [];

    // --- LÓGICA DE DETECÇÃO ---
    // Verifica se é par de Cripto ou Forex ou apenas a sigla
    const isCryptoPair = ['BTC', 'ETH', 'BTCUSD', 'ETHUSD', 'USDT'].some(c => formattedSymbol.includes(c));

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 md:p-6 lg:p-8">
            <div className="max-w-[1800px] mx-auto grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* === COLUNA ESQUERDA === */}
                <div className="xl:col-span-2 flex flex-col gap-6">

                    {/* 1. Symbol Info */}
                    <div className="w-full bg-[#141414] rounded-lg border border-[#2e2e2e] overflow-hidden min-h-[180px]">
                        <TradingViewWidget
                            src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js"
                            config={getSymbolInfoConfig(formattedSymbol)}
                        />
                    </div>

                    {/* 2. Gráfico Principal */}
                    <div className="w-full h-[600px] bg-[#141414] rounded-lg border border-[#2e2e2e] overflow-hidden">
                        <TradingViewWidget
                            src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                            config={getCandleChartConfig(formattedSymbol)}
                        />
                    </div>

                    {/* 3. Gráfico Detalhado */}
                    <div className="w-full h-[600px] bg-[#141414] rounded-lg border border-[#2e2e2e] overflow-hidden">
                        <TradingViewWidget
                            src="https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
                            config={getDetailedChartConfig(formattedSymbol)}
                        />
                    </div>
                </div>

                {/* === COLUNA DIREITA === */}
                <div className="xl:col-span-1 flex flex-col gap-6">

                    {/* Botão Watchlist - Ocultar para Crypto */}
                    {!isCryptoPair && (
                        <div className="w-full">
                            <WatchlistButton
                                symbol={formattedSymbol}
                                initialIsAdded={watchlistSymbols.includes(formattedSymbol)}
                            />
                        </div>
                    )}

                    {/* 4. Technical Analysis (Velocímetro) - Útil para Crypto e Ações */}
                    <div className="w-full h-[450px] bg-[#141414] rounded-lg border border-[#2e2e2e] overflow-hidden">
                        <TradingViewWidget
                            src="https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js"
                            config={getTechnicalAnalysisConfig(formattedSymbol)}
                        />
                    </div>

                    {/* LÓGICA DE EXIBIÇÃO:
                       Só mostra Perfil e Financeiro se NÃO for Crypto.
                       Isso evita telas vazias ou erros "No Data".
                    */}
                    {!isCryptoPair && (
                        <>
                            {/* 5. Company Profile */}
                            <div className="w-full h-[500px] bg-[#141414] rounded-lg border border-[#2e2e2e] overflow-hidden">
                                <TradingViewWidget
                                    src="https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js"
                                    config={getCompanyProfileConfig(formattedSymbol)}
                                />
                            </div>

                            {/* 6. Financials */}
                            <div className="w-full h-[500px] bg-[#141414] rounded-lg border border-[#2e2e2e] overflow-hidden">
                                <TradingViewWidget
                                    src="https://s3.tradingview.com/external-embedding/embed-widget-financials.js"
                                    config={getFinancialsConfig(formattedSymbol)}
                                />
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
};

export default StockDetails;