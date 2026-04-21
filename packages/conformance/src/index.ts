export type {
  DidParsingAdapter,
  TrustScoreAdapter,
  TemporalDecayAdapter,
  AntifraudAdapter,
  ChallengeSerializationAdapter,
  ConformanceAdapter,
  ConformanceReport,
  VectorResult,
  TrustInput,
  TemporalDecayReview,
  AntifraudReview,
  AntifraudFlags,
  ChallengeMessage,
} from './types.js';

export { loadVectors } from './vectors.js';
export type { VectorCategory, LoadedVector } from './vectors.js';

export { runConformance } from './runner.js';
