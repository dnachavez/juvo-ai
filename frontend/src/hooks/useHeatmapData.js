import { useState, useEffect, useCallback } from 'react';
import { fetchAnalyzedData } from '../utils/analyzedDataApi';
import { batchGeocodeLocations } from '../utils/geocoding';

/**
 * Custom hook to fetch analyzed data and generate heatmap points
 * @returns {Object} Hook return object
 */
export const useHeatmapData = () => {
  const [heatmapPoints, setHeatmapPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationStats, setLocationStats] = useState({
    total: 0,
    geocoded: 0,
    failed: 0
  });

  /**
   * Process analyzed data into heatmap points
   */
  const processAnalyzedData = useCallback(async (analyzedData) => {
    try {
      // Extract unique locations from analyzed data
      const locationCounts = new Map();
      const locationRisks = new Map();
      
      analyzedData.forEach(item => {
        if (item.location_detected && typeof item.location_detected === 'string') {
          const location = item.location_detected;
          
          // Count incidents per location
          locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
          
          // Track highest risk level per location
          const currentRisk = locationRisks.get(location);
          const itemRisk = item.risk_level;
          
          if (!currentRisk || getRiskPriority(itemRisk) > getRiskPriority(currentRisk)) {
            locationRisks.set(location, itemRisk);
          }
        }
      });

      const uniqueLocations = Array.from(locationCounts.keys());
      setLocationStats(prev => ({ ...prev, total: uniqueLocations.length }));

      // Batch geocode all unique locations
      const geocodeResults = await batchGeocodeLocations(uniqueLocations);
      
      // Build heatmap points
      const points = [];
      let geocodedCount = 0;
      let failedCount = 0;

      for (const [location, coordinates] of geocodeResults) {
        if (coordinates) {
          geocodedCount++;
          points.push({
            lat: coordinates.lat,
            lng: coordinates.lng,
            risk: locationRisks.get(location) || 'low',
            label: location,
            count: locationCounts.get(location) || 1
          });
        } else {
          failedCount++;
          console.warn(`Failed to geocode location: ${location}`);
        }
      }

      setLocationStats({
        total: uniqueLocations.length,
        geocoded: geocodedCount,
        failed: failedCount
      });

      return points;
    } catch (error) {
      console.error('Error processing analyzed data for heatmap:', error);
      throw error;
    }
  }, []);

  /**
   * Fetch and process data
   */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const analyzedData = await fetchAnalyzedData();
      
      // Ensure we have an array, but don't fail if empty or invalid
      const dataArray = Array.isArray(analyzedData) ? analyzedData : [];
      
      if (dataArray.length === 0) {
        console.warn('No analyzed data found, showing empty map');
        setHeatmapPoints([]);
        setLocationStats({ total: 0, geocoded: 0, failed: 0 });
        return;
      }

      const points = await processAnalyzedData(dataArray);
      setHeatmapPoints(points);

    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError(err.message || 'Failed to fetch heatmap data');
      setHeatmapPoints([]);
      setLocationStats({ total: 0, geocoded: 0, failed: 0 });
    } finally {
      setLoading(false);
    }
  }, [processAnalyzedData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Refresh the heatmap data
   */
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    heatmapPoints,
    loading,
    error,
    locationStats,
    refreshData
  };
};

/**
 * Helper function to determine risk priority for comparison
 * @param {string} risk - Risk level
 * @returns {number} Priority value
 */
function getRiskPriority(risk) {
  switch (risk?.toLowerCase()) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
}

export default useHeatmapData;