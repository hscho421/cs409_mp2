import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ListView from './components/listview';
import GalleryView from './components/galleryview';
import DetailView from './components/detailview';
import './App.css';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Router basename="/cs409_mp2">
      <div className="App">
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="nav-container">
            <Link to="/" className="nav-logo-link">
              <h1 className="nav-logo">CryptoTracker</h1>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">List View</Link>
              <Link to="/gallery" className="nav-link">Gallery View</Link>
            </div>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ListView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/coin/:id" element={<DetailView />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>Data provided by CoinGecko API</p>
          <p>&copy; {new Date().getFullYear()} Hyunseok Cho. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;