import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";
import { parseISO, format } from "date-fns";

function groupByMonth(data) {
  const monthMap = {};
  
  // Handle empty data
  if (!data || data.length === 0) return monthMap;
  
  data.forEach(d => {
    try {
      // Only use month name for display (no year)
      const monthKey = format(parseISO(d.date), "yyyy-MM"); // Keep year-month for sorting
      const displayMonth = format(parseISO(d.date), "MMM"); // Just month name for display
      const price = d.close || d.adjClose || 0;
      const volume = d.volume || 0;
      const dv = price * volume;
      
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { 
          displayMonth, 
          value: 0,
          sortOrder: new Date(d.date).getMonth() // Use month number for consistent sorting
        };
      }
      monthMap[monthKey].value += dv;
    } catch (err) {
      console.warn('Error processing date:', d.date, err);
    }
  });
  
  return monthMap;
}

export default function DollarVolumeBarChart({ data, periods }) {
  const m1 = groupByMonth(data.period1 || []);
  const m2 = groupByMonth(data.period2 || []);
  
  // Get all unique month keys from both datasets
  const monthKeys = Array.from(new Set([...Object.keys(m1), ...Object.keys(m2)]));
  
  // Create a mapping of month names to their numeric order (Jan=0, Feb=1, etc.)
  const monthOrder = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  // Create chart data with consistent month representation
  const chartData = monthKeys.map(monthKey => {
    // Get display month from either dataset
    const displayMonth = m1[monthKey]?.displayMonth || m2[monthKey]?.displayMonth;
    
    // Get sort order from either dataset or infer from month name
    const sortOrder = m1[monthKey]?.sortOrder || m2[monthKey]?.sortOrder || monthOrder[displayMonth] || 0;
    
    return {
      month: displayMonth, // Use just month name for display
      monthKey, // Keep the full key for reference
      sortOrder, // Store the month's numeric order for sorting
      [periods.period1.label]: m1[monthKey]?.value || 0,
      [periods.period2.label]: m2[monthKey]?.value || 0,
    };
  });
  
  // Sort by month order (not alphabetically or by year-month string)
  chartData.sort((a, b) => a.sortOrder - b.sortOrder);

  // Define chart colors - teal and black
  const tealColor = "#20B2AA";
  const blackColor = "#000000";

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        Monthly Dollar Volume Analysis
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart 
          data={chartData}
          barGap={0} // Ensure bars are directly next to each other
          barCategoryGap={10} // Space between month groups
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={value => `$${(value / 1000000).toFixed(0)}M`} />
          <Tooltip 
            formatter={value => [`$${value.toLocaleString()}`, "Dollar Volume"]} 
            labelFormatter={label => `Month: ${label}`}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          <Legend />
          <Bar dataKey={periods.period1.label} fill={blackColor} />
          <Bar dataKey={periods.period2.label} fill={tealColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
