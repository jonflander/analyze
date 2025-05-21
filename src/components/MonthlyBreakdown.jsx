import React from "react";
import { parseISO, format } from "date-fns";

function formatCurrency(num) {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  }).format(num);
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
}

export default function MonthlyBreakdown({ data, periods }) {
  // Process data to get monthly breakdowns
  const processMonthlyData = (periodData, periodLabel) => {
    if (!periodData || !periodData.length) return [];

    // Group data by year and month
    const monthlyData = {};
    
    periodData.forEach(item => {
      if (!item.date || !item.volume) return;
      
      const date = parseISO(item.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthName = format(date, 'MMMM');
      
      // Create a key for this year-month
      const key = `${year}-${month}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = {
          year,
          month: monthName,
          totalVolume: 0,
          totalValue: 0,
          prices: [],
          period: periodLabel
        };
      }
      
      // Add this day's data
      const price = item.close || item.adjClose || 0;
      const volume = item.volume || 0;
      
      monthlyData[key].totalVolume += volume;
      monthlyData[key].totalValue += price * volume;
      monthlyData[key].prices.push(price);
    });
    
    // Calculate average price for each month
    Object.values(monthlyData).forEach(month => {
      if (month.prices.length > 0) {
        const sum = month.prices.reduce((a, b) => a + b, 0);
        month.averagePrice = sum / month.prices.length;
      } else {
        month.averagePrice = 0;
      }
    });
    
    // Convert to array and sort by year and month
    return Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(0, a.month, 0) - new Date(0, b.month, 0);
    });
  };
  
  const period1Data = processMonthlyData(data.period1, periods.period1.label);
  const period2Data = processMonthlyData(data.period2, periods.period2.label);
  
  // Combine both periods' data
  const allMonthlyData = [...period1Data, ...period2Data];
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Monthly Breakdown
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Period
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Volume
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Average Price
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Dollar Volume
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {allMonthlyData.map((month, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.period}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {month.month}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatNumber(month.totalVolume)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(month.averagePrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {formatCurrency(month.totalValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
