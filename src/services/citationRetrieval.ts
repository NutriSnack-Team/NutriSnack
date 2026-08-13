import citationsData from '@/data/citations.json';
import type { NutrientKey } from '@/utils/normalizeNutrient';

export interface Citation {
  id: string;
  source: string;
  title: string;
  year: number;
  section: string;
  nutrients: string[];
  ageGroups: string[];
  passage: string;
  url: string | null;
}

const citations: Citation[] = citationsData as Citation[];

export function retrieveCitations(nutrientKey: NutrientKey, ageGroup: string, maxResults = 2): Citation[] {
  const matches = citations.filter(c => c.nutrients.includes(nutrientKey));

  const specific = matches.filter(c => c.ageGroups.includes(ageGroup));
  const general = matches.filter(c => c.ageGroups.includes('all'));

  const combined = [...specific, ...general.filter(g => !specific.some(s => s.id === g.id))];

  return combined.slice(0, maxResults);
}
