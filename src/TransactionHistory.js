import React from 'react';

const TransactionHistory = ({ transactions }) => {
  return (
    <div className="transaction-history">
      <h3>Transaction History</h3>
      <ul>
        {transactions.map((transaction, index) => (
          <li
            key={index}
            style={{
              color: transaction.action === 'buy' ? 'red' : 'green',
            }}
          >
            {transaction.amount} {transaction.currency} at ${transaction.price} - {transaction.type}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionHistory;
