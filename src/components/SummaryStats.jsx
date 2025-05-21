import React from "react";

function calcStats(data) {
  if (!data || !data.length) return { total: 0, avgPrice: 0, dollarVolume: 0 };
  
  // Calculate total volume
  const total = data.reduce((sum, d) => sum + (d.volume || 0), 0);
  
  // Calculate average price
  const priceSum = data.reduce((sum, d) => sum + (d.close || d.adjClose || 0), 0);
  const avgPrice = priceSum / data.length;
  
  // Calculate total dollar volume
  const dollarVolume = data.reduce((sum, d) => {
    const price = d.close || d.adjClose || 0;
    const volume = d.volume || 0;
    return sum + (price * volume);
  }, 0);
  
  return { total, avgPrice, dollarVolume };
}

export default function SummaryStats({ data, periods }) {
  const s1 = calcStats(data.period1);
  const s2 = calcStats(data.period2);
  
  // Calculate percentage changes
  const volumeChange = s1.total ? (((s2.total - s1.total) / s1.total) * 100).toFixed(1) : "0";
  const priceChange = s1.avgPrice ? (((s2.avgPrice - s1.avgPrice) / s1.avgPrice) * 100).toFixed(1) : "0";
  const dollarVolumeChange = s1.dollarVolume ? (((s2.dollarVolume - s1.dollarVolume) / s1.dollarVolume) * 100).toFixed(1) : "0";
  
  // Format for display
  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(num);
  };
  
  const formatLargeNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    return num.toLocaleString();
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Period 1 Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Period 1: {periods.period1.start} - {periods.period1.end}
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Volume</div>
            <div className="text-3xl font-bold">{formatLargeNumber(s1.total)}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Average Price</div>
            <div className="text-3xl font-bold">{formatCurrency(s1.avgPrice)}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Dollar Volume</div>
            <div className="text-3xl font-bold">{formatCurrency(s1.dollarVolume)}</div>
          </div>
        </div>
      </div>
      
      {/* Period 2 Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Period 2: {periods.period2.start} - {periods.period2.end}
        </h3>
        
        <div className="space-y-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Volume</div>
            <div className="flex items-center">
              <span className="text-3xl font-bold">{formatLargeNumber(s2.total)}</span>
              {volumeChange > 0 && <span className="ml-2 text-green-500 text-sm">↑ {volumeChange}%</span>}
              {volumeChange < 0 && <span className="ml-2 text-red-500 text-sm">↓ {Math.abs(volumeChange)}%</span>}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Average Price</div>
            <div className="flex items-center">
              <span className="text-3xl font-bold">{formatCurrency(s2.avgPrice)}</span>
              {priceChange > 0 && <span className="ml-2 text-green-500 text-sm">↑ {priceChange}%</span>}
              {priceChange < 0 && <span className="ml-2 text-red-500 text-sm">↓ {Math.abs(priceChange)}%</span>}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Dollar Volume</div>
            <div className="flex items-center">
              <span className="text-3xl font-bold">{formatCurrency(s2.dollarVolume)}</span>
              {dollarVolumeChange > 0 && <span className="ml-2 text-green-500 text-sm">↑ {dollarVolumeChange}%</span>}
              {dollarVolumeChange < 0 && <span className="ml-2 text-red-500 text-sm">↓ {Math.abs(dollarVolumeChange)}%</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
