import logo from './logo.png';
import './App.css';
import { useState } from 'react';

// API base URL - adjust port if needed
const API_BASE_URL = 'http://localhost:5111';

function App() {
  const [formData, setFormData] = useState({
    localSalesCount: '',
    foreignSalesCount: '',
    averageSaleAmount: ''
  });
  
  const [results, setResults] = useState({
    avalphaTechnologiesCommission: 0,
    competitorCommission: 0,
    details: null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const validateForm = () => {
    const local = parseInt(formData.localSalesCount) || 0;
    const foreign = parseInt(formData.foreignSalesCount) || 0;
    const amount = parseFloat(formData.averageSaleAmount) || 0;

    if (local < 0 || foreign < 0) {
      setError('Sales counts must be 0 or greater');
      return false;
    }

    if (amount <= 0) {
      setError('Average sale amount must be greater than 0');
      return false;
    }

    if (local === 0 && foreign === 0) {
      setError('At least one sale (local or foreign) is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/Commision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localSalesCount: parseInt(formData.localSalesCount) || 0,
          foreignSalesCount: parseInt(formData.foreignSalesCount) || 0,
          averageSaleAmount: parseFloat(formData.averageSaleAmount) || 0
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.errors && Array.isArray(errorData.errors)) {
          throw new Error(errorData.errors.join(', '));
        }
        throw new Error('Failed to calculate commission. Please try again.');
      }

      const data = await response.json();
      
      setResults({
        avalphaTechnologiesCommission: data.avalphaTechnologiesCommissionAmount,
        competitorCommission: data.competitorCommissionAmount,
        details: data.details
      });
    } catch (err) {
      console.error('API Error:', err);
      if (err.message.includes('fetch')) {
        setError('Unable to connect to the server. Please ensure the API is running on port 5111.');
      } else {
        setError(err.message || 'An error occurred while calculating commission.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
          <img src={logo} className="App-logo" alt="Avalpha Technologies Logo" />
          <h1 className="company-title">Avalpha Technologies</h1>
          <h2 className="app-subtitle">Commission Calculator</h2>
        </div>
      </header>

      <main className="main-content">
        <div className="calculator-container">
          <div className="form-section">
            <h3>Sales Information</h3>
            
            {error && (
              <div className="error-message" role="alert">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="calculator-form">
              <div className="form-group">
                <label htmlFor="localSalesCount">Local Sales Count</label>
                <input 
                  type="number" 
                  id="localSalesCount"
                  name="localSalesCount"
                  value={formData.localSalesCount}
                  onChange={handleInputChange}
                  placeholder="Enter number of local sales"
                  min="0"
                  max="1000000"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="foreignSalesCount">Foreign Sales Count</label>
                <input 
                  type="number" 
                  id="foreignSalesCount"
                  name="foreignSalesCount"
                  value={formData.foreignSalesCount}
                  onChange={handleInputChange}
                  placeholder="Enter number of foreign sales"
                  min="0"
                  max="1000000"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="averageSaleAmount">Average Sale Amount (£)</label>
                <input 
                  type="number" 
                  step="0.01"
                  id="averageSaleAmount"
                  name="averageSaleAmount"
                  value={formData.averageSaleAmount}
                  onChange={handleInputChange}
                  placeholder="Enter average sale amount"
                  min="0.01"
                  max="10000000"
                  required
                />
              </div>

              <button 
                type="submit" 
                className={`calculate-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Calculating...' : 'Calculate Commission'}
              </button>
            </form>
          </div>

          <div className="results-section">
            <h3>Commission Results</h3>
            <div className="results-grid">
              <div className="result-card avalpha-card">
                <div className="result-header">
                  <h4>Avalpha Technologies</h4>
                  <span className="commission-rates">Local: 20% | Foreign: 35%</span>
                </div>
                <div className="result-amount">
                  {formatCurrency(results.avalphaTechnologiesCommission)}
                </div>
                {results.details && (
                  <div className="result-breakdown">
                    <small>Local: {formatCurrency(results.details.avalphaLocalCommission)}</small>
                    <small>Foreign: {formatCurrency(results.details.avalphaForeignCommission)}</small>
                  </div>
                )}
              </div>
              
              <div className="result-card competitor-card">
                <div className="result-header">
                  <h4>Competitor</h4>
                  <span className="commission-rates">Local: 2% | Foreign: 7.55%</span>
                </div>
                <div className="result-amount">
                  {formatCurrency(results.competitorCommission)}
                </div>
                {results.details && (
                  <div className="result-breakdown">
                    <small>Local: {formatCurrency(results.details.competitorLocalCommission)}</small>
                    <small>Foreign: {formatCurrency(results.details.competitorForeignCommission)}</small>
                  </div>
                )}
              </div>
            </div>
            
            {results.avalphaTechnologiesCommission > 0 && (
              <div className="advantage-indicator">
                <p className="advantage-text">
                  Avalpha Technologies advantage: 
                  <strong> {formatCurrency(results.avalphaTechnologiesCommission - results.competitorCommission)}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="App-footer">
        <p>&copy; 2025 Avalpha Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;