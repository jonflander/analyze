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
  
  // Create a set of unique dates for x-axis
  const uniqueDates = new Set();
  
  // Extract all trading dates from both datasets
  filteredByDateData1.forEach(d => uniqueDates.add(d.date));
  filteredByDateData2.forEach(d => uniqueDates.add(d.date));
  
  // Convert to array and sort chronologically
  const sortedDates = Array.from(uniqueDates).sort();
  
  // Create a map to deduplicate date display labels
  const monthMap = {};
  let currentMonth = '';
  let monthCount = 0;
  
  // Create a map of date to display format with deduplication
  const dateDisplayMap = {};
  sortedDates.forEach(date => {
    const dateObj = new Date(date);
    const month = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate();
    
    // Create a unique display format that includes the month only once per month
    if (month !== currentMonth) {
      currentMonth = month;
      monthCount = 1;
      dateDisplayMap[date] = `${month}-${day}`;
      monthMap[month] = true;
    } else {
      // For subsequent days in the same month, just show the day
      monthCount++;
      if (monthCount % 5 === 0) { // Show month every 5 days to avoid crowding
        dateDisplayMap[date] = `${month}-${day}`;
      } else {
        dateDisplayMap[date] = `${day}`;
      }
    }
  });
  
  // Create a map for the chart data
  const map = {};
  
  // Create entries only for trading dates
  sortedDates.forEach(date => {
    const displayDate = dateDisplayMap[date];
    if (!map[date]) { // Use the full date as key to avoid collisions
      map[date] = { 
        x: displayDate,
        fullDate: date, // Keep the original date for sorting
        [label1]: 0,
        [label2]: 0
      };
    }
  });
  
  // Fill in actual data for period 1
  filteredByDateData1.forEach(d => {
    if (map[d.date]) {
      map[d.date][label1] = d.volume || 0;
    }
  });
  
  // Fill in actual data for period 2
  filteredByDateData2.forEach(d => {
    if (map[d.date]) {
      map[d.date][label2] = d.volume || 0;
    }
  });
  
  // Sort by original date for accurate chronological order
  return Object.values(map).sort((a, b) => {
    return new Date(a.fullDate) - new Date(b.fullDate);
  });
}

export default function VolumeComparisonChart({ data, periods }) {
  // Define chart colors - teal and black
  const tealColor = "#20B2AA";
  const blackColor = "#000000";
  
  // Format date for display
  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };
  
  // Create labels with date ranges
  const label1 = `${periods.period1.label} (${formatDateRange(periods.period1.start, periods.period1.end)})`;
  const label2 = `${periods.period2.label} (${formatDateRange(periods.period2.start, periods.period2.end)})`;
  
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
        <LineChart data={chartData}>
          <XAxis 
            dataKey="x" 
            interval={Math.ceil(chartData.length / 12)} // Show only ~12 ticks to avoid crowding
            angle={-45} // Angle the labels to prevent overlap
            textAnchor="end" // Align the rotated text
            height={60} // Increase height to accommodate angled labels
            tick={{ fontSize: 11 }} // Smaller font size
            tickMargin={10} // Add margin to prevent overlap
          />
          <YAxis tickFormatter={value => value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : value.toLocaleString()} />
          <Tooltip 
            formatter={value => [value.toLocaleString(), "Volume"]} 
            labelFormatter={label => `Date: ${label}`}
          />
          <Legend />
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
