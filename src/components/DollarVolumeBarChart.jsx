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
  // Create period labels in the format 'Period x: yyyy-mm-dd to yyyy-mm-dd'
  const period1Label = `Period 1: ${periods.period1.start} to ${periods.period1.end}`;
  const period2Label = `Period 2: ${periods.period2.start} to ${periods.period2.end}`;
  
  // Filter data by date range
  const filteredData1 = data.period1 ? data.period1.filter(d => {
    const date = new Date(d.date);
    const startDate = new Date(periods.period1.start);
    const endDate = new Date(periods.period1.end);
    return date >= startDate && date <= endDate;
  }) : [];
  
  const filteredData2 = data.period2 ? data.period2.filter(d => {
    const date = new Date(d.date);
    const startDate = new Date(periods.period2.start);
    const endDate = new Date(periods.period2.end);
    return date >= startDate && date <= endDate;
  }) : [];
  
  const m1 = groupByMonth(filteredData1);
  const m2 = groupByMonth(filteredData2);
  
  // Get all unique month keys from both datasets
  const monthKeys = Array.from(new Set([...Object.keys(m1), ...Object.keys(m2)]));
  
  // Create a mapping of month names to their numeric order (Jan=0, Feb=1, etc.)
  const monthOrder = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  // Create a map to deduplicate months by using year-month as key
  const uniqueMonths = {};
  
  // Process all month keys and combine data for the same month
  monthKeys.forEach(monthKey => {
    // Extract year and month from the key (format: yyyy-MM)
    const [year, month] = monthKey.split('-');
    
    // Get display month from either dataset
    const displayMonth = m1[monthKey]?.displayMonth || m2[monthKey]?.displayMonth;
    
    // Skip if we can't determine the month
    if (!displayMonth) return;
    
    // Get sort order from either dataset or infer from month name
    const sortOrder = m1[monthKey]?.sortOrder || m2[monthKey]?.sortOrder || monthOrder[displayMonth] || 0;
    
    // Create a unique identifier for this month (just the month name)
    // This ensures we don't have duplicate months in the chart
    if (!uniqueMonths[displayMonth]) {
      uniqueMonths[displayMonth] = {
        month: displayMonth, // Use just month name for display
        sortOrder, // Store the month's numeric order for sorting
        [period1Label]: 0,
        [period2Label]: 0,
      };
    }
    
    // Add the values from this month key to the corresponding unique month
    uniqueMonths[displayMonth][period1Label] += m1[monthKey]?.value || 0;
    uniqueMonths[displayMonth][period2Label] += m2[monthKey]?.value || 0;
  });
  
  // Convert the unique months map to an array for the chart
  const chartData = Object.values(uniqueMonths);
  
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
          <Legend 
            verticalAlign="bottom"
            height={50}
            wrapperStyle={{ 
              paddingBottom: '10px', 
              fontSize: '11px',
              lineHeight: '1.2em',
              width: '100%'
            }}
          />
          <Bar dataKey={period1Label} fill={blackColor} />
          <Bar dataKey={period2Label} fill={tealColor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
