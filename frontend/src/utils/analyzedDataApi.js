// API utility to fetch analyzed data from the analyzed_data folder

const API_BASE = 'http://localhost:3001'; // Simple backend API

export const fetchAnalyzedData = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/analyzed-data`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    // Extract the data array from the response
    return result.data || [];
  } catch (error) {
    console.error('Error fetching analyzed data:', error);
    throw error;
  }
};

export const fetchAnalyzedDataFile = async (filename) => {
  try {
    const response = await fetch(`${API_BASE}/api/analyzed-data/${filename}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching analyzed data file ${filename}:`, error);
    throw error;
  }
};