import React from "react";
const examples = ["ETG.TO", "AAPL", "SHOP.TO", "TSLA"];
export default function SymbolSearch({ value, onChange }) {
  return (
    <div>
      <label style={{ fontWeight: 600 }}>Symbol</label>
      <input
        style={{ display: "block", border: "1px solid #ccc", padding: 4, borderRadius: 4, width: 120, marginTop: 2 }}
        value={value}
        onChange={e => onChange(e.target.value.toUpperCase())}
        placeholder="e.g. ETG.TO or AAPL"
      />
      <div style={{ display: "flex", gap: 10, fontSize: 12, marginTop: 2 }}>
        {examples.map(sym => (
          <button
            key={sym}
            style={{ textDecoration: "underline", color: "#0366d6", background: "none", border: "none", cursor: "pointer" }}
            onClick={() => onChange(sym)}
            type="button"
          >{sym}</button>
        ))}
      </div>
    </div>
  );
}
