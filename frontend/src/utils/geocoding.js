// Geocoding utility using OpenStreetMap Nominatim API
// Free service, no API key required

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Cache to avoid repeated API calls for same locations
const locationCache = new Map();

/**
 * Geocode a location string to coordinates using Nominatim
 * @param {string} location - Location string to geocode
 * @returns {Promise<{lat: number, lng: number} | null>} Coordinates or null if not found
 */
export const geocodeLocation = async (location) => {
  if (!location || typeof location !== 'string') {
    return null;
  }

  // Normalize location string
  const normalizedLocation = location.trim().toLowerCase();
  
  // Check cache first
  if (locationCache.has(normalizedLocation)) {
    return locationCache.get(normalizedLocation);
  }

  try {
    // Add delay to respect Nominatim's usage policy (max 1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const params = new URLSearchParams({
      q: location,
      format: 'json',
      limit: 1,
      countrycodes: 'ph', // Limit to Philippines since that's our focus
      addressdetails: 1
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
      headers: {
        'User-Agent': 'JuvoAI/1.0 (Child Safety Platform)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      
      // Cache the result
      locationCache.set(normalizedLocation, result);
      
      return result;
    }

    // Cache null result to avoid repeated failed lookups
    locationCache.set(normalizedLocation, null);
    return null;

  } catch (error) {
    console.error(`Error geocoding location "${location}":`, error);
    return null;
  }
};

/**
 * Batch geocode multiple locations with rate limiting
 * @param {string[]} locations - Array of location strings
 * @returns {Promise<Map<string, {lat: number, lng: number} | null>>} Map of location to coordinates
 */
export const batchGeocodeLocations = async (locations) => {
  const results = new Map();
  
  for (const location of locations) {
    if (location && typeof location === 'string') {
      const coords = await geocodeLocation(location);
      results.set(location, coords);
    }
  }
  
  return results;
};

/**
 * Get cached location coordinates without making API calls
 * @param {string} location - Location string
 * @returns {{lat: number, lng: number} | null} Cached coordinates or null
 */
export const getCachedLocation = (location) => {
  if (!location || typeof location !== 'string') {
    return null;
  }
  
  const normalizedLocation = location.trim().toLowerCase();
  return locationCache.get(normalizedLocation) || null;
};

/**
 * Clear the location cache
 */
export const clearLocationCache = () => {
  locationCache.clear();
};

/**
 * Get cache statistics
 * @returns {{size: number, entries: string[]}} Cache info
 */
export const getCacheInfo = () => {
  return {
    size: locationCache.size,
    entries: Array.from(locationCache.keys())
  };
};