import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";

function toMonthDay(dateStr) {
  const d = parseISO(dateStr);
  return format(d, "MMM-dd");
}

function prepareYoYData(data1 = [], data2 = [], label1 = "Period 1", label2 = "Period 2") {
  // Filter out entries with zero volume (non-trading days)
  const filteredData1 = data1.filter(d => d.volume > 0);
  const filteredData2 = data2.filter(d => d.volume > 0);
  
  // Create a set of trading dates (dates with volume > 0)
  const tradingDates = new Set();
  
  // Extract all trading dates from both datasets
  filteredData1.forEach(d => tradingDates.add(d.date));
  filteredData2.forEach(d => tradingDates.add(d.date));
  
  // Convert to array and sort chronologically
  const sortedDates = Array.from(tradingDates).sort();
  
  // Create a map of date to display format
  const dateDisplayMap = {};
  sortedDates.forEach(date => {
    dateDisplayMap[date] = toMonthDay(date);
  });
  
  // Create a map for the chart data
  const map = {};
  
  // Create entries only for trading dates
  sortedDates.forEach(date => {
    const displayDate = dateDisplayMap[date];
    if (!map[displayDate]) {
      map[displayDate] = { 
        x: displayDate,
        fullDate: date, // Keep the original date for sorting
        [label1]: 0,
        [label2]: 0
      };
    }
  });
  
  // Fill in actual data for period 1
  filteredData1.forEach(d => {
    const key = dateDisplayMap[d.date];
    if (key && map[key]) {
      map[key][label1] = d.volume || 0;
    }
  });
  
  // Fill in actual data for period 2
  filteredData2.forEach(d => {
    const key = dateDisplayMap[d.date];
    if (key && map[key]) {
      map[key][label2] = d.volume || 0;
    }
  });
  
  // Sort by original date for accurate chronological order
  return Object.values(map).sort((a, b) => {
    return new Date(a.fullDate) - new Date(b.fullDate);
  });
}

export default function VolumeComparisonChart({ data, periods }) {
  const label1 = periods?.period1?.label || "Period 1";
  const label2 = periods?.period2?.label || "Period 2";
  const chartData = prepareYoYData(data.period1, data.period2, label1, label2);

  // Define chart colors - teal and black
  const tealColor = "#20B2AA";
  const blackColor = "#000000";

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        Volume Comparison
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <XAxis 
            dataKey="x" 
            interval="preserveStartEnd" 
            tickFormatter={(value) => {
              // Simplify the date format to reduce label crowding
              return value.split('-')[0]; // Just show the month
            }}
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
