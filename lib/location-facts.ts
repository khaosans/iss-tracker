// Collection of interesting facts about different locations around the world
// Organized by regions to make it easier to match with ISS position

export interface LocationFact {
  id: string;
  region: string;
  latitude: [number, number]; // [min, max] latitude range
  longitude: [number, number]; // [min, max] longitude range
  fact: string;
  source?: string;
}

export const locationFacts: LocationFact[] = [
  // Oceans
  {
    id: 'pacific-ocean',
    region: 'Pacific Ocean',
    latitude: [-60, 60],
    longitude: [-180, -120],
    fact: 'The Pacific Ocean is the largest and deepest ocean on Earth, containing more than half of the free water on Earth and covering an area larger than all land masses combined.',
    source: 'National Geographic'
  },
  {
    id: 'atlantic-ocean',
    region: 'Atlantic Ocean',
    latitude: [-60, 60],
    longitude: [-70, 0],
    fact: 'The Atlantic Ocean is the second-largest ocean and contains the Puerto Rico Trench, which reaches depths of 8,376 meters.',
    source: 'NOAA'
  },
  {
    id: 'indian-ocean',
    region: 'Indian Ocean',
    latitude: [-60, 30],
    longitude: [40, 120],
    fact: 'The Indian Ocean is the warmest ocean in the world and is home to 40% of the world\'s offshore oil production.',
    source: 'World Ocean Review'
  },
  
  // Continents and Major Regions
  {
    id: 'amazon-rainforest',
    region: 'Amazon Rainforest',
    latitude: [-10, 5],
    longitude: [-75, -50],
    fact: 'The Amazon Rainforest produces about 20% of Earth\'s oxygen and is home to 10% of the world\'s known species.',
    source: 'World Wildlife Fund'
  },
  {
    id: 'sahara-desert',
    region: 'Sahara Desert',
    latitude: [15, 30],
    longitude: [-15, 30],
    fact: 'The Sahara is the largest hot desert in the world, covering about 3.6 million square miles, roughly the size of the United States.',
    source: 'NASA Earth Observatory'
  },
  {
    id: 'himalayas',
    region: 'Himalayan Mountains',
    latitude: [27, 35],
    longitude: [70, 95],
    fact: 'The Himalayas contain 9 of the 10 highest peaks on Earth, including Mount Everest, and the range is still growing about 5mm per year due to tectonic activity.',
    source: 'National Geographic'
  },
  {
    id: 'antarctica',
    region: 'Antarctica',
    latitude: [-90, -60],
    longitude: [-180, 180],
    fact: 'Antarctica is the coldest, windiest, and driest continent. About 90% of the world\'s ice is in Antarctica, representing about 70% of the world\'s fresh water.',
    source: 'British Antarctic Survey'
  },
  
  // Countries and Cities
  {
    id: 'japan',
    region: 'Japan',
    latitude: [30, 45],
    longitude: [130, 145],
    fact: 'Japan consists of 6,852 islands and experiences about 1,500 earthquakes each year due to its location along the "Ring of Fire."',
    source: 'Japan National Tourism Organization'
  },
  {
    id: 'australia',
    region: 'Australia',
    latitude: [-40, -10],
    longitude: [110, 155],
    fact: 'Australia is the only nation to govern an entire continent and is home to 80% of species that cannot be found anywhere else in the world.',
    source: 'Australian Government'
  },
  {
    id: 'great-barrier-reef',
    region: 'Great Barrier Reef',
    latitude: [-24, -10],
    longitude: [142, 154],
    fact: 'The Great Barrier Reef is the world\'s largest coral reef system, composed of over 2,900 individual reefs and visible from space.',
    source: 'Great Barrier Reef Marine Park Authority'
  },
  {
    id: 'north-america',
    region: 'North America',
    latitude: [15, 70],
    longitude: [-170, -50],
    fact: 'North America contains the Great Lakes, which form the largest surface freshwater system on Earth, containing 21% of the world\'s surface fresh water by volume.',
    source: 'EPA'
  },
  {
    id: 'europe',
    region: 'Europe',
    latitude: [35, 70],
    longitude: [-10, 40],
    fact: 'Europe is the only continent without a desert and has more navigable rivers than any other continent in the world.',
    source: 'European Environment Agency'
  },
  {
    id: 'africa',
    region: 'Africa',
    latitude: [-35, 35],
    longitude: [-20, 50],
    fact: 'Africa is the second largest continent and contains the world\'s longest river (the Nile), the largest hot desert (the Sahara), and over 3,000 distinct ethnic groups.',
    source: 'United Nations'
  },
  {
    id: 'south-america',
    region: 'South America',
    latitude: [-55, 15],
    longitude: [-80, -35],
    fact: 'South America is home to the world\'s highest waterfall (Angel Falls), the largest rainforest (Amazon), and the driest place on Earth (Atacama Desert).',
    source: 'UNESCO'
  },
  {
    id: 'asia',
    region: 'Asia',
    latitude: [0, 75],
    longitude: [40, 180],
    fact: 'Asia is the largest continent, covering about 30% of Earth\'s total land area, and is home to about 60% of the world\'s population.',
    source: 'United Nations'
  }
];

/**
 * Finds a location fact based on the current ISS position
 * @param latitude Current ISS latitude
 * @param longitude Current ISS longitude
 * @returns A location fact or undefined if no match is found
 */
export function findLocationFact(latitude: number, longitude: number): LocationFact | undefined {
  // Normalize longitude to -180 to 180 range
  const normalizedLongitude = ((longitude + 540) % 360) - 180;
  
  return locationFacts.find(fact => {
    return latitude >= fact.latitude[0] && 
           latitude <= fact.latitude[1] && 
           normalizedLongitude >= fact.longitude[0] && 
           normalizedLongitude <= fact.longitude[1];
  });
}

/**
 * Gets a random fact from the collection
 * @returns A random location fact
 */
export function getRandomFact(): LocationFact {
  const randomIndex = Math.floor(Math.random() * locationFacts.length);
  return locationFacts[randomIndex];
}