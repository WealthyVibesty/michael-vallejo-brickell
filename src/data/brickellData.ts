import { EMBEDDED_IMAGES } from './embeddedImages';

export const VISUAL_ASSETS = {
  heroSkyline: EMBEDDED_IMAGES.heroSkyline,
  brickellFlatiron: EMBEDDED_IMAGES.brickellFlatiron,
  echoBrickell: EMBEDDED_IMAGES.echoBrickell,
  reachRise: EMBEDDED_IMAGES.reachRise,
  slsLux: EMBEDDED_IMAGES.slsLux,
  michaelPortrait: EMBEDDED_IMAGES.michaelPortrait,
  condoPenthouseLiving: EMBEDDED_IMAGES.condoPenthouseLiving,
  condoBayviewTerrace: EMBEDDED_IMAGES.condoBayviewTerrace,
  condoMasterSuite: EMBEDDED_IMAGES.condoMasterSuite
} as const;

export type IntentOption = 'Rent' | 'Buy' | 'Lease Out My Unit';
export type TimelineOption = 'Immediate / 30 Days' | '30–90 Days' | 'Exploring';
export type BudgetOption =
  | '$3,500 – $5,500/mo'
  | '$5,500 – $10,000/mo'
  | '$10,000+/mo or Purchase';

export interface CuratedResidence {
  id: string;
  towerId: string;
  towerName: string;
  address: string;
  unitNumber: string;
  neighborhood: string;
  beds: number;
  baths: number;
  squareFeet: number;
  monthlyRent: string;
  monthlyRentNumeric: number;
  purchasePrice: string;
  purchasePriceNumeric: number;
  pricePerSf: string;
  statusTag: 'Private Exclusive' | 'New to Market' | 'Compass-Style Pocket';
  hoaTurnaround: string;
  walkTo830Brickell: string;
  michaelTake: string;
  images: string[];
  mapPosition: { x: number; y: number };
  budgetBucket: BudgetOption[];
  intents: IntentOption[];
}

export interface BrickellTower {
  id: string;
  name: string;
  shortName: string;
  address: string;
  stories: string;
  yearBuilt: string;
  avgRentDisplay: string;
  purchaseRange: string;
  avgPricePerSf: string;
  hoaTimeline: string;
  walkTo830Brickell: string;
  image: string;
  tagline: string;
  keyAmenities: string[];
  activeVacanciesCount: number;
}

export const BRICKELL_TOWERS: BrickellTower[] = [
  {
    id: 'brickell-flatiron',
    name: 'Brickell Flatiron',
    shortName: 'Brickell Flatiron',
    address: '1000 Brickell Plaza',
    stories: '64 Stories',
    yearBuilt: '2019',
    avgRentDisplay: '$4,200 – $14,000/mo',
    purchaseRange: '$820K – $4.8M',
    avgPricePerSf: '$1,085/SF',
    hoaTimeline: '12 Days HOA',
    walkTo830Brickell: '2 Min Walk to 830 Brickell',
    image: VISUAL_ASSETS.brickellFlatiron,
    tagline: '64th-Floor Sky Pool, Recovery Spa & Snaidero Finishes.',
    keyAmenities: ['64th Floor Sky Pool', '18th Floor Lap Pool', '24-Hr Valet', 'Private Wine Cellar'],
    activeVacanciesCount: 6
  },
  {
    id: 'echo-brickell',
    name: 'Echo Brickell',
    shortName: 'Echo Brickell',
    address: '1451 Brickell Ave',
    stories: '57 Stories',
    yearBuilt: '2017',
    avgRentDisplay: '$4,800 – $18,000/mo',
    purchaseRange: '$1.15M – $6.5M',
    avgPricePerSf: '$1,240/SF',
    hoaTimeline: '10 Days HOA',
    walkTo830Brickell: '6 Min Walk to 830 Brickell',
    image: VISUAL_ASSETS.echoBrickell,
    tagline: 'Boutique 180-Unit Tower with Summer Kitchens & Bay Views.',
    keyAmenities: ['Infinity Bay Pool', 'Summer Kitchen Terraces', 'Apple Smart Home', '180-Unit Privacy'],
    activeVacanciesCount: 4
  },
  {
    id: 'reach-rise-bcc',
    name: 'Reach & Rise at Brickell City Centre',
    shortName: 'Reach & Rise BCC',
    address: '68 SE 6th St',
    stories: '43 Stories',
    yearBuilt: '2016',
    avgRentDisplay: '$3,600 – $9,500/mo',
    purchaseRange: '$740K – $2.9M',
    avgPricePerSf: '$960/SF',
    hoaTimeline: '10 Days HOA',
    walkTo830Brickell: '3 Min Walk to 830 Brickell',
    image: VISUAL_ASSETS.reachRise,
    tagline: 'Direct Indoor Elevator Access to Brickell City Centre.',
    keyAmenities: ['Direct Mall Access', 'Half-Acre Deck', 'Hammam Spa', 'Biometric Elevators'],
    activeVacanciesCount: 7
  },
  {
    id: 'sls-lux-brickell-heights',
    name: 'SLS Lux & Brickell Heights',
    shortName: 'SLS Lux & Heights',
    address: '805 S Miami Ave',
    stories: '57 Stories',
    yearBuilt: '2018',
    avgRentDisplay: '$3,400 – $8,000/mo',
    purchaseRange: '$620K – $1.95M',
    avgPricePerSf: '$845/SF',
    hoaTimeline: '14 Days HOA',
    walkTo830Brickell: '3 Min Walk to 830 Brickell',
    image: VISUAL_ASSETS.slsLux,
    tagline: 'Private Elevator Foyers & 3-Story Equinox On-Site.',
    keyAmenities: ['Equinox On-Site', '57th Floor Sky Lounge', 'Private Elevators', 'Resort Cabanas'],
    activeVacanciesCount: 8
  }
];

