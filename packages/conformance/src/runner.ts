import { loadVectors } from './vectors.js';
import type {
  ConformanceAdapter,
  ConformanceReport,
  VectorResult,
} from './types.js';

const FLOAT_TOLERANCE = 1e-12;

function approxEqual(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return a === b;
  return Math.abs(a - b) <= FLOAT_TOLERANCE * Math.max(1, Math.abs(a), Math.abs(b));
}

/**
 * Run every test vector against the provided adapter. Skips a category
 * silently when the adapter does not implement the matching methods.
 */
export function runConformance(adapter: ConformanceAdapter): ConformanceReport {
  const results: VectorResult[] = [];
  let skipped = 0;

  // --- DID parsing ---
  if (adapter.isValidDID || adapter.didToAddress || adapter.didToNetwork || adapter.addressToDID) {
    for (const v of loadVectors<any>('did-parsing')) {
      results.push(runDidParsing(adapter, v));
    }
  } else {
    skipped += loadVectors('did-parsing').length;
  }

  // --- Trust score ---
  if (adapter.calculateTrustScore) {
    for (const v of loadVectors<any>('trust-score')) {
      results.push(runTrustScore(adapter, v));
    }
  } else {
    skipped += loadVectors('trust-score').length;
  }

  // --- Temporal decay ---
  if (adapter.calculateDecayWeight || adapter.calculateDecayedScore) {
    for (const v of loadVectors<any>('temporal-decay')) {
      results.push(runTemporalDecay(adapter, v));
    }
  } else {
    skipped += loadVectors('temporal-decay').length;
  }

  // --- Antifraud ---
  if (adapter.detectAntifraudFlags) {
    for (const v of loadVectors<any>('antifraud')) {
      results.push(runAntifraud(adapter, v));
    }
  } else {
    skipped += loadVectors('antifraud').length;
  }

  // --- Challenge serialization ---
  if (adapter.challengeToMessage) {
    for (const v of loadVectors<any>('challenge-serialization')) {
      results.push(runChallenge(adapter, v));
    }
  } else {
    skipped += loadVectors('challenge-serialization').length;
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  return {
    adapter: adapter.name,
    results,
    summary: {
      total: results.length + skipped,
      passed,
      failed,
      skipped,
    },
  };
}

function fail(vectorPath: string, description: string, reason: string): VectorResult {
  return { vectorPath, description, passed: false, error: reason };
}
function pass(vectorPath: string, description: string): VectorResult {
  return { vectorPath, description, passed: true };
}

function runDidParsing(a: ConformanceAdapter, v: any): VectorResult {
  const { input, expected } = v;
  const mismatches: string[] = [];
  if ('did' in input) {
    if (expected.isValidDID !== undefined && a.isValidDID) {
      const got = a.isValidDID(input.did);
      if (got !== expected.isValidDID) mismatches.push(`isValidDID: got ${got}, want ${expected.isValidDID}`);
    }
    if ('didToAddress' in expected && a.didToAddress) {
      const got = a.didToAddress(input.did);
      if (got !== expected.didToAddress) mismatches.push(`didToAddress: got ${got}, want ${expected.didToAddress}`);
    }
    if ('didToNetwork' in expected && a.didToNetwork) {
      const got = a.didToNetwork(input.did);
      if (got !== expected.didToNetwork) mismatches.push(`didToNetwork: got ${got}, want ${expected.didToNetwork}`);
    }
  }
  if ('address' in input && 'network' in input && a.addressToDID) {
    const got = a.addressToDID(input.address, input.network);
    if (got !== expected.addressToDID) mismatches.push(`addressToDID: got ${got}, want ${expected.addressToDID}`);
  }
  return mismatches.length === 0 ? pass(v.path, v.description) : fail(v.path, v.description, mismatches.join('; '));
}

function runTrustScore(a: ConformanceAdapter, v: any): VectorResult {
  if (!a.calculateTrustScore) return fail(v.path, v.description, 'adapter missing calculateTrustScore');
  const got = a.calculateTrustScore(v.input);
  const want = v.expected.trustScore;
  return approxEqual(got, want) ? pass(v.path, v.description) : fail(v.path, v.description, `got ${got}, want ${want}`);
}

function runTemporalDecay(a: ConformanceAdapter, v: any): VectorResult {
  const { input, expected } = v;
  const mismatches: string[] = [];

  if ('ages' in input && a.calculateDecayWeight) {
    for (const age of input.ages) {
      const got = a.calculateDecayWeight(age, input.halfLifeDays, input.minWeight);
      const want = expected.weights[String(age)];
      if (!approxEqual(got, want)) mismatches.push(`weight(age=${age}): got ${got}, want ${want}`);
    }
  }

  if ('reviews' in input && a.calculateDecayedScore) {
    const got = a.calculateDecayedScore(input.reviews, input.halfLifeDays, input.minWeight);
    const want = expected.decayedScore;
    if (!approxEqual(got, want)) mismatches.push(`decayedScore: got ${got}, want ${want}`);
  }

  return mismatches.length === 0 ? pass(v.path, v.description) : fail(v.path, v.description, mismatches.join('; '));
}

function runAntifraud(a: ConformanceAdapter, v: any): VectorResult {
  if (!a.detectAntifraudFlags) return fail(v.path, v.description, 'adapter missing detectAntifraudFlags');
  const got = a.detectAntifraudFlags(v.input.reviews);
  const want = v.expected;
  const mismatches: string[] = [];
  for (const k of ['isBurst', 'isCluster', 'isReciprocal'] as const) {
    if (got[k] !== want[k]) mismatches.push(`${k}: got ${got[k]}, want ${want[k]}`);
  }
  if (!approxEqual(got.suspicionScore, want.suspicionScore)) {
    mismatches.push(`suspicionScore: got ${got.suspicionScore}, want ${want.suspicionScore}`);
  }
  return mismatches.length === 0 ? pass(v.path, v.description) : fail(v.path, v.description, mismatches.join('; '));
}

function runChallenge(a: ConformanceAdapter, v: any): VectorResult {
  if (!a.challengeToMessage) return fail(v.path, v.description, 'adapter missing challengeToMessage');
  const got = a.challengeToMessage(v.input);
  const want = v.expected.serialized;
  return got === want
    ? pass(v.path, v.description)
    : fail(v.path, v.description, `output mismatch. got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
}
