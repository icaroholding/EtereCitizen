import { DEFAULT_TEMPORAL_DECAY, type TemporalDecayConfig } from '@eterecitizen/common';

export function calculateDecayWeight(
  reviewTimestamp: Date,
  config: TemporalDecayConfig = DEFAULT_TEMPORAL_DECAY,
): number {
  const now = Date.now();
  const reviewTime = reviewTimestamp.getTime();
  const ageMs = now - reviewTime;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);

  // Exponential decay: weight = 2^(-age/halfLife)
  const weight = Math.pow(2, -ageDays / config.halfLifeDays);

  return Math.max(weight, config.minWeight);
}

export function calculateDecayedScore(
  reviews: Array<{ rating: number; timestamp: Date }>,
  config: TemporalDecayConfig = DEFAULT_TEMPORAL_DECAY,
): number {
  if (reviews.length === 0) return 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const review of reviews) {
    const weight = calculateDecayWeight(review.timestamp, config);
    weightedSum += review.rating * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
