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
  
  // Create a set of trading dates (dates with volume > 0)
  const tradingDates = new Set();
  
  // Extract all trading dates from both datasets
  filteredByDateData1.forEach(d => tradingDates.add(d.date));
  filteredByDateData2.forEach(d => tradingDates.add(d.date));
  
  // Convert to array and sort chronologically
  const sortedDates = Array.from(tradingDates).sort();
  
  // Create a map for the chart data
  const map = {};
  
  // Create entries only for trading dates
  sortedDates.forEach(date => {
    const dateObj = new Date(date);
    const monthName = dateObj.toLocaleString('default', { month: 'short' });
    const day = dateObj.getDate();
    
    // Format the display date to show month and day
    const displayDate = `${monthName}-${day}`;
    
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
            interval={Math.ceil(chartData.length / 30)} // Show more ticks for better month visibility
            angle={-45} // Angle the labels to prevent overlap
            textAnchor="end" // Align the rotated text
            height={60} // Increase height to accommodate angled labels
            tick={props => {
              const { x, y, payload } = props;
              // Extract month from the label (format is Month-Day)
              const parts = payload.value.split('-');
              const month = parts[0];
              const day = parts[1];
              
              // Only show the month on the first day of each month or every 5 days
              const isFirstOfMonth = day === '1' || day === '2' || day === '3';
              const isEveryFifthDay = parseInt(day) % 5 === 0;
              
              return (
                <g transform={`translate(${x},${y})`}>
                  <text 
                    x={0} 
                    y={0} 
                    dy={16} 
                    textAnchor="end" 
                    fill="#666" 
                    transform="rotate(-45)"
                    fontSize={11}
                  >
                    {isFirstOfMonth ? month : (isEveryFifthDay ? day : '')}
                  </text>
                </g>
              );
            }}
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
