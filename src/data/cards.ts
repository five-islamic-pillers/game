import { RAW_BRAINTEASERS } from './raw_brainteasers';
import { RAW_GUESS_CARDS } from './raw_guess';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type CardTypes = 'both' | 'brainteaser' | 'guess';

export interface Brainteaser {
  id: number;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface GuessCard {
  id: number;
  difficulty: Difficulty;
  clues: string[];
  answer: string;
}

export const BRAINTEASERS: Brainteaser[] = RAW_BRAINTEASERS;
export const GUESS_CARDS: GuessCard[] = RAW_GUESS_CARDS;
