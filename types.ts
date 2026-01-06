export type TabType = 'handicap' | 'goals' | 'ev' | 'kelly' | 'surebet' | 'average';

export interface HandicapResult {
  finalOdd: number;
  stakeDraw: number;
  stakeWin: number;
}

export interface GoalsResult {
  finalOdd: number;
  stakeExactly: number;
  stakeOU: number;
}

export interface EvOddInput {
  id: number;
  odd: string;
  betOdd: string; // The odd the user plans to bet on
}