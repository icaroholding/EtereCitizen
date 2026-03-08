import type { Review, AntifraudFlags } from '@eterecitizen/common';

const BURST_THRESHOLD = 5; // Max reviews from same reviewer in 24h
const BURST_WINDOW_MS = 24 * 60 * 60 * 1000;
const CLUSTER_TIME_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const CLUSTER_MIN_REVIEWS = 3;

export function detectAntifraudFlags(reviews: Review[]): AntifraudFlags {
  const flags: AntifraudFlags = {
    isCluster: false,
    isReciprocal: false,
    isBurst: false,
    suspicionScore: 0,
    details: [],
  };

  if (reviews.length === 0) return flags;

  // Burst detection: too many reviews from same reviewer in short time
  const reviewerTimestamps = new Map<string, Date[]>();
  for (const review of reviews) {
    const timestamps = reviewerTimestamps.get(review.reviewerDID) || [];
    timestamps.push(new Date(review.timestamp));
    reviewerTimestamps.set(review.reviewerDID, timestamps);
  }

  for (const [reviewerDID, timestamps] of reviewerTimestamps) {
    timestamps.sort((a, b) => a.getTime() - b.getTime());
    let windowStart = 0;
    for (let i = 0; i < timestamps.length; i++) {
      while (
        timestamps[i].getTime() - timestamps[windowStart].getTime() > BURST_WINDOW_MS
      ) {
        windowStart++;
      }
      if (i - windowStart + 1 >= BURST_THRESHOLD) {
        flags.isBurst = true;
        flags.suspicionScore += 0.3;
        flags.details!.push(
          `Burst: ${i - windowStart + 1} reviews from ${reviewerDID} within 24h`,
        );
        break;
      }
    }
  }

  // Cluster detection: many reviews arriving in a short time window
  const allTimestamps = reviews
    .map((r) => new Date(r.timestamp).getTime())
    .sort((a, b) => a - b);

  for (let i = 0; i <= allTimestamps.length - CLUSTER_MIN_REVIEWS; i++) {
    const windowEnd = allTimestamps[i] + CLUSTER_TIME_WINDOW_MS;
    let count = 0;
    for (let j = i; j < allTimestamps.length && allTimestamps[j] <= windowEnd; j++) {
      count++;
    }
    if (count >= CLUSTER_MIN_REVIEWS) {
      flags.isCluster = true;
      flags.suspicionScore += 0.2;
      flags.details!.push(`Cluster: ${count} reviews within 1 hour`);
      break;
    }
  }

  // Reciprocal detection: A reviewed B and B reviewed A
  const reviewPairs = new Set<string>();
  for (const review of reviews) {
    const pair = `${review.reviewerDID}->${review.reviewedDID}`;
    const reverse = `${review.reviewedDID}->${review.reviewerDID}`;
    if (reviewPairs.has(reverse)) {
      flags.isReciprocal = true;
      flags.suspicionScore += 0.4;
      flags.details!.push(
        `Reciprocal: ${review.reviewerDID} and ${review.reviewedDID} reviewed each other`,
      );
    }
    reviewPairs.add(pair);
  }

  // Cap suspicion score at 1.0
  flags.suspicionScore = Math.min(flags.suspicionScore, 1.0);

  return flags;
}
