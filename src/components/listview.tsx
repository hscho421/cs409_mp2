import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { coinGeckoAPI } from '../services/api';
import { Coin, SortField, SortOrder } from '../types/coin';
import '../styles/listview.css';

const ListView: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('market_cap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
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
    let result = coins.filter(coin =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

    setFilteredCoins(result);
  }, [searchTerm, coins, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) return <div className="loading">Loading cryptocurrencies...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="list-view">
      <div className="list-header">
        <h1>Cryptocurrency Markets</h1>
        <p className="subtitle">Top 100 cryptocurrencies by market cap</p>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="🔍 Search by name or symbol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <span className="results-count">
          Showing {filteredCoins.length} of {coins.length} coins
        </span>
      </div>

      <div className="sort-controls">
        <span className="sort-label">Sort by:</span>
        <button 
          className={`sort-btn ${sortField === 'name' ? 'active' : ''}`}
          onClick={() => handleSort('name')}
        >
          Name {getSortIcon('name')}
        </button>
        <button 
          className={`sort-btn ${sortField === 'current_price' ? 'active' : ''}`}
          onClick={() => handleSort('current_price')}
        >
          Price {getSortIcon('current_price')}
        </button>
        <button 
          className={`sort-btn ${sortField === 'market_cap' ? 'active' : ''}`}
          onClick={() => handleSort('market_cap')}
        >
          Market Cap {getSortIcon('market_cap')}
        </button>
        <button 
          className={`sort-btn ${sortField === 'price_change_percentage_24h' ? 'active' : ''}`}
          onClick={() => handleSort('price_change_percentage_24h')}
        >
          24h Change {getSortIcon('price_change_percentage_24h')}
        </button>
      </div>

      <div className="table-container">
        <table className="coins-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Coin</th>
              <th className="text-right">Price</th>
              <th className="text-right">24h %</th>
              <th className="text-right">Market Cap</th>
              <th className="text-right">Volume (24h)</th>
            </tr>
          </thead>
          <tbody>
            {filteredCoins.map((coin) => (
              <tr key={coin.id} className="coin-row">
                <td className="rank">{coin.market_cap_rank}</td>
                <td>
                  <Link to={`/coin/${coin.id}`} className="coin-link">
                    <img src={coin.image} alt={coin.name} className="coin-icon" />
                    <div className="coin-info">
                      <span className="coin-name">{coin.name}</span>
                      <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
                    </div>
                  </Link>
                </td>
                <td className="text-right price">
                  ${coin.current_price.toLocaleString(undefined, { 
                    minimumFractionDigits: 2,
                    maximumFractionDigits: coin.current_price < 1 ? 6 : 2
                  })}
                </td>
                <td className={`text-right ${coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'}`}>
                  {coin.price_change_percentage_24h > 0 ? '+' : ''}
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td className="text-right">
                  ${coin.market_cap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="text-right">
                  ${coin.total_volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCoins.length === 0 && (
        <div className="no-results">
          <p>No cryptocurrencies found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default ListView;