import React, { useState, useEffect } from "react";
import SymbolSearch from "./components/SymbolSearch.jsx";
import DateRangePicker from "./components/DateRangePicker.jsx";
import VolumeComparisonChart from "./components/VolumeComparisonChart.jsx";
import DollarVolumeBarChart from "./components/DollarVolumeBarChart.jsx";
import SummaryStats from "./components/SummaryStats.jsx";
import MonthlyBreakdown from "./components/MonthlyBreakdown.jsx";
import { fetchHistorical } from "./utils/api.js";
import { FiRefreshCw, FiBarChart2, FiDollarSign, FiTrendingUp } from "react-icons/fi";

const defaultPeriods = {
  period1: { label: "Period 1", start: "2023-01-01", end: "2023-05-31" },
  period2: { label: "Period 2", start: "2024-01-01", end: "2024-05-31" }
};

function App() {
  // Get stock symbol from URL parameters if available
  const getInitialSymbol = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const symbolParam = params.get('symbol');
      return symbolParam || "ETG.TO";
    }
    return "ETG.TO";
  };

  // Basic state setup
  const [symbol, setSymbol] = useState(getInitialSymbol());
  const [periods, setPeriods] = useState(defaultPeriods);
  const [data, setData] = useState({ period1: [], period2: [] });
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  // Ensure we have basic mock data if everything else fails - significantly different for each period
  const fallbackData1 = [
    { date: '2023-01-05', volume: 45000, close: 25.50 },
    { date: '2023-01-12', volume: 62000, close: 26.75 },
    { date: '2023-01-19', volume: 58000, close: 27.25 },
    { date: '2023-01-26', volume: 71000, close: 28.00 },
    { date: '2023-02-02', volume: 83000, close: 29.50 },
    { date: '2023-02-09', volume: 76000, close: 30.25 },
    { date: '2023-02-16', volume: 92000, close: 31.00 },
    { date: '2023-02-23', volume: 88000, close: 30.50 },
    { date: '2023-03-02', volume: 105000, close: 32.75 },
    { date: '2023-03-09', volume: 98000, close: 33.25 },
    { date: '2023-03-16', volume: 112000, close: 34.00 },
    { date: '2023-03-23', volume: 125000, close: 35.50 },
    { date: '2023-03-30', volume: 118000, close: 34.75 },
    { date: '2023-04-06', volume: 132000, close: 36.25 },
    { date: '2023-04-13', volume: 145000, close: 37.50 },
    { date: '2023-04-20', volume: 138000, close: 36.75 },
    { date: '2023-04-27', volume: 152000, close: 38.25 },
    { date: '2023-05-04', volume: 165000, close: 39.00 },
    { date: '2023-05-11', volume: 158000, close: 38.50 },
    { date: '2023-05-18', volume: 172000, close: 40.25 },
    { date: '2023-05-25', volume: 185000, close: 41.00 },
  ];
  
  const fallbackData2 = [
    { date: '2024-01-04', volume: 95000, close: 42.50 },
    { date: '2024-01-11', volume: 108000, close: 43.75 },
    { date: '2024-01-18', volume: 122000, close: 45.00 },
    { date: '2024-01-25', volume: 135000, close: 46.25 },
    { date: '2024-02-01', volume: 148000, close: 47.50 },
    { date: '2024-02-08', volume: 162000, close: 48.75 },
    { date: '2024-02-15', volume: 175000, close: 50.00 },
    { date: '2024-02-22', volume: 189000, close: 51.25 },
    { date: '2024-02-29', volume: 202000, close: 52.50 },
    { date: '2024-03-07', volume: 215000, close: 53.75 },
    { date: '2024-03-14', volume: 229000, close: 55.00 },
    { date: '2024-03-21', volume: 242000, close: 56.25 },
    { date: '2024-03-28', volume: 255000, close: 57.50 },
    { date: '2024-04-04', volume: 269000, close: 58.75 },
    { date: '2024-04-11', volume: 282000, close: 60.00 },
    { date: '2024-04-18', volume: 295000, close: 61.25 },
    { date: '2024-04-25', volume: 309000, close: 62.50 },
    { date: '2024-05-02', volume: 322000, close: 63.75 },
    { date: '2024-05-09', volume: 335000, close: 65.00 },
    { date: '2024-05-16', volume: 349000, close: 66.25 },
  ];

  // Function to update URL with current symbol
  const updateUrlWithSymbol = (newSymbol) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('symbol', newSymbol);
      window.history.pushState({}, '', url);
    }
  };

  // Custom symbol setter that also updates the URL
  const handleSymbolChange = (newSymbol) => {
    setSymbol(newSymbol);
    updateUrlWithSymbol(newSymbol);
  };

  // Only fetch data when component mounts or when dependencies change
  useEffect(() => { 
    fetchData();
    // Mark as initialized after first render
    if (!initialized) {
      setInitialized(true);
      // Update URL on initial load if needed
      updateUrlWithSymbol(symbol);
    }
  }, [symbol, periods]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch real data, fall back to mock data if API fails
      try {
        console.log('Attempting to fetch data for', symbol);
        const [d1, d2] = await Promise.all([
          fetchHistorical(symbol, periods.period1.start, periods.period1.end),
          fetchHistorical(symbol, periods.period2.start, periods.period2.end)
        ]);
        
        if (d1 && d1.length > 0 && d2 && d2.length > 0) {
          console.log('Successfully fetched data:', { period1: d1.length, period2: d2.length });
          setData({ period1: d1, period2: d2 });
        } else {
          console.warn('API returned empty data, using fallback');
          setData({ period1: fallbackData1, period2: fallbackData2 });
          setError('API returned empty data. Using sample data instead.');
        }
      } catch (apiError) {
        console.warn("API error, using fallback data:", apiError);
        setData({ period1: fallbackData1, period2: fallbackData2 });
        setError("Could not fetch live data. Using sample data instead.");
      }
    } catch (error) {
      console.error("Critical error in data processing:", error);
      setError("An error occurred while processing data.");
      // Always ensure we have data to display
      setData({ period1: fallbackData1, period2: fallbackData2 });
    } finally {
      // Mark as initialized and stop loading
      setInitialized(true);
      setLoading(false);
    }
  }

  // Add console log for debugging
  console.log('App rendering with data:', { symbol, dataLength: { period1: data.period1.length, period2: data.period2.length } });
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <FiBarChart2 className="mr-3" />
                Stock Volume Analyzer
              </h1>
              <p className="text-teal-100 mt-2">Compare trading volumes and dollar volumes across time periods</p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2 text-teal-100">
                <FiTrendingUp className="text-2xl" />
                <span>Real-time Market Data</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Symbol</label>
              <SymbolSearch value={symbol} onChange={handleSymbolChange} />
            </div>
            <div className="flex-1">
              <DateRangePicker periods={periods} onChange={setPeriods} />
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              <FiRefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading overlay for the entire content area */}
        {loading && (
          <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg flex items-center space-x-4">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-lg font-medium text-gray-700">Loading data...</span>
            </div>
          </div>
        )}

        {/* Stats and Charts */}
        <div className="space-y-8">
          {/* Only render components when we have data or show placeholders */}
          {(!initialized || (data.period1.length === 0 && data.period2.length === 0)) && !loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Data Available</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Enter a stock symbol and select date ranges to analyze trading volumes.  
              </p>
            </div>
          ) : (
            <>
              <SummaryStats data={data} periods={periods} />
              
              {/* Charts */}
              <div className="space-y-8 mt-8">
                <VolumeComparisonChart data={data} periods={periods} />
                <DollarVolumeBarChart data={data} periods={periods} />
                <MonthlyBreakdown data={data} periods={periods} />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Data provided by Yahoo Finance. For demonstration purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
