'use client';

import React, { useEffect, useRef, memo, useId } from 'react';

interface TradingViewWidgetProps {
    src: string;
    config: any;
}

function TradingViewWidget({ src, config }: TradingViewWidgetProps) {
    const uniqueId = useId().replace(/:/g, '-'); // Sanitize for HTML ID

    const forcedConfig = {
        ...config,
        "container_id": uniqueId,
        "colorTheme": "dark",
        "theme": "dark",
        "isTransparent": false,
        "backgroundColor": "#141414",
        "width": "100%",
        "height": "100%",
        "autosize": true
    };

    const htmlContent = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>
                    body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: #141414; overflow: hidden; }
                    .tradingview-widget-container { width: 100%; height: 100%; }
                </style>
            </head>
            <body>
                <div class="tradingview-widget-container">
                    <div id="${uniqueId}" class="tradingview-widget-container__widget"></div>
                    <script type="text/javascript" src="${src}" async>
                        ${JSON.stringify(forcedConfig)}
                    </script>
                </div>
            </body>
        </html>
    `;

    return (
        <iframe
            className="w-full h-full border-none overflow-hidden bg-[#141414]"
            srcDoc={htmlContent}
            title="TradingView Widget"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
    );
}

export default memo(TradingViewWidget);