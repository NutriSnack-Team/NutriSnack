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
}

export interface AppState {
  isScanning: boolean;
  scanResultId: number | null;
  setIsScanning: (status: boolean) => void;
  setScanResultId: (id: number | null) => void;
}
