import axios from "axios";

export async function fetchHistorical(symbol, start, end) {
  const res = await axios.get(`/api/historical`, {
    params: { symbol, start, end }
  });
  return res.data;
}
