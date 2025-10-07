import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { coinGeckoAPI } from '../services/api';
import { CoinDetail, PricePoint, Coin } from '../types/coin';
import '../styles/detailview.css';

const DetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [allCoins, setAllCoins] = useState<Coin[]>([]);
  const [chartDays, setChartDays] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchCoinData(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchAllCoins();
  }, []);

  const fetchAllCoins = async () => {
    try {
      const data = await coinGeckoAPI.getCoins(1, 100);
      setAllCoins(data);
    } catch (err) {
      console.error('Error fetching all coins:', err);
    }
  };

  const fetchCoinData = async (coinId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [coinData, priceData] = await Promise.all([
        coinGeckoAPI.getCoinById(coinId),
        coinGeckoAPI.getCoinChart(coinId, chartDays)
      ]);
      
      setCoin(coinData);
      setChartData(priceData);
    } catch (err) {
      setError('Failed to fetch coin details. Please try again. API rate limit exceeded.');
      console.error('Error fetching coin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      coinGeckoAPI.getCoinChart(id, chartDays)
        .then(data => setChartData(data))
        .catch(err => console.error('Error fetching chart:', err));
    }
  }, [chartDays, id]);

  const handlePrevious = () => {
    if (!allCoins.length || !id) return;
    
    const currentIndex = allCoins.findIndex(c => c.id === id);
    if (currentIndex > 0) {
      navigate(`/coin/${allCoins[currentIndex - 1].id}`);
    }
  };

  const handleNext = () => {
    if (!allCoins.length || !id) return;
    
    const currentIndex = allCoins.findIndex(c => c.id === id);
    if (currentIndex < allCoins.length - 1) {
      navigate(`/coin/${allCoins[currentIndex + 1].id}`);
    }
  };

  const getCurrentIndex = (): number => {
    if (!allCoins.length || !id) return -1;
    return allCoins.findIndex(c => c.id === id);
  };

  const isFirstCoin = getCurrentIndex() === 0;
  const isLastCoin = getCurrentIndex() === allCoins.length - 1;

  if (loading) return <div className="loading">Loading coin details...</div>;
  if (error || !coin) return <div className="error">{error || 'Coin not found'}</div>;

  const price = coin.market_data.current_price.usd;
  const marketCap = coin.market_data.market_cap.usd;
  const volume = coin.market_data.total_volume.usd;
  const change24h = coin.market_data.price_change_percentage_24h;
  const change7d = coin.market_data.price_change_percentage_7d;
  const change30d = coin.market_data.price_change_percentage_30d;

  return (
    <div className="detail-view">
      <div className="nav-buttons">
        <button 
          className="nav-btn prev" 
          onClick={handlePrevious}
          disabled={isFirstCoin}
        >
          ← Previous
        </button>
        <button 
          className="nav-btn next" 
          onClick={handleNext}
          disabled={isLastCoin}
        >
          Next →
        </button>
      </div>

      <div className="detail-header">
        <img src={coin.image.large} alt={coin.name} className="detail-icon" />
        <div className="header-info">
          <h1>{coin.name}</h1>
          <span className="detail-symbol">{coin.symbol.toUpperCase()}</span>
          <span className="detail-rank">Rank #{coin.market_cap_rank}</span>
        </div>
      </div>

      <div className="price-section">
        <div className="current-price">
          <span className="price-label">Current Price</span>
          <span className="price-value">
            ${price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: price < 1 ? 6 : 2
            })}
          </span>
        </div>
        <div className="price-changes">
          <div className={`change-item ${change24h > 0 ? 'positive' : 'negative'}`}>
            <span className="change-label">24h</span>
            <span className="change-value">
              {change24h > 0 ? '+' : ''}{change24h.toFixed(2)}%
            </span>
          </div>
          <div className={`change-item ${change7d > 0 ? 'positive' : 'negative'}`}>
            <span className="change-label">7d</span>
            <span className="change-value">
              {change7d > 0 ? '+' : ''}{change7d.toFixed(2)}%
            </span>
          </div>
          <div className={`change-item ${change30d > 0 ? 'positive' : 'negative'}`}>
            <span className="change-label">30d</span>
            <span className="change-value">
              {change30d > 0 ? '+' : ''}{change30d.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <h2>Price Chart</h2>
          <div className="chart-controls">
            <button 
              className={chartDays === 1 ? 'active' : ''}
              onClick={() => setChartDays(1)}
            >
              24H
            </button>
            <button 
              className={chartDays === 7 ? 'active' : ''}
              onClick={() => setChartDays(7)}
            >
              7D
            </button>
            <button 
              className={chartDays === 30 ? 'active' : ''}
              onClick={() => setChartDays(30)}
            >
              30D
            </button>
            <button 
              className={chartDays === 90 ? 'active' : ''}
              onClick={() => setChartDays(90)}
            >
              90D
            </button>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                style={{ fontSize: '0.85rem' }}
                tick={{ fill: '#cbd5e1' }}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: '0.85rem' }}
                tick={{ fill: '#cbd5e1' }}
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px'
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  'Price'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#667eea" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Market Cap</span>
          <span className="stat-value">${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">24h Volume</span>
          <span className="stat-value">${volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Circulating Supply</span>
          <span className="stat-value">
            {coin.market_data.circulating_supply.toLocaleString(undefined, { maximumFractionDigits: 0 })} {coin.symbol.toUpperCase()}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Max Supply</span>
          <span className="stat-value">
            {coin.market_data.max_supply 
              ? `${coin.market_data.max_supply.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${coin.symbol.toUpperCase()}`
              : 'Unlimited'}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">All-Time High</span>
          <span className="stat-value">${coin.market_data.ath.usd.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">All-Time Low</span>
          <span className="stat-value">${coin.market_data.atl.usd.toLocaleString()}</span>
        </div>
      </div>

      {coin.description?.en && (
        <div className="description-section">
          <h2>About {coin.name}</h2>
          <div 
            className="description-text"
            dangerouslySetInnerHTML={{ 
              __html: coin.description.en.split('. ').slice(0, 3).join('. ') + '.' 
            }}
          />
        </div>
      )}

      {coin.categories && coin.categories.length > 0 && (
        <div className="categories-section">
          <h3>Categories</h3>
          <div className="categories-list">
            {coin.categories.slice(0, 5).map((category, index) => (
              <span key={index} className="category-tag">{category}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailView;
