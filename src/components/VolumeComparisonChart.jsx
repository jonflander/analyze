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
  
  // Create a map to align data by month and day (ignoring year)
  const alignedData = {};
  
  // Process Period 1 data
  filteredByDateData1.forEach(d => {
    const date = new Date(d.date);
    const month = date.getMonth();
    const day = date.getDate();
    
    // Create a key that represents the month and day (ignoring year)
    // This allows us to align the same day across different years
    const monthDayKey = `${month+1}-${day}`;
    
    if (!alignedData[monthDayKey]) {
      alignedData[monthDayKey] = {
        // Use the month name for display on x-axis
        x: date.toLocaleString('default', { month: 'short' }),
        // Store the month and day for sorting
        month: month,
        day: day,
        // Initialize data for both periods
        [label1]: 0,
        [label2]: 0
      };
    }
    
    // Add the volume data for Period 1
    alignedData[monthDayKey][label1] = d.volume || 0;
  });
  
  // Process Period 2 data
  filteredByDateData2.forEach(d => {
    const date = new Date(d.date);
    const month = date.getMonth();
    const day = date.getDate();
    
    // Use the same key format to align with Period 1
    const monthDayKey = `${month+1}-${day}`;
    
    if (!alignedData[monthDayKey]) {
      alignedData[monthDayKey] = {
        // Use the month name for display on x-axis
        x: date.toLocaleString('default', { month: 'short' }),
        // Store the month and day for sorting
        month: month,
        day: day,
        // Initialize data for both periods
        [label1]: 0,
        [label2]: 0
      };
    }
    
    // Add the volume data for Period 2
    alignedData[monthDayKey][label2] = d.volume || 0;
  });
  
  // Convert to array and sort by month and day
  const result = Object.values(alignedData).sort((a, b) => {
    // Sort by month first
    if (a.month !== b.month) {
      return a.month - b.month;
    }
    // Then by day
    return a.day - b.day;
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
            interval="preserveStart" // Show month names at regular intervals
            tickFormatter={(value, index) => {
              // Get the current item and the previous item
              const currentItem = chartData[index];
              const prevItem = index > 0 ? chartData[index - 1] : null;
              
              // If this is the first item or the month has changed from the previous item, show the month name
              if (!prevItem || prevItem.month !== currentItem.month) {
                return value; // Show the month name
              }
              
              // Otherwise, don't show anything to avoid crowding
              return '';
            }}
            height={40} // Increase height to accommodate labels
            tick={{ fontSize: 12 }} // Slightly larger font for month names
            tickMargin={5} // Add margin to prevent overlap
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
