import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coinGeckoAPI } from '../services/api';
import { Coin } from '../types/coin';
import '../styles/galleryview.css';

type FilterType = 'all' | 'gainers' | 'losers' | 'high-volume' | 'top-cap';

const GalleryView: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoins();
  }, []);

  const fetchCoins = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coinGeckoAPI.getCoins(1, 100);
      setCoins(data);
      setFilteredCoins(data);
    } catch (err) {
      setError('Failed to fetch cryptocurrency data. Please try again later.');
      console.error('Error fetching coins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilter(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coins, activeFilter]);

  const applyFilter = (filter: FilterType) => {
    let result = [...coins];

    switch (filter) {
      case 'gainers':
        result = result
          .filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        break;
      case 'losers':
        result = result
          .filter(coin => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
        break;
      case 'high-volume':
        result = result
          .sort((a, b) => b.total_volume - a.total_volume);
        break;
      case 'top-cap':
        result = result
          .sort((a, b) => b.market_cap - a.market_cap);
        break;
      case 'all':
      default:
        break;
    }

    setFilteredCoins(result);
  };

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  if (loading) return <div className="loading">Loading gallery...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="gallery-view">
      <div className="gallery-header">
        <h1>Crypto Gallery</h1>
        <p className="subtitle">Visual overview of cryptocurrency market</p>
      </div>

      <div className="filter-container">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          🪙 All Coins
        </button>
        <button
          className={`filter-btn ${activeFilter === 'gainers' ? 'active' : ''}`}
          onClick={() => handleFilterClick('gainers')}
        >
          🚀 Top Gainers
        </button>
        <button
          className={`filter-btn ${activeFilter === 'losers' ? 'active' : ''}`}
          onClick={() => handleFilterClick('losers')}
        >
          📉 Top Losers
        </button>
        <button
          className={`filter-btn ${activeFilter === 'high-volume' ? 'active' : ''}`}
          onClick={() => handleFilterClick('high-volume')}
        >
          📊 High Volume
        </button>
        <button
          className={`filter-btn ${activeFilter === 'top-cap' ? 'active' : ''}`}
          onClick={() => handleFilterClick('top-cap')}
        >
          👑 Top Market Cap
        </button>
      </div>

      <div className="filter-info">
        Showing: <strong>{getFilterLabel(activeFilter)}</strong> ({filteredCoins.length} coins)
      </div>

      <div className="gallery-grid">
        {filteredCoins.map((coin) => (
          <Link to={`/coin/${coin.id}`} key={coin.id} className="gallery-card">
            <div className="card-image">
              <img src={coin.image} alt={coin.name} />
              <span className="card-rank">#{coin.market_cap_rank}</span>
            </div>
            <div className="card-content">
              <h3 className="card-name">{coin.name}</h3>
              <p className="card-symbol">{coin.symbol.toUpperCase()}</p>
              <p className="card-price">
                ${coin.current_price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: coin.current_price < 1 ? 6 : 2
                })}
              </p>
              <p className={`card-change ${coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'}`}>
                {coin.price_change_percentage_24h > 0 ? '+' : ''}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
          </Link>
        ))}
      </div>

      {filteredCoins.length === 0 && (
        <div className="no-results">
          <p>No coins found for this filter.</p>
        </div>
      )}
    </div>
  );
};

const getFilterLabel = (filter: FilterType): string => {
  switch (filter) {
    case 'gainers':
      return 'Top Gainers (24h)';
    case 'losers':
      return 'Top Losers (24h)';
    case 'high-volume':
      return 'Highest Trading Volume';
    case 'top-cap':
      return 'Largest Market Cap';
    case 'all':
    default:
      return 'All Cryptocurrencies';
  }
};

export default GalleryView;