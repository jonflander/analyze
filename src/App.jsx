import React, { useState, useEffect } from "react";
import SymbolSearch from "./components/SymbolSearch.jsx";
import DateRangePicker from "./components/DateRangePicker.jsx";
import VolumeComparisonChart from "./components/VolumeComparisonChart.jsx";
import DollarVolumeBarChart from "./components/DollarVolumeBarChart.jsx";
import SummaryStats from "./components/SummaryStats.jsx";
import { fetchHistorical } from "./utils/api.js";
import { FiRefreshCw, FiBarChart2, FiDollarSign, FiTrendingUp } from "react-icons/fi";

const defaultPeriods = {
  period1: { label: "2023", start: "2023-04-01", end: "2023-12-31" },
  period2: { label: "2024", start: "2024-04-01", end: "2024-12-31" }
};

function App() {
  const [symbol, setSymbol] = useState("ETG.TO");
  const [periods, setPeriods] = useState(defaultPeriods);
  const [data, setData] = useState({ period1: [], period2: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Only fetch data when component mounts or when dependencies change
  useEffect(() => { 
    fetchData();
    // Mark as initialized after first render
    if (!initialized) setInitialized(true);
  }, [symbol, periods]);

  async function fetchData() {
    setLoading(true);
    setError(null);
    
    try {
      // Use mock data if API fails (for development)
      const mockData = [
        { date: '2023-04-01', volume: 10000, close: 25 },
        { date: '2023-05-01', volume: 12000, close: 26 },
        { date: '2023-06-01', volume: 15000, close: 28 },
      ];
      
      // Try to fetch real data, fall back to mock data if API fails
      try {
        const [d1, d2] = await Promise.all([
          fetchHistorical(symbol, periods.period1.start, periods.period1.end),
          fetchHistorical(symbol, periods.period2.start, periods.period2.end)
        ]);
        setData({ period1: d1 || [], period2: d2 || [] });
      } catch (apiError) {
        console.warn("API error, using mock data:", apiError);
        setData({ period1: mockData, period2: mockData });
        setError("Could not fetch live data. Using sample data instead.");
      }
    } catch (error) {
      console.error("Error in data processing:", error);
      setError("An error occurred while processing data.");
      // Ensure we have at least empty arrays to prevent rendering errors
      setData({ period1: [], period2: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                <FiBarChart2 className="mr-3" />
                Stock Volume Analyzer
              </h1>
              <p className="text-blue-100 mt-2">Compare trading volumes and dollar volumes across time periods</p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-2 text-blue-100">
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
              <SymbolSearch value={symbol} onChange={setSymbol} />
            </div>
            <div className="flex-1">
              <DateRangePicker periods={periods} onChange={setPeriods} />
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
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
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiBarChart2 className="mr-2 text-blue-600" />
                  Volume Comparison
                </h2>
                <div className="h-96">
                  <VolumeComparisonChart data={data} periods={periods} />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <FiDollarSign className="mr-2 text-green-600" />
                  Dollar Volume Analysis
                </h2>
                <div className="h-96">
                  <DollarVolumeBarChart data={data} periods={periods} />
                </div>
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
