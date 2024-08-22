import React, { useState, useEffect } from 'react';
import TradingViewGraph from './TradingViewGraph';
import PriceFetcher from './PriceFetcher';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import NewsFeed from './NewsFeed';
import './App.css';

const App = () => {
  const [balance, setBalance] = useState(10000000); // Initial balance of $10 million
  const [btcBalance, setBtcBalance] = useState(0);
  const [ethBalance, setEthBalance] = useState(0);
  const [currentPriceBTC, setCurrentPriceBTC] = useState(0);
  const [currentPriceETH, setCurrentPriceETH] = useState(0);
  const [avgPriceBTC, setAvgPriceBTC] = useState(0);
  const [avgPriceETH, setAvgPriceETH] = useState(0);
  const [selectedCurrency, setSelectedCurrency] = useState('BTC');
  const [orderType, setOrderType] = useState('market');
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);

  // Update the price based on the selected currency and order type
  useEffect(() => {
    if (orderType === 'market') {
      setPrice(selectedCurrency === 'BTC' ? currentPriceBTC : currentPriceETH);
    }
  }, [currentPriceBTC, currentPriceETH, selectedCurrency, orderType]);

  // Calculate the maximum coins that can be bought with the current balance
  const maxCoinsCanBuy = (selectedCurrency === 'BTC' ? balance / currentPriceBTC : balance / currentPriceETH).toFixed(6);

  // Calculate overall profit/loss
  const profitLossBTC = ((currentPriceBTC - avgPriceBTC) * btcBalance).toFixed(2);
  const profitLossETH = ((currentPriceETH - avgPriceETH) * ethBalance).toFixed(2);
  const profitLossTotal = (parseFloat(profitLossBTC) + parseFloat(profitLossETH)).toFixed(2);

  const profitLossPercentage = (
    ((btcBalance * currentPriceBTC + ethBalance * currentPriceETH) /
      (btcBalance * avgPriceBTC + ethBalance * avgPriceETH) -
      1) *
    100
  ).toFixed(2);

  const handleTrade = () => {
    const totalCost = amount * price;
    if (totalCost > balance) {
      alert("Insufficient balance! You can't spend more than you have.");
      return;
    }

    if (orderType === 'market') {
      executeTrade('buy', amount, price);
    } else if (orderType === 'limit') {
      if (price >= (selectedCurrency === 'BTC' ? currentPriceBTC : currentPriceETH)) {
        executeTrade('buy', amount, price);
      } else {
        const newPendingOrder = {
          action: 'buy',
          amount,
          limitPrice: price,
          currency: selectedCurrency,
          type: 'pending',
        };
        setPendingOrders([...pendingOrders, newPendingOrder]);
        setTransactions([...transactions, newPendingOrder]);
        alert(`Limit order placed: Waiting for the price to drop to $${price}`);
      }
    }
  };

  const handleSell = () => {
    if (orderType === 'market') {
      executeTrade('sell', amount, price);
    } else if (orderType === 'limit') {
      if (price <= (selectedCurrency === 'BTC' ? currentPriceBTC : currentPriceETH)) {
        executeTrade('sell', amount, price);
      } else {
        const newPendingOrder = {
          action: 'sell',
          amount,
          limitPrice: price,
          currency: selectedCurrency,
          type: 'pending',
        };
        setPendingOrders([...pendingOrders, newPendingOrder]);
        setTransactions([...transactions, newPendingOrder]);
        alert(`Limit order placed: Waiting for the price to rise to $${price}`);
      }
    }
  };

  const executeTrade = (action, amount, tradePrice) => {
    if (action === 'buy') {
      const cost = amount * tradePrice;
      if (cost > balance) {
        alert('Insufficient balance!');
        return;
      }
      if (selectedCurrency === 'BTC') {
        const newBTCBalance = btcBalance + amount;
        setAvgPriceBTC((btcBalance * avgPriceBTC + amount * tradePrice) / newBTCBalance);
        setBtcBalance(newBTCBalance);
      } else {
        const newETHBalance = ethBalance + amount;
        setAvgPriceETH((ethBalance * avgPriceETH + amount * tradePrice) / newETHBalance);
        setEthBalance(newETHBalance);
      }
      setBalance(balance - cost);
    } else if (action === 'sell') {
      if (selectedCurrency === 'BTC' && amount > btcBalance) {
        alert('Insufficient BTC balance!');
        return;
      }
      if (selectedCurrency === 'ETH' && amount > ethBalance) {
        alert('Insufficient ETH balance!');
        return;
      }
      if (selectedCurrency === 'BTC') {
        setBtcBalance(btcBalance - amount);
      } else {
        setEthBalance(ethBalance - amount);
      }
      setBalance(balance + amount * tradePrice);
    }

    setTransactions([
      ...transactions,
      { action, amount, price: tradePrice, currency: selectedCurrency, type: 'executed' },
    ]);
  };

  useEffect(() => {
    const checkPendingOrders = () => {
      const newPendingOrders = [];

      pendingOrders.forEach((order) => {
        const currentPrice = order.currency === 'BTC' ? currentPriceBTC : currentPriceETH;
        if (
          (order.action === 'buy' && currentPrice <= order.limitPrice) ||
          (order.action === 'sell' && currentPrice >= order.limitPrice)
        ) {
          executeTrade(order.action, order.amount, order.limitPrice);
        } else {
          newPendingOrders.push(order);
        }
      });

      setPendingOrders(newPendingOrders);
    };

    const interval = setInterval(checkPendingOrders, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [currentPriceBTC, currentPriceETH, pendingOrders]);

  return (
    <div className="App">
      <h1>Blockchain Trading System</h1>
      <NewsFeed currency={selectedCurrency} />

      {/* Portfolio Summary Section */}
      <div className="portfolio-summary">
        <h2>Portfolio Summary</h2>
        <p>Total BTC Value: ${(btcBalance * currentPriceBTC).toLocaleString()}</p>
        <p>Total ETH Value: ${(ethBalance * currentPriceETH).toLocaleString()}</p>
        <p>Cash Balance (USD): ${balance.toLocaleString()}</p>
        <p>Total Portfolio Value: ${(btcBalance * currentPriceBTC + ethBalance * currentPriceETH + balance).toLocaleString()}</p>
        <p>Profit/Loss: ${profitLossTotal} ({profitLossPercentage}%)</p>
        <div className="chart-container">
          <Pie
            data={{
              labels: ['BTC', 'ETH', 'Cash (USD)'],
              datasets: [
                {
                  data: [btcBalance * currentPriceBTC, ethBalance * currentPriceETH, balance],
                  backgroundColor: ['#f7931a', '#627eea', '#4caf50'],
                },
              ],
            }}
          />
        </div>
      </div>

      <div className="wallet-info">
        <h2>Wallet Balance: ${balance.toLocaleString()}</h2>
        <h3>BTC: {btcBalance} BTC</h3>
        <h3>ETH: {ethBalance} ETH</h3>
      </div>

      <div className="order-form">
        <h2>Place Order</h2>
        <div className="form-group">
          <label>Order Type:</label>
          <select
            value={orderType}
            onChange={(e) => {
              setOrderType(e.target.value);
              if (e.target.value === 'market') {
                setPrice(selectedCurrency === 'BTC' ? currentPriceBTC : currentPriceETH);
              } else {
                setPrice(''); // Clear the price for limit orders to allow manual input
              }
            }}
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
          </select>
        </div>
        <div className="form-group">
          <label>Cryptocurrency:</label>
          <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}>
            <option value="BTC">BTC</option>
            <option value="ETH">ETH</option>
          </select>
        </div>
        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            disabled={orderType === 'market'}
          />
        </div>
        <div className="form-group">
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
          />
        </div>
        <div className="form-group">
          <label>Total:</label>
          <input type="number" value={amount * price} disabled />
        </div>
        <div className="form-group">
          <p>You can buy up to {maxCoinsCanBuy} {selectedCurrency} with your current balance.</p>
        </div>
        <div className="buttons">
          <button className="buy-button" onClick={handleTrade}>
            Buy {selectedCurrency}
          </button>
          <button className="sell-button" onClick={handleSell}>
            Sell {selectedCurrency}
          </button>
        </div>
      </div>

      <h3>Market Price BTC: ${currentPriceBTC.toLocaleString()}</h3>
      <h3>Market Price ETH: ${currentPriceETH.toLocaleString()}</h3>

      <TradingViewGraph currency={selectedCurrency} />
      <PriceFetcher currency="BTC" onPriceUpdate={(price) => setCurrentPriceBTC(price)} />
      <PriceFetcher currency="ETH" onPriceUpdate={(price) => setCurrentPriceETH(price)} />

      <h3>Transaction History:</h3>
      <ul>
        {transactions.map((transaction, index) => (
          <li
            key={index}
            style={{
              color: transaction.type === 'pending'
                ? 'yellow'
                : transaction.action === 'buy'
                ? 'green'
                : 'red',
            }}
          >
            {transaction.type === 'pending'
              ? `Pending: ${transaction.action} ${transaction.amount} ${transaction.currency} at $${transaction.limitPrice}`
              : `${transaction.action} ${transaction.amount} ${transaction.currency} at $${transaction.price} (${transaction.type})`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
