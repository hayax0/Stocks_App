'use client';

import React, { useEffect, useRef, memo } from 'react';

function CryptoOverview() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: "dark",
      dateRange: "12M",
      locale: "en",
      largeChartUrl: "",
      isTransparent: false,
      showFloatingTooltip: false,
      plotLineColorGrowing: "rgba(41, 98, 255, 1)",
      plotLineColorFalling: "rgba(41, 98, 255, 1)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      scaleFontColor: "#DBDBDB",
      belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
      belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
      symbolActiveColor: "rgba(41, 98, 255, 0.12)",
      tabs: [
        {
          title: "BTCUSD",
          symbols: [
            {
              s: "COINBASE:BTCUSD",
              d: "",
              "base-currency-logoid": "crypto/XTVCBTC",
              "currency-logoid": "country/US"
            }
          ]
        },
        {
          title: "ETHUSD",
          symbols: [
            {
              s: "COINBASE:ETHUSD",
              d: "",
              "base-currency-logoid": "crypto/XTVCETH",
              "currency-logoid": "country/US"
            }
          ]
        }
      ],
      support_host: "https://www.tradingview.com",
      backgroundColor: "#0f0f0f",
      width: "100%",
      height: "100%",
      showSymbolLogo: true,
      showChart: true
    });
    
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/markets/" rel="noopener nofollow" target="_blank">
        </a>
      </div>
    </div>
  );
}

export default memo(CryptoOverview);