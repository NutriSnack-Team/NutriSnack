export interface AgeScore {
  score: number;
  grade: string;
  label: string;
  color: string;
  bg: string;
  components: {
    N: number;
    I: number;
    P: number;
    A: number | null;
  };
  scale: number;
  cliffPenalty: number;
  serving_reality_check?: number;
  dominantNutrient?: {
    key: string;
    dv: number;
    subScore: number;
  };
}

export interface ScoreBreakdown {
  overall: number;
  grade: string;
  components: {
    N: number;
    I: number;
    P: number;
    A: number | null;
  };
  flags?: string[];
  ageWise: {
    child: AgeScore;
    teen: AgeScore;
    adult: AgeScore;
    elderly: AgeScore;
  };
  dominantNutrient?: {
    key: string;
    dv: number;
    subScore: number;
  };
}

export interface AppState {
  isScanning: boolean;
  scanResultId: number | null;
  dynamicProduct: any | null;
  setIsScanning: (status: boolean) => void;
  setScanResultId: (id: number | null) => void;
  setDynamicProduct: (product: any | null) => void;
}
