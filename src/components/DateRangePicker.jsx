import React from "react";

export default function DateRangePicker({ periods, onChange }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">Compare Periods</label>
      
      {["period1", "period2"].map(key => (
        <div key={key} className="flex flex-wrap items-center gap-2 mb-3">
          <span className="min-w-[80px] font-medium">{periods[key].label}</span>
          
          <input
            type="date"
            value={periods[key].start}
            onChange={e => onChange({ ...periods, [key]: { ...periods[key], start: e.target.value } })}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-teal-500 focus:border-teal-500"
          />
          
          <span className="text-gray-500">to</span>
          
          <input
            type="date"
            value={periods[key].end}
            onChange={e => onChange({ ...periods, [key]: { ...periods[key], end: e.target.value } })}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      ))}
    </div>
  );
}
