// src/Wallet.js
import React from 'react';

const Wallet = ({ balance, btcBalance, ethBalance }) => {
  return (
    <div className="wallet">
      <h2>Wallet Balance: ${balance.toLocaleString()}</h2>
      <h3>BTC: {btcBalance} BTC</h3>
      <h3>ETH: {ethBalance} ETH</h3>
    </div>
  );
};

export default Wallet;
