import yahooFinance from "yahoo-finance2";

export default async function handler(req, res) {
  const { symbol, start, end } = req.query;
  if (!symbol || !start || !end)
    return res.status(400).json({ error: "Missing params" });
  try {
    const result = await yahooFinance.historical(symbol, {
      period1: start,
      period2: end,
      interval: "1d",
    });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
