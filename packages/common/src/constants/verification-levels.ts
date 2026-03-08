import { VerificationLevel } from '../types/trust.js';

export const VERIFICATION_LEVEL_DESCRIPTIONS: Record<VerificationLevel, string> = {
  [VerificationLevel.Unverified]: 'Unverified — No creator verification performed',
  [VerificationLevel.Domain]: 'Domain Verified — Creator verified via DNS/did:web',
  [VerificationLevel.Business]: 'Business Verified — Creator verified as registered business',
  [VerificationLevel.KYC]: 'KYC Verified — Creator verified via Know Your Customer process',
};

export const VERIFICATION_LEVEL_LABELS: Record<VerificationLevel, string> = {
  [VerificationLevel.Unverified]: 'Unverified',
  [VerificationLevel.Domain]: 'Domain',
  [VerificationLevel.Business]: 'Business',
  [VerificationLevel.KYC]: 'KYC',
};

export const VERIFICATION_LEVEL_COLORS: Record<VerificationLevel, string> = {
  [VerificationLevel.Unverified]: 'gray',
  [VerificationLevel.Domain]: 'blue',
  [VerificationLevel.Business]: 'green',
  [VerificationLevel.KYC]: 'gold',
};
