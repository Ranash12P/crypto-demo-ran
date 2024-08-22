import React, { useEffect } from 'react';
import axios from 'axios';

const PriceFetcher = ({ currency, onPriceUpdate }) => {
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const symbol = currency === 'BTC' ? 'BTCUSDT' : 'ETHUSDT';
        const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`);
        const price = parseFloat(response.data.price);
        onPriceUpdate(price);
      } catch (error) {
        console.error('Error fetching the price:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [currency, onPriceUpdate]);

  return null; // This component doesn't render anything
};

export default PriceFetcher;
