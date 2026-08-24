const fs = require('fs');

const difficulties = ['easy', 'medium', 'hard'];
let brainteasers = [];
let guessCards = [];
let globalId = 1;

const realBrainteasers = {
  easy: [
    { q: "یەکەم پێغەمبەر کێ بوو؟", opts: ["ئادەم", "نوح", "محمد", "موسا"], ans: 0 },
    { q: "قورئان چەند سورەتە؟", opts: ["١١٤", "١١٠", "١٢٠", "١٠٠"], ans: 0 },
    { q: "نوێژی بەیانی چەند ڕکاعەتە؟", opts: ["٢", "٣", "٤", "١"], ans: 0 },
    { q: "مانگی ڕۆژووگرتن کامەیە؟", opts: ["ڕەمەزان", "شەوال", "شەعبان", "ڕەجەب"], ans: 0 },
    { q: "دوایین پێغەمبەر کێیە؟", opts: ["محمد (د.خ)", "عیسا", "موسا", "ئیبراهیم"], ans: 0 }
  ],
  medium: [
    { q: "کام جەنگە مسوڵمانان شکستیان هێنا؟", opts: ["بەدر", "ئوحود", "خەندەق", "تەبوک"], ans: 1 },
    { q: "ماوەی دابەزینی قورئان چەند بوو؟", opts: ["٢٣ ساڵ", "٢٠ ساڵ", "١٠ ساڵ", "٣٠ ساڵ"], ans: 0 },
    { q: "کێ خەلیفەی یەکەم بوو؟", opts: ["ئەبوبەکر", "عومەر", "عوسمان", "عەلی"], ans: 0 },
    { q: "زەکات لە چەند ئاژەڵ واجبە؟", opts: ["وشتر، مانگا، مەڕ", "ئەسپس، کەر", "سەگ، پشیلە", "هەموو ئاژەڵێک"], ans: 0 }
  ],
  hard: [
    { q: "کام سورەتە بە 'دڵی قورئان' ناسراوە؟", opts: ["یاسین", "ڕەحمان", "بەقەرە", "کەهف"], ans: 0 },
    { q: "کێ یەکەم کەس بوو بڕوای بە پێغەمبەر هێنا لە پیاوان؟", opts: ["ئەبوبەکر", "عەلی", "زەید", "عوسمان"], ans: 0 },
    { q: "لە چ ساڵێکی کۆچیدا مەکە فەتح کرا؟", opts: ["٨ ی کۆچی", "٩ ی کۆچی", "١٠ ی کۆچی", "٧ ی کۆچی"], ans: 0 }
  ]
};

const realGuessCards = {
  easy: [
    { clues: ["پەڕتووکی پیرۆزی مسوڵمانانە", "لە مانگی ڕەمەزان دابەزیوە", "بە زمانی عەرەبییە"], ans: "قورئان" },
    { clues: ["ماڵی خوایە", "لە مەککەیە", "ڕووگەی مسوڵمانانە"], ans: "کەعبە" },
    { clues: ["پێنجەم پایەی ئیسلامە", "لە تەمەندا جارێک فەرزە", "لە مەککە دەکرێت"], ans: "حەج" }
  ],
  medium: [
    { clues: ["یەکەم جەنگی مسوڵمانان بوو", "لە مانگی ڕەمەزان ڕوویدا", "مسوڵمانان سەرکەوتن"], ans: "غەزوەی بەدر" },
    { clues: ["هاوەڵی پێغەمبەر بوو", "خەلیفەی دووەم بوو", "بە فاروق ناسراوە"], ans: "عومەری کوڕی خەتاب" }
  ],
  hard: [
    { clues: ["گەورەترین سورەتی قورئانە", "ئایەتی کورسی تێدایە", "بە ناوی ئاژەڵێکەوەیە"], ans: "سورەتی بەقەرە" },
    { clues: ["مامی پێغەمبەر بوو", "لە غەزوەی ئوحود شەهید بوو", "پێی دەوترێت شێری خوا"], ans: "حەمزەی کوڕی عەبدولموتەلیب" }
  ]
};

difficulties.forEach(diff => {
  // Generate 200 brainteasers per difficulty
  let bCount = 0;
  if (realBrainteasers[diff]) {
    realBrainteasers[diff].forEach(rb => {
      brainteasers.push({ id: globalId++, difficulty: diff, question: rb.q, options: rb.opts, correctAnswer: rb.ans });
      bCount++;
    });
  }
  while (bCount < 200) {
    brainteasers.push({ 
      id: globalId++, 
      difficulty: diff, 
      question: `پرسیاری هەڵبژاردنی تاقیکاری ${bCount + 1} (ئاستی ${diff})`, 
      options: ["وەڵامی ڕاست", "وەڵامی هەڵە", "وەڵامی هەڵە ٢", "وەڵامی هەڵە ٣"], 
      correctAnswer: 0 
    });
    bCount++;
  }

  // Generate 200 guess cards per difficulty
  let gCount = 0;
  if (realGuessCards[diff]) {
    realGuessCards[diff].forEach(rg => {
      guessCards.push({ id: globalId++, difficulty: diff, clues: rg.clues, answer: rg.ans });
      gCount++;
    });
  }
  while (gCount < 200) {
    guessCards.push({ 
      id: globalId++, 
      difficulty: diff, 
      clues: [`زانیاری یەکەم بۆ وشەی ${gCount + 1}`, `زانیاری دووەم بۆ وشەی ${gCount + 1}`, `زانیاری سێیەم بۆ وشەی ${gCount + 1}`], 
      answer: `وشەی شاراوە ${gCount + 1} (${diff})` 
    });
    gCount++;
  }
});

const output = `
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

export const BRAINTEASERS: Brainteaser[] = ${JSON.stringify(brainteasers, null, 2)};
export const GUESS_CARDS: GuessCard[] = ${JSON.stringify(guessCards, null, 2)};
`;

fs.writeFileSync('src/data/cards.ts', output);
console.log('Cards generated successfully! Total Brainteasers:', brainteasers.length, 'Total Guess Cards:', guessCards.length);
