import axios from "axios";

// Helper function to get mock data for development
async function getMockData() {
  console.log('Using mock data for development');
  try {
    const mockData = [
      { date: '2023-04-01', open: 25.10, high: 25.89, low: 24.95, close: 25.45, volume: 1250000, adjClose: 25.45 },
      { date: '2023-05-01', open: 26.15, high: 27.50, low: 26.00, close: 27.25, volume: 1650000, adjClose: 27.25 },
      { date: '2023-06-01', open: 28.05, high: 29.75, low: 27.90, close: 29.50, volume: 2100000, adjClose: 29.50 },
      { date: '2023-07-01', open: 30.20, high: 31.50, low: 30.00, close: 31.25, volume: 2250000, adjClose: 31.25 },
      { date: '2023-08-01', open: 32.35, high: 33.75, low: 32.20, close: 33.60, volume: 2650000, adjClose: 33.60 }
    ];
    return mockData;
  } catch (error) {
    console.error('Error loading mock data:', error);
    return [];
  }
}

export async function fetchHistorical(symbol, start, end) {
  console.log(`Fetching data for ${symbol} from ${start} to ${end}`);
  
  try {
    // Try to get data from the API
    const res = await axios.get(`/api/historical`, {
      params: { symbol, start, end }
    });
    console.log('API response:', res.data);
    return res.data;
  } catch (error) {
    console.warn('API request failed, using mock data:', error.message);
    // Fall back to mock data if API fails
    return getMockData();
  }
}