export const CURATED_RESIDENCES: CuratedResidence[] = [
  {
    id: 'RES-BF-5101',
    towerId: 'brickell-flatiron',
    towerName: 'Brickell Flatiron',
    address: '1000 Brickell Plaza, PH 5101',
    unitNumber: 'Apt 5101',
    neighborhood: 'Brickell · Miami, FL 33131',
    beds: 3,
    baths: 3.5,
    squareFeet: 2140,
    monthlyRent: '$12,500/mo',
    monthlyRentNumeric: 12500,
    purchasePrice: '$2,450,000',
    purchasePriceNumeric: 2450000,
    pricePerSf: '$1,145/SF',
    statusTag: 'Private Exclusive',
    hoaTurnaround: '12-Day HOA Approval',
    walkTo830Brickell: '2 Min to 830 Brickell',
    michaelTake:
      'Premier SE corner 01-stack with wrap-around glass terrace, unobstructed Biscayne Bay views, and Miele wine column.',
    images: [
      VISUAL_ASSETS.condoPenthouseLiving,
      VISUAL_ASSETS.brickellFlatiron,
      VISUAL_ASSETS.condoBayviewTerrace
    ],
    mapPosition: { x: 56, y: 48 },
    budgetBucket: ['$10,000+/mo or Purchase'],
    intents: ['Rent', 'Buy']
  },
  {
    id: 'RES-EB-4202',
    towerId: 'echo-brickell',
    towerName: 'Echo Brickell',
    address: '1451 Brickell Ave, Apt 4202',
    unitNumber: 'Apt 4202',
    neighborhood: 'Brickell · Miami, FL 33131',
    beds: 2,
    baths: 2.5,
    squareFeet: 1620,
    monthlyRent: '$11,200/mo',
    monthlyRentNumeric: 11200,
    purchasePrice: '$2,180,000',
    purchasePriceNumeric: 2180000,
    pricePerSf: '$1,345/SF',
    statusTag: 'Private Exclusive',
    hoaTurnaround: '10-Day HOA Approval',
    walkTo830Brickell: '6 Min to 830 Brickell',
    michaelTake:
      '12-foot ceilings with built-in outdoor summer kitchen over Biscayne Bay. Turnkey for Citadel or legal executives.',
    images: [
      VISUAL_ASSETS.condoBayviewTerrace,
      VISUAL_ASSETS.echoBrickell,
      VISUAL_ASSETS.condoMasterSuite
    ],
    mapPosition: { x: 58, y: 72 },
    budgetBucket: ['$10,000+/mo or Purchase'],
    intents: ['Rent', 'Buy']
  },
  {
    id: 'RES-BF-3604',
    towerId: 'brickell-flatiron',
    towerName: 'Brickell Flatiron',
    address: '1000 Brickell Plaza, Apt 3604',
    unitNumber: 'Apt 3604',
    neighborhood: 'Brickell · Miami, FL 33131',
    beds: 2,
    baths: 2.5,
    squareFeet: 1385,
    monthlyRent: '$7,400/mo',
    monthlyRentNumeric: 7400,
    purchasePrice: '$1,420,000',
    purchasePriceNumeric: 1420000,
    pricePerSf: '$1,025/SF',
    statusTag: 'New to Market',
    hoaTurnaround: '12-Day HOA Approval',
    walkTo830Brickell: '2 Min to 830 Brickell',
    michaelTake:
      'High-floor split 2-bedroom with motorized blackout shades, Italian marble floors, and 64th-floor Sky Pool access.',
    images: [
      VISUAL_ASSETS.condoMasterSuite,
      VISUAL_ASSETS.brickellFlatiron,
      VISUAL_ASSETS.condoPenthouseLiving
    ],
    mapPosition: { x: 35, y: 60 },
    budgetBucket: ['$5,500 – $10,000/mo', '$10,000+/mo or Purchase'],
    intents: ['Rent', 'Buy', 'Lease Out My Unit']
  },
  {
    id: 'RES-RR-2905',
    towerId: 'reach-rise-bcc',
    towerName: 'Reach at Brickell City Centre',
    address: '68 SE 6th St, Apt 2905',
    unitNumber: 'Apt 2905',
    neighborhood: 'Brickell · Miami, FL 33131',
    beds: 2,
    baths: 2.5,
    squareFeet: 1295,
    monthlyRent: '$6,800/mo',
    monthlyRentNumeric: 6800,
    purchasePrice: '$1,240,000',
    purchasePriceNumeric: 1240000,
    pricePerSf: '$957/SF',
    statusTag: 'Private Exclusive',
    hoaTurnaround: '10-Day HOA Approval',
    walkTo830Brickell: '3 Min to 830 Brickell',
    michaelTake:
      'Private elevator entry and direct indoor elevator down to Brickell City Centre dining, Saks, and offices.',
    images: [
      VISUAL_ASSETS.reachRise,
      VISUAL_ASSETS.condoPenthouseLiving,
      VISUAL_ASSETS.condoBayviewTerrace
    ],
    mapPosition: { x: 56, y: 25 },
    budgetBucket: ['$5,500 – $10,000/mo', '$10,000+/mo or Purchase'],
    intents: ['Rent', 'Buy', 'Lease Out My Unit']
  },
  {
    id: 'RES-SLS-3806',
    towerId: 'sls-lux-brickell-heights',
    towerName: 'SLS Lux Brickell',
    address: '805 S Miami Ave, Apt 3806',
    unitNumber: 'Apt 3806',
    neighborhood: 'Brickell · Miami, FL 33131',
    beds: 2,
    baths: 2,
    squareFeet: 1145,
    monthlyRent: '$5,100/mo',
    monthlyRentNumeric: 5100,
    purchasePrice: '$895,000',
    purchasePriceNumeric: 895000,
    pricePerSf: '$781/SF',
    statusTag: 'New to Market',
    hoaTurnaround: '14-Day HOA Approval',
    walkTo830Brickell: '3 Min to 830 Brickell',
    michaelTake:
      'Private foyer elevator, enclosed den for home office setup, and 60 seconds from 830 Brickell & Equinox.',
    images: [
      VISUAL_ASSETS.slsLux,
      VISUAL_ASSETS.condoMasterSuite,
      VISUAL_ASSETS.condoBayviewTerrace
    ],
    mapPosition: { x: 28, y: 40 },
    budgetBucket: ['$3,500 – $5,500/mo', '$5,500 – $10,000/mo'],
    intents: ['Rent', 'Buy', 'Lease Out My Unit']
  },
  {
    id: 'RES-RR-1908',
    towerId: 'reach-rise-bcc',
    towerName: 'Rise at Brickell City Centre',
    address: '88 SW 7th St, Apt 1908',
    unitNumber: 'Apt 1908',
    neighborhood: 'Brickell · Miami, FL 33131',
    beds: 1,
    baths: 1.5,
    squareFeet: 960,
    monthlyRent: '$4,400/mo',
    monthlyRentNumeric: 4400,
    purchasePrice: '$790,000',
    purchasePriceNumeric: 790000,
    pricePerSf: '$822/SF',
    statusTag: 'Compass-Style Pocket',
    hoaTurnaround: '10-Day HOA Approval',
    walkTo830Brickell: '3 Min to 830 Brickell',
    michaelTake:
      'Fastest 1-bedroom corporate move-in in Brickell. Includes half-acre amenity deck and hammam spa access.',
    images: [
      VISUAL_ASSETS.condoBayviewTerrace,
      VISUAL_ASSETS.reachRise,
      VISUAL_ASSETS.condoPenthouseLiving
    ],
    mapPosition: { x: 32, y: 21 },
    budgetBucket: ['$3,500 – $5,500/mo'],
    intents: ['Rent', 'Buy', 'Lease Out My Unit']
  }
];
