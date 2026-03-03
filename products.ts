export interface Product {
  slug: string;
  name: string;
  series: string;
  priceEG: string;
  priceWorldwide: string;
  image: string;
  shortDescription: string;
  description: string;
  size: string;
  sizesEG?: { size: string; price: string }[];
}

export function parsePrice(value: string | undefined | null): number | null {
  if (!value) return null;
  // Remove commas and any whitespace, then find the first number
  const match = value.replace(/,/g, '').replace(/\s/g, '').match(/(\d+(\.\d+)?)/);
  if (!match) return null;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : null;
}

export const peptides: Product[] = [
  {
    slug: 'cjc-ipamorelin',
    name: 'CJC-IPAMORELIN',
    series: 'GROWTH',
    priceEG: '4,900L.E',
    priceWorldwide: '€102.00',
    image: '/CJC-IPAMORELIN-removebg-preview.png',
    size: '10 mg / vial',
    shortDescription:
      'CJC-IPAMORELIN is a dual-peptide research blend combining a GHRH analog with a selective ghrelin receptor agonist to study coordinated growth hormone release.',
    description:
      'CJC-IPAMORELIN is a dual-peptide research compound engineered to explore amplified growth hormone pulsatility and downstream IGF-1 signaling dynamics. The combination is frequently utilized in experimental models investigating tissue repair pathways, muscle protein synthesis signaling, and recovery-related cellular processes.\n\nKEY RESEARCH BENEFITS:\n• Promotes Lean Muscle Gains\n• Supports Natural Growth hormone Release\n• Enhances Fat Metabolism\n• Accelerates Recovery\n• Improves Body Composition\n\nFor research purposes only. Not for human consumption.',
  },
  {
    slug: 'mots-c',
    name: 'MOTS-C',
    series: 'METABOLIC',
    priceEG: '4,300L.E',
    priceWorldwide: '€90.00',
    image: '/MOTS-C-removebg-preview.png',
    size: '10 mg / vial',
    shortDescription:
      'MOTS-C is a 16–amino acid mitochondrial-derived peptide used to probe metabolic stress adaptation, AMPK signaling, and cellular energy handling.',
    description:
      'MOTS-C is a 16–amino acid mitochondrial-derived peptide encoded within the 12S rRNA region of mitochondrial DNA and is frequently used to interrogate metabolic stress-adaptation pathways.\n\nKEY RESEARCH BENEFITS:\n• Improved fat oxidation and metabolism\n• Optimized nutrient partitioning\n• Enhanced cellular energy production\n• Maintained performance during cutting phases\n• Support for peak conditioning\n\nFor research purposes only. Not for human consumption.',
  },
  {
    slug: 'retatrutide',
    name: 'RETATRUTIDE',
    series: 'METABOLIC',
    priceEG: '4,500L.E',
    sizesEG: [
      { size: '10 mg / vial', price: '4,500L.E' },
      { size: '20 mg / vial', price: '9,000L.E' },
    ],
    priceWorldwide: '€95.00',
    image: '/RETATRUTIDE-removebg-preview.png',
    size: '10 mg / vial',
    shortDescription:
      'RETATRUTIDE is a long-acting tri-agonist at GLP-1, GIP, and glucagon receptors, applied in models of appetite control, energy expenditure, and glucose regulation.',
    description:
      'RETATRUTIDE is a long-acting synthetic peptide studied as a tri-agonist at GLP-1, GIP, and glucagon receptors, making it a powerful tool in advanced metabolic research.\n\nKEY RESEARCH BENEFITS:\n• Enhanced Fat Loss Support\n• Advanced Appetite Control\n• Improved Insulin Sensitivity\n• Supports Major Body Recomposition\n• Long-Acting Metabolic Regulation\n\nFor research purposes only. Not for human consumption.',
  },
  {
    slug: 'aod-9604',
    name: 'AOD-9604',
    series: 'METABOLIC',
    priceEG: '4,000L.E',
    priceWorldwide: '€80.00',
    image: '/AOD-9604-removebg-preview.png',
    size: '5 mg / vial',
    shortDescription:
      'AOD-9604 is a C-terminal fragment of human growth hormone used to isolate and investigate lipolytic signaling in adipocyte and metabolism research.',
    description:
      'AOD-9604 is a synthetic peptide corresponding to the fragment 176-191 of human growth hormone, designed to isolate specific lipolytic signaling domains without growth-related effects.\n\nKEY RESEARCH BENEFITS:\n• Supporting fat breakdown and oxidation\n• Assisting stubborn fat reduction\n• Preserving lean muscle during calorie deficits\n• Supporting metabolic efficiency\n• Enhancing conditioning during cutting phases\n\nFor research purposes only. Not for human consumption.',
  },
  {
    slug: 'bpc157-tb500',
    name: 'BPC157_TB500',
    series: 'REPAIR',
    priceEG: '5,400L.E',
    priceWorldwide: '€107.00',
    image: '/BPC157_TB500-removebg-preview.png',
    size: '10 mg / vial',
    shortDescription:
      'BPC157_TB500 is a combination of gastric and thymosin-derived peptide fragments used to explore tissue repair, angiogenesis, and microvascular support.',
    description:
      'BPC157_TB500 combines a gastric-derived compound with a thymosin beta-4 motif, yielding a synergistic blend frequently used in tissue-repair and regeneration research.\n\nKEY RESEARCH BENEFITS:\n• Accelerate muscle and tendon healing\n• Supports ligament and joint recovery\n• Helps reduce inflammation\n• Promote faster recovery after injury\n• Supports tissue regeneration\n\nFor research purposes only. Not for human consumption.',
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-CU',
    series: 'REPAIR',
    priceEG: '3,500L.E',
    sizesEG: [
      { size: '50 mg / vial', price: '3,500L.E' },
      { size: '100 mg / vial', price: '7,000L.E' },
    ],
    priceWorldwide: '€85.00',
    image: '/GHK-CU-removebg-preview.png',
    size: '50 mg / vial',
    shortDescription:
      'GHK‑CU is a copper-complexed tripeptide widely used in skin biology and regenerative research to study collagen remodeling and antioxidant responses.',
    description:
      'GHK‑CU is a naturally occurring tripeptide complexed with copper, widely utilized as a research tool in skin biology, dermal remodeling, and regenerative science.\n\nKEY RESEARCH BENEFITS:\n• Improves Skin & Hair Quality\n• Enhances Collagen Production\n• Accelerates Soft Tissue Repair\n• Reduces Inflammation\n• Supports Injury Recovery\n\nFor research purposes only. Not for human consumption.',
  },
  {
    slug: 'slu-pp-332',
    name: 'SLU-PP-332',
    series: 'RESEARCH',
    priceEG: '380L.E',
    priceWorldwide: '€78.00',
    image: '/SLU-PP-332-removebg-preview.png',
    size: '5 mg / vial',
    shortDescription:
      'SLU‑PP‑332 is an emerging research peptide used to probe mitochondrial efficiency, energy-sensing pathways, and metabolic stress signaling.',
    description:
      'SLU‑PP‑332 is a synthetic research peptide employed as a probe in metabolic studies, specifically acting as an "exercise mimetic" by activating ERR pathways.\n\nKEY RESEARCH BENEFITS:\n• Advanced Exercise Mimetic Signaling\n• Boosts Mitochondrial Biogenesis\n• Enhances Aerobic Endurance\n• Improves Nutrient Partitioning\n• Supports Whole-Body Energy Homeostasis\n\nFor research purposes only. Not for human consumption.',
  },
];

export const findPeptideBySlug = (slug: string): Product | undefined =>
  peptides.find((p) => p.slug === slug);

export const findPeptideByName = (name: string): Product | undefined =>
  peptides.find((p) => p.name === name);

