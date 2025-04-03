import { LocationFact } from './types';
import { findLocationFact, getRandomFact } from './location-facts';

/**
 * Generate a fact about the current location using local data only
 * @param latitude Current ISS latitude
 * @param longitude Current ISS longitude
 * @returns A promise that resolves to a LocationFact object
 */
export async function generateLocationFact(
  latitude: number,
  longitude: number
): Promise<LocationFact> {
  // First check if we have a predefined fact for this location
  const predefinedFact = findLocationFact(latitude, longitude);
  
  // If we have a predefined fact, return it
  if (predefinedFact) {
    return predefinedFact;
  }
  
  // Otherwise, generate a fact based on the region
  const region = getRegionName(latitude, longitude);
  
  // Generate a fact using templates instead of LLM
  const generatedFact = generateTemplatedFact(latitude, longitude, region);
  
  // Create a unique ID based on coordinates
  const id = `local-${Math.round(latitude)}-${Math.round(longitude)}`;
  
  return {
    id,
    region: region,
    latitude: [latitude - 5, latitude + 5], // Create a small range around the current position
    longitude: [longitude - 5, longitude + 5],
    fact: generatedFact,
    source: 'Local Data'
  };
}

/**
 * Get a general region name based on coordinates
 * This is a simple implementation - in a production app, you might use a reverse geocoding service
 */
function getRegionName(latitude: number, longitude: number): string {
  // Simple logic to determine if we're over land or water
  
  // Check if we're over a pole
  if (latitude > 66.5) return 'Arctic Region';
  if (latitude < -66.5) return 'Antarctic Region';
  
  // Very basic ocean detection
  // Pacific
  if ((longitude < -30 && longitude > -180) || (longitude > 150 && longitude <= 180)) return 'Pacific Ocean';
  // Atlantic
  if ((longitude >= -30 && longitude < 0) || (longitude >= -80 && longitude < -30)) return 'Atlantic Ocean';
  // Indian
  if (longitude >= 40 && longitude < 100 && latitude < 30) return 'Indian Ocean';
  
  // Basic continent detection
  // North America
  if (latitude >= 15 && latitude <= 70 && longitude >= -170 && longitude <= -50) return 'North America';
  // South America
  if (latitude >= -55 && latitude <= 15 && longitude >= -80 && longitude <= -35) return 'South America';
  // Europe
  if (latitude >= 35 && latitude <= 70 && longitude >= -10 && longitude <= 40) return 'Europe';
  // Africa
  if (latitude >= -35 && latitude <= 35 && longitude >= -20 && longitude <= 50) return 'Africa';
  // Asia
  if (latitude >= 0 && latitude <= 75 && longitude >= 40 && longitude <= 180) return 'Asia';
  // Australia/Oceania
  if (latitude >= -40 && latitude <= -10 && longitude >= 110 && longitude <= 155) return 'Australia';
  
  // Default
  return 'Unknown Region';
}

/**
 * Generate a fact using templates instead of LLM
 */
function generateTemplatedFact(latitude: number, longitude: number, region: string): string {
  // Templates for different regions
  const templates: Record<string, string[]> = {
    'Pacific Ocean': [
      'The Pacific Ocean covers more than 30% of Earth\'s surface.',
      'The Pacific Ocean contains the Mariana Trench, the deepest point on Earth at nearly 11,000 meters.',
      'The Pacific Ocean is home to thousands of islands, including Hawaii and Fiji.'
    ],
    'Atlantic Ocean': [
      'The Atlantic Ocean is the second-largest ocean and is named after Atlas from Greek mythology.',
      'The Atlantic Ocean has an average depth of 3,646 meters (11,962 feet).',
      'The Atlantic Ocean is crossed by the Mid-Atlantic Ridge, the longest mountain range in the world.'
    ],
    'Indian Ocean': [
      'The Indian Ocean is the warmest ocean in the world.',
      'The Indian Ocean is home to many endangered marine species, including sea turtles and dugongs.',
      'The Indian Ocean has the fewest marginal seas of all major oceans.'
    ],
    'Arctic Region': [
      'The Arctic is warming twice as fast as the global average due to climate change.',
      'The Arctic Ocean is the smallest and shallowest of the world\'s five oceans.',
      'During winter, much of the Arctic Ocean surface freezes, with the ice pack doubling the size of the Arctic\'s land area.'
    ],
    'Antarctic Region': [
      'Antarctica is the coldest, windiest, and driest continent on Earth.',
      'Antarctica contains about 90% of the world\'s ice, representing about 70% of Earth\'s fresh water.',
      'Antarctica has no permanent human residents, only research stations with rotating staff.'
    ],
    'North America': [
      'North America is the third-largest continent by area and has diverse ecosystems from arctic tundra to tropical rainforest.',
      'North America contains the Great Lakes, which form the largest surface freshwater system on Earth.',
      'North America is home to the Grand Canyon, one of the most spectacular natural formations on the planet.'
    ],
    'South America': [
      'South America is home to the Amazon Rainforest, which produces about 20% of Earth\'s oxygen.',
      'South America contains the Andes, the world\'s longest continental mountain range.',
      'South America has the world\'s highest waterfall, Angel Falls in Venezuela, with a height of 979 meters.'
    ],
    'Europe': [
      'Europe is the only continent without a desert.',
      'Europe has more navigable rivers than any other continent in the world.',
      'Europe is the second-smallest continent but has the third-largest population.'
    ],
    'Africa': [
      'Africa is the second-largest continent and contains the world\'s longest river, the Nile.',
      'Africa has the largest hot desert in the world, the Sahara, covering about 9.2 million square kilometers.',
      'Africa is home to more than 3,000 distinct ethnic groups and over 2,000 languages.'
    ],
    'Asia': [
      'Asia is the largest continent, covering about 30% of Earth\'s total land area.',
      'Asia is home to about 60% of the world\'s population.',
      'Asia contains both the highest point on Earth (Mount Everest) and the lowest point (Dead Sea).'
    ],
    'Australia': [
      'Australia is the only nation to govern an entire continent.',
      'Australia is home to unique wildlife found nowhere else, including kangaroos, koalas, and platypuses.',
      'Australia has the largest coral reef system in the world, the Great Barrier Reef.'
    ]
  };
  
  // Get templates for the region or use default templates
  const regionTemplates = templates[region] || [
    `You are currently over ${region}.`,
    `The ISS is passing over ${region} at coordinates ${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°.`,
    `This area (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°) is part of ${region}.`
  ];
  
  // Select a random template
  const randomIndex = Math.floor(Math.random() * regionTemplates.length);
  return regionTemplates[randomIndex];
}