import {
  type AgentDIDDocument,
  type ServiceEndpoint,
  DID_DOCUMENT_CONTEXT,
  ETERECITIZEN_SERVICE_TYPE,
  ETERECITIZEN_METADATA_SERVICE_TYPE,
} from '@eterecitizen/common';

export function buildAgentDIDDocument(
  did: string,
  name: string,
  additionalServices?: ServiceEndpoint[],
): AgentDIDDocument {
  const verificationMethodId = `${did}#controller`;

  const document: AgentDIDDocument = {
    '@context': DID_DOCUMENT_CONTEXT,
    id: did,
    verificationMethod: [
      {
        id: verificationMethodId,
        type: 'EcdsaSecp256k1RecoveryMethod2020',
        controller: did,
        blockchainAccountId: `eip155:${extractChainId(did)}:${extractAddress(did)}`,
      },
    ],
    authentication: [verificationMethodId],
    assertionMethod: [verificationMethodId],
    service: [
      {
        id: `${did}#agent`,
        type: ETERECITIZEN_SERVICE_TYPE,
        serviceEndpoint: `https://eterecitizen.ai/api/card/${encodeURIComponent(did)}`,
      },
      {
        id: `${did}#metadata`,
        type: ETERECITIZEN_METADATA_SERVICE_TYPE,
        serviceEndpoint: JSON.stringify({
          name,
          protocolVersion: '0.3',
          createdAt: new Date().toISOString(),
        }),
      },
    ],
    created: new Date().toISOString(),
  };

  if (additionalServices) {
    document.service.push(...additionalServices);
  }

  return document;
}

function extractChainId(did: string): string {
  const parts = did.split(':');
  if (parts.length >= 3) {
    return String(parseInt(parts[2], 16));
  }
  return '84532'; // Default to Base Sepolia
}

function extractAddress(did: string): string {
  const parts = did.split(':');
  return parts[parts.length - 1];
}
