export type QuizMode = 'flags' | 'capitals';

export type RegionOption = 'world' | 'americas' | 'europe' | 'africa' | 'asia' | 'oceania';

export type TimeOption = {
  label: string;
  minutes: number | null;
};

export type Country = {
  country: string;
  capital: string;
  flag: string;
  code: string;
  region: string;
  aliases?: string[];
};

export type BestScores = {
  flags: number;
  capitals: number;
};