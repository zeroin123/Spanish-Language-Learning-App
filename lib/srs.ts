export type CardState = {
  interval: number;
  easeFactor: number;
  reps: number;
};

export type GradedCard = CardState & {
  nextReview: string;
  lastReviewed: string;
  mastered: boolean;
};

// Simplified SM-2 algorithm per PRD §5 F3
export function applyGrade(card: CardState, grade: 0 | 1 | 2 | 3): GradedCard {
  let { interval, easeFactor, reps } = card;

  if (grade === 0) {
    interval = 1;
    reps = 0;
  } else if (grade === 1) {
    interval = Math.max(1, Math.round(interval * 1.2));
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);
    reps += 1;
    if (grade === 3) {
      interval = Math.round(interval * 1.3);
      easeFactor = Math.min(3.0, easeFactor + 0.15);
    } else {
      easeFactor = Math.max(1.3, easeFactor + 0.05);
    }
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  const now = new Date().toISOString();

  return {
    interval,
    easeFactor,
    reps,
    nextReview: nextReview.toISOString(),
    lastReviewed: now,
    mastered: interval > 21,
  };
}
