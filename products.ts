export interface Product {
  slug: string;
  name: string;
  series: string;
  price: string;
  image: string;
  shortDescription: string;
  description: string;
  size: string;
}

export const peptides: Product[] = [
  {
    slug: 'cjc-ipamorelin',
    name: 'CJC-IPAMORELIN',
    series: 'GROWTH',
    price: '$78.00',
    image: '/CJC-IPAMORELIN-removebg-preview.png',
    size: '5 mg / vial',
    shortDescription:
      'CJC-IPAMORELIN is a dual-peptide research blend combining a GHRH analog with a selective ghrelin receptor agonist to study coordinated growth hormone release.',
    description:
      'CJC-IPAMORELIN is a combination of a growth hormone–releasing hormone (GHRH) analog with a selective ghrelin receptor agonist. In experimental models, this dual-peptide system is used to explore coordinated stimulation of pituitary somatotroph cells, GH pulse amplitude and frequency, and downstream IGF-1 dynamics under controlled conditions. The CJC backbone is engineered for extended persistence in circulation, while the ipamorelin component is studied for its relatively targeted engagement of GH release pathways with minimal reported activity on appetite, aldosterone, or cortisol. Together, the blend is frequently employed in research protocols investigating body-composition signaling, metabolic rate, and long-horizon modulation of the somatotropic axis.',
  },
  {
    slug: 'mots-c',
    name: 'MOTS-C',
    series: 'METABOLIC',
    price: '$85.00',
    image: '/MOTS-C-removebg-preview.png',
    size: '10 mg / vial',
    shortDescription:
      'MOTS-C is a 16–amino acid mitochondrial-derived peptide used to probe metabolic stress adaptation, AMPK signaling, and cellular energy handling.',
    description:
      'MOTS-C is a 16–amino acid mitochondrial-derived peptide encoded within the 12S rRNA region of mitochondrial DNA and is frequently used to interrogate metabolic stress-adaptation pathways. In preclinical systems, MOTS-C is investigated for its apparent ability to influence AMPK-related signaling, substrate utilization, and glucose and lipid handling during energetic stress, exercise-mimetic conditions, or nutrient excess. Researchers employ this peptide in models of age-related metabolic decline, mitochondrial communication with the nucleus, and the cross-talk between skeletal muscle, adipose tissue, and hepatic tissue in the context of cellular resilience and energy homeostasis.',
  },
  {
    slug: 'retatrutide',
    name: 'RETATRUTIDE',
    series: 'METABOLIC',
    price: '$89.00',
    image: '/RETATRUTIDE-removebg-preview.png',
    size: '10 mg / vial',
    shortDescription:
      'RETATRUTIDE is a long-acting tri-agonist at GLP-1, GIP, and glucagon receptors, applied in models of appetite control, energy expenditure, and glucose regulation.',
    description:
      'RETATRUTIDE is a long-acting synthetic peptide studied as a tri-agonist at GLP-1, GIP, and glucagon receptors. This receptor profile makes it a useful tool compound in metabolic research, where it is applied to examine nutrient-induced incretin signaling, hepatic glucose output, and brown adipose thermogenesis under tightly controlled conditions. By engaging both insulinotropic and glucagonergic pathways, RETATRUTIDE is used to map complex feedback loops controlling appetite cues, body-weight regulation, and whole-body energy expenditure in advanced in vivo and ex vivo models.',
  },
  {
    slug: 'aod-9604',
    name: 'AOD-9604',
    series: 'METABOLIC',
    price: '$82.00',
    image: '/AOD-9604-removebg-preview.png',
    size: '5 mg / vial',
    shortDescription:
      'AOD-9604 is a C-terminal fragment of human growth hormone used to isolate and investigate lipolytic signaling in adipocyte and metabolism research.',
    description:
      'AOD-9604 is a synthetic peptide corresponding to the 177–191 C-terminal fragment of human growth hormone, designed to isolate specific lipolytic signaling domains. In research environments, AOD-9604 is utilized to study adipocyte metabolism, with particular emphasis on triglyceride mobilization, fatty acid oxidation, and adipocyte receptor signaling without engaging the full spectrum of canonical GH receptor effects. Investigators often incorporate this fragment into models assessing body-fat turnover, nutrient partitioning, and the potential separation of metabolic actions from mitogenic or growth-related pathways traditionally associated with intact growth hormone.',
  },
  {
    slug: 'bpc157-tb500',
    name: 'BPC157_TB500',
    series: 'REPAIR',
    price: '$95.00',
    image: '/BPC157_TB500-removebg-preview.png',
    size: '10 mg / vial',
    shortDescription:
      'BPC157_TB500 is a combination of gastric and thymosin-derived peptide fragments used to explore tissue repair, angiogenesis, and microvascular support.',
    description:
      'BPC157_TB500 combines a synthetic fragment of the gastric peptide known as Body Protection Compound with a key motif derived from thymosin beta‑4, yielding a blend frequently used in tissue-repair and regeneration research. In preclinical models, this pairing is investigated for its potential to influence angiogenic signaling, fibroblast and endothelial cell migration, and extracellular matrix remodeling in tendon, ligament, muscular, and vascular tissues. Researchers commonly deploy this combination in in vitro scratch, explant, and in vivo injury paradigms to explore mechanisms of microvascular support, collagen organization, and recovery dynamics following mechanical or chemical challenge.',
  },
  {
    slug: 'ghk-cu',
    name: 'GHK-CU',
    series: 'REPAIR',
    price: '$88.00',
    image: '/GHK-CU-removebg-preview.png',
    size: '5 mg / vial',
    shortDescription:
      'GHK‑CU is a copper-complexed tripeptide widely used in skin biology and regenerative research to study collagen remodeling and antioxidant responses.',
    description:
      'GHK‑CU is a naturally occurring tripeptide (glycyl‑L‑histidyl‑L‑lysine) complexed with copper(II), widely utilized as a research tool in skin biology and regenerative science. Experimental data suggest that GHK‑CU can modulate the expression of genes involved in collagen and glycosaminoglycan synthesis, antioxidant defense, and matrix metalloproteinase activity, making it relevant to studies of dermal remodeling and wound closure. The complex is frequently incorporated into models of photoaging, hair-follicle cycling, and soft-tissue repair to probe how localized copper delivery via a small peptide carrier may influence cellular signaling, redox balance, and structural protein turnover.',
  },
  {
    slug: 'slu-pp-332',
    name: 'SLU-PP-332',
    series: 'RESEARCH',
    price: '$92.00',
    image: '/SLU-PP-332-removebg-preview.png',
    size: '5 mg / vial',
    shortDescription:
      'SLU‑PP‑332 is an emerging research peptide used to probe mitochondrial efficiency, energy-sensing pathways, and metabolic stress signaling.',
    description:
      'SLU‑PP‑332 is a synthetic research peptide employed as a probe in advanced metabolic and cell-signaling studies. Although still considered an emerging compound, it is often used to interrogate pathways linked to mitochondrial efficiency, cellular energy sensing, and stress-response signaling in both in vitro and in vivo platforms. Investigators leverage SLU‑PP‑332 in hypothesis-generating work aimed at mapping novel regulatory nodes in lipid and carbohydrate metabolism, as well as in circuit-level analyses of how peripheral metabolic cues may be integrated with central nervous system control of energy balance.',
  },
];

export const findPeptideBySlug = (slug: string): Product | undefined =>
  peptides.find((p) => p.slug === slug);

export const findPeptideByName = (name: string): Product | undefined =>
  peptides.find((p) => p.name === name);

