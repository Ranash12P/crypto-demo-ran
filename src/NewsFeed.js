import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NewsFeed = ({ currency }) => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `https://newsapi.org/v2/everything?q=${currency}&apiKey=a9935b8058764795aee3411da992c03d`
        );
        setArticles(response.data.articles);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, [currency]);

  return (
    <div className="news-feed">
      <h2>Latest News for {currency}</h2>
      <ul>
        {articles.slice(0, 5).map((article, index) => (
          <li key={index}>
            <a href={article.url} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsFeed;
