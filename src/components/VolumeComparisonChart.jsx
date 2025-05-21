import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

function toMonthDay(dateStr) {
  const d = parseISO(dateStr);
  return format(d, "MMM-dd");
}

function prepareYoYData(data1 = [], data2 = [], label1 = "Period 1", label2 = "Period 2", period1Range, period2Range) {
  // Filter out entries with zero volume (non-trading days)
  const filteredData1 = data1.filter(d => d.volume > 0);
  const filteredData2 = data2.filter(d => d.volume > 0);
  
  // Filter data by date ranges if provided
  const filteredByDateData1 = period1Range ? filteredData1.filter(d => {
    const date = new Date(d.date);
    const startDate = new Date(period1Range.start);
    const endDate = new Date(period1Range.end);
    return date >= startDate && date <= endDate;
  }) : filteredData1;
  
  const filteredByDateData2 = period2Range ? filteredData2.filter(d => {
    const date = new Date(d.date);
    const startDate = new Date(period2Range.start);
    const endDate = new Date(period2Range.end);
    return date >= startDate && date <= endDate;
  }) : filteredData2;
  
  // Prepare data for each period separately
  const prepareDataForPeriod = (data, label, year) => {
    // Create a map for the chart data
    const result = [];
    
    // Group by month and day for better display
    data.forEach(d => {
      const date = new Date(d.date);
      const month = date.getMonth();
      const day = date.getDate();
      
      // Get month name for display
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      // Create a normalized date for consistent x-axis positioning
      // Use a fixed year (2000) for both periods to align them on the x-axis
      const normalizedDate = new Date(2000, month, day);
      
      result.push({
        originalDate: d.date,
        // Use month name for display
        x: monthName,
        // Include day for more detailed tooltip
        fullDate: `${monthName} ${day}`,
        // Use the normalized date for sorting
        sortDate: normalizedDate,
        // Store the volume under the period label
        [label]: d.volume || 0,
        // Store 0 for the other period
        [label === label1 ? label2 : label1]: 0
      });
    });
    
    return result;
  };
  
  // Process each period
  const period1Data = prepareDataForPeriod(filteredByDateData1, label1);
  const period2Data = prepareDataForPeriod(filteredByDateData2, label2);
  
  // Combine both datasets
  const combinedData = [...period1Data, ...period2Data];
  
  // Create a map to merge data points with the same month-day
  const mergedDataMap = {};
  
  combinedData.forEach(item => {
    const key = item.x; // MM-DD format
    
    if (!mergedDataMap[key]) {
      mergedDataMap[key] = {
        x: key,
        sortDate: item.sortDate,
        [label1]: 0,
        [label2]: 0
      };
    }
    
    // Add the volume data from this item
    if (item[label1] > 0) mergedDataMap[key][label1] = item[label1];
    if (item[label2] > 0) mergedDataMap[key][label2] = item[label2];
  });
  
  // Convert the map to an array and sort by date
  const result = Object.values(mergedDataMap).sort((a, b) => {
    return a.sortDate - b.sortDate;
  });
  
  return result;
}

export default function VolumeComparisonChart({ data, periods }) {
  // Define chart colors - teal and black
  const tealColor = "#20B2AA";
  const blackColor = "#000000";
  
  // Create period labels in the format 'Period x: yyyy-mm-dd to yyyy-mm-dd'
  const label1 = `Period 1: ${periods.period1.start} to ${periods.period1.end}`;
  const label2 = `Period 2: ${periods.period2.start} to ${periods.period2.end}`;
  
  // Prepare data for chart with date range filtering
  const chartData = prepareYoYData(
    data.period1, 
    data.period2, 
    label1, 
    label2,
    { start: periods.period1.start, end: periods.period1.end },
    { start: periods.period2.start, end: periods.period2.end }
  );
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        Volume Comparison
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 20 }}>
          <XAxis 
            dataKey="x" 
            interval={Math.ceil(chartData.length / 10)} // Show only ~10 ticks to avoid crowding
            angle={-45} // Angle the labels to prevent overlap
            textAnchor="end" // Align the rotated text
            height={60} // Increase height to accommodate angled labels
            tick={{ fontSize: 11 }} // Smaller font size
            tickMargin={10} // Add margin to prevent overlap
          />
          <YAxis 
            tickFormatter={value => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toLocaleString()} 
            width={70} // Increase width to prevent label cutoff
            tick={{ fontSize: 11 }} // Smaller font size
            padding={{ top: 10 }} // Add padding to prevent cutoff
          />
          <Tooltip 
            formatter={value => [value.toLocaleString(), "Volume"]} 
            labelFormatter={label => `Date: ${label}`}
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
          <Line 
            name={label1} 
            type="monotone" 
            dataKey={label1} 
            stroke={blackColor} 
            strokeWidth={2} 
            dot={false} 
            connectNulls={true}
            activeDot={{ r: 6, strokeWidth: 0 }} 
          />
          <Line 
            name={label2} 
            type="monotone" 
            dataKey={label2} 
            stroke={tealColor} 
            strokeWidth={2} 
            dot={false} 
            connectNulls={true}
            activeDot={{ r: 6, strokeWidth: 0 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
