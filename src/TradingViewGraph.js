import React, { useEffect } from 'react';

const TradingViewGraph = ({ currency, onPriceUpdate }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      new window.TradingView.widget({
        width: '100%',
        height: 600,
        symbol: currency === 'BTC' ? 'BINANCE:BTCUSDT' : 'BINANCE:ETHUSDT',
        interval: 'D',
        timezone: 'Etc/UTC',
        theme: 'light',
        style: '1',
        locale: 'en',
        toolbar_bg: '#f1f3f6',
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: 'tradingview_widget',
        withdateranges: true,
        hide_side_toolbar: false,
        studies: [],
        widgetType: "widget",
        onTick: (tick) => {
          onPriceUpdate(tick.close);
        },
      });
    };
    document.getElementById('tradingview_widget').appendChild(script);
  }, [currency, onPriceUpdate]);

  return <div id="tradingview_widget" style={{ height: '600px' }} />;
};

export default TradingViewGraph;
