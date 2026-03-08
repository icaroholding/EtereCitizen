export const WALLET_OWNERSHIP_CONTEXT = 'https://eterecitizen.ai/ns/vc/wallet-ownership/v1';

export const WALLET_OWNERSHIP_TYPE = 'EtereCitizenWalletOwnership';

export function createWalletOwnershipTemplate(params: {
  id: string;
  issuerDID: string;
  subjectDID: string;
  walletProvider: string;
  challengeHash: string;
}) {
  return {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      WALLET_OWNERSHIP_CONTEXT,
    ],
    id: params.id,
    type: ['VerifiableCredential', WALLET_OWNERSHIP_TYPE] as const,
    issuer: params.issuerDID,
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      id: params.subjectDID,
      walletProvider: params.walletProvider,
      connectedAt: new Date().toISOString(),
      challengeHash: params.challengeHash,
    },
  };
}
