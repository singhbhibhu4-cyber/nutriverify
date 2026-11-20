export type ProductCategory = 'whey' | 'creatine' | 'essentials' | 'stacks';

export interface HeavyMetalMetric {
  element: string;
  testedPpm: string;
  fssaiLimitPpm: string;
  passed: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  categoryLabel: string;
  weight: string;
  servings: number;
  servingSizeG: number;
  flavors: string[];
  priceInr: number;
  mrpInr: number;
  claimedActiveLabel: string;
  claimedProteinG: number;
  testedProteinG: number;
  accuracyPercent: number;
  costPerGramProteinInr: number | null;
  batchCode: string;
  nablCertId: string;
  labName: string;
  testedDate: string;
  expiryDate: string;
  aminoSpikingClear: boolean;
  melamineClear: boolean;
  heavyMetals: HeavyMetalMetric[];
  dispatchChain: {
    manufacturer: string;
    labFacility: string;
    fulfillmentHub: string;
  };
  packagingStyle: 'tub-dark' | 'tub-stone' | 'tub-forest' | 'canister' | 'bottle' | 'bundle';
  inStock: boolean;
  tag?: string;
  description: string;
  ingredients: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 'avvatar-whey-1kg',
    name: 'Whey Protein Concentrate & Isolate',
    brand: 'Avvatar',
    category: 'whey',
    categoryLabel: 'Whey Protein',
    weight: '1 kg',
    servings: 29,
    servingSizeG: 35,
    flavors: ['Belgian Chocolate', 'Malai Kulfi', 'Unflavoured'],
    priceInr: 2400,
    mrpInr: 3199,
    claimedActiveLabel: '27.0g protein / 35g scoop',
    claimedProteinG: 27.0,
    testedProteinG: 27.6,
    accuracyPercent: 102.2,
    costPerGramProteinInr: 3.0,
    batchCode: 'NV-AVV-2611-04',
    nablCertId: 'TC-5436-261104',
    labName: 'Eurofins Analytical Services India',
    testedDate: '04 Nov 2026',
    expiryDate: 'Oct 2027',
    aminoSpikingClear: true,
    melamineClear: true,
    heavyMetals: [
      { element: 'Lead (Pb)', testedPpm: '0.04', fssaiLimitPpm: '< 2.50', passed: true },
      { element: 'Arsenic (As)', testedPpm: 'ND (<0.01)', fssaiLimitPpm: '< 1.10', passed: true },
      { element: 'Mercury (Hg)', testedPpm: 'ND (<0.005)', fssaiLimitPpm: '< 1.00', passed: true },
      { element: 'Cadmium (Cd)', testedPpm: '0.01', fssaiLimitPpm: '< 1.50', passed: true },
    ],
    dispatchChain: {
      manufacturer: 'Parag Milk Foods Plant, Manchar (Direct B2B Lot)',
      labFacility: 'Eurofins NABL Lab #TC-5436, Bengaluru',
      fulfillmentHub: 'NutriVerify Dehradun Campus Hub, Rajpur Rd',
    },
    packagingStyle: 'tub-dark',
    inStock: true,
    tag: 'Student Bestseller',
    description:
      '100% vegetarian milk-sourced whey processed within 24 hours of milking. Sourced directly from the manufacturer with independent NABL Kjeldahl protein verification on every lot.',
    ingredients:
      'Whey Protein Concentrate, Whey Protein Isolate, Cocoa Powder, Natural & Nature-Identical Flavouring, Sunflower Lecithin, Sucralose.',
  },
  {
    id: 'muscleblaze-biozyme-1kg',
    name: 'Biozyme Performance Whey',
    brand: 'MuscleBlaze',
    category: 'whey',
    categoryLabel: 'Whey Protein',
    weight: '1 kg',
    servings: 28,
    servingSizeG: 36,
    flavors: ['Rich Chocolate', 'Magical Mango', 'French Vanilla'],
    priceInr: 2350,
    mrpInr: 3099,
    claimedActiveLabel: '25.0g protein / 36g scoop',
    claimedProteinG: 25.0,
    testedProteinG: 25.4,
    accuracyPercent: 101.6,
    costPerGramProteinInr: 3.3,
    batchCode: 'NV-MBZ-2610-19',
    nablCertId: 'TC-6128-261019',
    labName: 'TUV SUD South Asia Testing Lab',
    testedDate: '19 Oct 2026',
    expiryDate: 'Sep 2027',
    aminoSpikingClear: true,
    melamineClear: true,
    heavyMetals: [
      { element: 'Lead (Pb)', testedPpm: '0.03', fssaiLimitPpm: '< 2.50', passed: true },
      { element: 'Arsenic (As)', testedPpm: 'ND (<0.01)', fssaiLimitPpm: '< 1.10', passed: true },
      { element: 'Mercury (Hg)', testedPpm: 'ND (<0.005)', fssaiLimitPpm: '< 1.00', passed: true },
      { element: 'Cadmium (Cd)', testedPpm: '0.02', fssaiLimitPpm: '< 1.50', passed: true },
    ],
    dispatchChain: {
      manufacturer: 'Bright Lifecare Authorized Primary Dispatch, Haryana',
      labFacility: 'TUV SUD NABL Accredited Lab #TC-6128, Gurugram',
      fulfillmentHub: 'NutriVerify Dehradun Campus Hub, Rajpur Rd',
    },
    packagingStyle: 'tub-stone',
    inStock: true,
    description:
      'Enhanced Absorption Formula (EAF) whey engineered for comfortable daily digestion during heavy campus training blocks. Verified free from undeclared glycine or taurine spiking.',
    ingredients:
      'Whey Protein Concentrate, Whey Protein Isolate, Cocoa Solids, Digestive Enzyme Blend (Protease, Papain), Sodium Chloride, Sucralose.',
  },
  {
    id: 'nakpro-gold-whey-1kg',
    name: 'Gold Whey Protein Concentrate',
    brand: 'Nakpro',
    category: 'whey',
    categoryLabel: 'Whey Protein',
    weight: '1 kg',
    servings: 30,
    servingSizeG: 33,
    flavors: ['Double Rich Chocolate', 'Unflavoured Raw', 'Coffee'],
    priceInr: 1890,
    mrpInr: 2599,
    claimedActiveLabel: '25.5g protein / 33g scoop',
    claimedProteinG: 25.5,
    testedProteinG: 25.2,
    accuracyPercent: 98.8,
    costPerGramProteinInr: 2.5,
    batchCode: 'NV-NKP-2611-02',
    nablCertId: 'TC-7891-261102',
    labName: 'SGS India Food & Nutrition Lab',
    testedDate: '02 Nov 2026',
    expiryDate: 'Oct 2027',
    aminoSpikingClear: true,
    melamineClear: true,
    heavyMetals: [
      { element: 'Lead (Pb)', testedPpm: '0.05', fssaiLimitPpm: '< 2.50', passed: true },
      { element: 'Arsenic (As)', testedPpm: '0.02', fssaiLimitPpm: '< 1.10', passed: true },
      { element: 'Mercury (Hg)', testedPpm: 'ND (<0.005)', fssaiLimitPpm: '< 1.00', passed: true },
      { element: 'Cadmium (Cd)', testedPpm: '0.01', fssaiLimitPpm: '< 1.50', passed: true },
    ],
    dispatchChain: {
      manufacturer: 'Nakpro Nutrition Direct Plant, Bengaluru',
      labFacility: 'SGS India NABL Lab #TC-7891, Gurugram',
      fulfillmentHub: 'NutriVerify Dehradun Campus Hub, Rajpur Rd',
    },
    packagingStyle: 'tub-forest',
    inStock: true,
    tag: 'Lowest ₹/g Protein',
    description:
      'Budget-first student staple delivering the lowest verified cost per gram of tested protein in our catalog, with zero retail middleman markup and open NABL amino-acid profile testing.',
    ingredients:
      'Whey Protein Concentrate 80%, Cocoa Powder, Emulsifier (INS 322), Stabilizer (INS 415), Sweetener (INS 955).',
  },
  {
    id: 'nutriverify-creatine-250g',
    name: 'Micronized Creatine Monohydrate (200 Mesh)',
    brand: 'NutriVerify Direct',
    category: 'creatine',
    categoryLabel: 'Creatine',
    weight: '250 g',
    servings: 83,
    servingSizeG: 3,
    flavors: ['Unflavoured Pure', 'Citrus Tang'],
    priceInr: 649,
    mrpInr: 999,
    claimedActiveLabel: '3.0g pure creatine / 3g scoop',
    claimedProteinG: 3.0,
    testedProteinG: 2.99,
    accuracyPercent: 99.7,
    costPerGramProteinInr: null,
    batchCode: 'NV-CRT-2610-08',
    nablCertId: 'TC-5436-261008',
    labName: 'Eurofins Analytical Services India',
    testedDate: '08 Oct 2026',
    expiryDate: 'Oct 2028',
    aminoSpikingClear: true,
    melamineClear: true,
    heavyMetals: [
      { element: 'Lead (Pb)', testedPpm: 'ND (<0.01)', fssaiLimitPpm: '< 2.50', passed: true },
      { element: 'Arsenic (As)', testedPpm: 'ND (<0.01)', fssaiLimitPpm: '< 1.10', passed: true },
      { element: 'Mercury (Hg)', testedPpm: 'ND (<0.005)', fssaiLimitPpm: '< 1.00', passed: true },
      { element: 'Cadmium (Cd)', testedPpm: 'ND (<0.005)', fssaiLimitPpm: '< 1.50', passed: true },
    ],
    dispatchChain: {
      manufacturer: 'Certified GMP Nutraceutical Facility, Baddi HP',
      labFacility: 'Eurofins NABL Lab #TC-5436, Bengaluru',
      fulfillmentHub: 'NutriVerify Dehradun Campus Hub, Rajpur Rd',
    },
    packagingStyle: 'canister',
    inStock: true,
    description:
      'HPLC-assayed 99.7% pure micronized creatine monohydrate. Screened for creatinine degradation, dicyandiamide (DCD), and heavy metals for reliable strength gains over 83 days.',
    ingredients: '100% Pure Micronized Creatine Monohydrate (200 Mesh). Zero fillers or anti-caking agents.',
  },
  {
    id: 'nutriverify-daily-multi-60',
    name: 'Athlete Daily Micronutrient & Zinc Complex',
    brand: 'NutriVerify Direct',
    category: 'essentials',
    categoryLabel: 'Daily Essentials',
    weight: '60 Tablets',
    servings: 60,
    servingSizeG: 1,
    flavors: ['Unflavoured Tablets'],
    priceInr: 499,
    mrpInr: 799,
    claimedActiveLabel: '100% RDA 24 Vitamins & Minerals',
    claimedProteinG: 24.0,
    testedProteinG: 24.0,
    accuracyPercent: 100.0,
    costPerGramProteinInr: null,
    batchCode: 'NV-MLT-2611-11',
    nablCertId: 'TC-6128-261111',
    labName: 'TUV SUD South Asia Testing Lab',
    testedDate: '11 Nov 2026',
    expiryDate: 'Nov 2028',
    aminoSpikingClear: true,
    melamineClear: true,
    heavyMetals: [
      { element: 'Lead (Pb)', testedPpm: '0.02', fssaiLimitPpm: '< 2.50', passed: true },
      { element: 'Arsenic (As)', testedPpm: 'ND (<0.01)', fssaiLimitPpm: '< 1.10', passed: true },
      { element: 'Mercury (Hg)', testedPpm: 'ND (<0.005)', fssaiLimitPpm: '< 1.00', passed: true },
      { element: 'Cadmium (Cd)', testedPpm: 'ND (<0.005)', fssaiLimitPpm: '< 1.50', passed: true },
    ],
    dispatchChain: {
      manufacturer: 'ISO-22000 Certified Formulation Plant, Dehradun',
      labFacility: 'TUV SUD NABL Accredited Lab #TC-6128, Gurugram',
      fulfillmentHub: 'NutriVerify Dehradun Campus Hub, Rajpur Rd',
    },
    packagingStyle: 'bottle',
    inStock: true,
    description:
      'Formulated for hostel & PG diets where micronutrient gaps are common. Delivers verified Vitamin D3, B12, Magnesium Glycinate, and Zinc at 100% ICMR RDA.',
    ingredients:
      'Vitamin D3, Methylcobalamin (B12), Magnesium Bisglycinate, Zinc Picolinate, Vitamin C, B-Complex, Iron, Selenium.',
  },
  {
    id: 'student-batch-1-stack',
    name: 'Student Batch #1 Monthly Stack (Whey + Creatine)',
    brand: 'NutriVerify Curated',
    category: 'stacks',
    categoryLabel: 'Student Stacks',
    weight: '1 kg + 250 g',
    servings: 30,
    servingSizeG: 38,
    flavors: ['Belgian Chocolate + Pure Creatine', 'Unflavoured Raw + Pure Creatine'],
    priceInr: 2890,
    mrpInr: 4198,
    claimedActiveLabel: '27.0g Whey + 3.0g Creatine',
    claimedProteinG: 27.0,
    testedProteinG: 27.6,
    accuracyPercent: 102.2,
    costPerGramProteinInr: 2.9,
    batchCode: 'NV-STK-2611-01',
    nablCertId: 'TC-5436-261101',
    labName: 'Eurofins Analytical Services India',
    testedDate: '06 Nov 2026',
    expiryDate: 'Oct 2027',
    aminoSpikingClear: true,
    melamineClear: true,
    heavyMetals: [
      { element: 'Lead (Pb)', testedPpm: '0.03', fssaiLimitPpm: '< 2.50', passed: true },
      { element: 'Arsenic (As)', testedPpm: 'ND (<0.01)', fssaiLimitPpm: '< 1.10', passed: true },
      { element: 'Mercury (Hg)', testedPpm: 'ND (<0.005)', fssaiLimitPpm: '< 1.00', passed: true },
      { element: 'Cadmium (Cd)', testedPpm: '0.01', fssaiLimitPpm: '< 1.50', passed: true },
    ],
    dispatchChain: {
      manufacturer: 'Dual Direct B2B Lots (Parag Milk Foods + Baddi GMP)',
      labFacility: 'Eurofins NABL Lab #TC-5436, Bengaluru',
      fulfillmentHub: 'NutriVerify Dehradun Campus Hub, Rajpur Rd',
    },
    packagingStyle: 'bundle',
    inStock: true,
    tag: 'Save ₹159 vs Separate',
    description:
      'Our Dehradun campus launch bundle combining 1 kg Avvatar Whey Protein with 250 g Micronized Creatine Monohydrate. Both tubs ship with tamper-proof scannable NABL QR seals.',
    ingredients:
      'Includes 1 × 1 kg Avvatar Whey Protein (Batch NV-AVV-2611-04) and 1 × 250 g NutriVerify Creatine Monohydrate (Batch NV-CRT-2610-08).',
  },
];

export const BATCH_REGISTRY: Record<string, Product> = PRODUCTS.reduce(
  (acc, item) => {
    acc[item.batchCode.toUpperCase()] = item;
    return acc;
  },
  {} as Record<string, Product>
);

export const PROMO_CODES: Record<string, { label: string; flatDiscountInr: number; minOrderInr: number }> = {
  DEHRADUN10: {
    label: 'Dehradun Campus Starter Discount',
    flatDiscountInr: 150,
    minOrderInr: 1500,
  },
  BATCH01: {
    label: 'Student Batch #1 Pre-Order Offer',
    flatDiscountInr: 200,
    minOrderInr: 1800,
  },
};
