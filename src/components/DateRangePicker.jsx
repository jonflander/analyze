import React from "react";
export default function DateRangePicker({ periods, onChange }) {
  return (
    <div>
      <label style={{ fontWeight: 600 }}>Compare Periods</label>
      {["period1", "period2"].map(key => (
        <div key={key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 2 }}>
          <span>{periods[key].label}</span>
          <input
            type="date"
            value={periods[key].start}
            onChange={e => onChange({ ...periods, [key]: { ...periods[key], start: e.target.value } })}
            style={{ border: "1px solid #ccc", borderRadius: 4, padding: "2px 6px" }}
          />
          <span>to</span>
          <input
            type="date"
            value={periods[key].end}
            onChange={e => onChange({ ...periods, [key]: { ...periods[key], end: e.target.value } })}
            style={{ border: "1px solid #ccc", borderRadius: 4, padding: "2px 6px" }}
          />
        </div>
      ))}
    </div>
  );
}
