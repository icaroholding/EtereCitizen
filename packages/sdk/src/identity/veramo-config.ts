import { createAgent, type IResolver, type IDIDManager, type IKeyManager, type ICredentialPlugin, type TAgent } from '@veramo/core';
import { DIDManager } from '@veramo/did-manager';
import { EthrDIDProvider } from '@veramo/did-provider-ethr';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManager } from '@veramo/key-manager';
import { KeyManagementSystem, SecretBox } from '@veramo/kms-local';
import { CredentialPlugin } from '@veramo/credential-w3c';
import { CredentialProviderJWT } from '@veramo/credential-jwt';
import { KeyStore, DIDStore, PrivateKeyStore } from '@veramo/data-store';
import { Resolver } from 'did-resolver';
import { getResolver as getEthrResolver } from 'ethr-did-resolver';
import { NETWORKS, type NetworkName } from '@eterecitizen/common';

export type VeramoAgent = TAgent<IResolver & IDIDManager & IKeyManager & ICredentialPlugin>;

export interface VeramoConfigOptions {
  network?: NetworkName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dbConnection: any;
  secretKey: string;
}

export function createVeramoAgent(options: VeramoConfigOptions) {
  const network = options.network || 'base-sepolia';
  const networkConfig = NETWORKS[network];

  const ethrDidResolver = getEthrResolver({
    networks: [
      {
        name: `0x${networkConfig.chainId.toString(16)}`,
        rpcUrl: networkConfig.rpcUrl,
        registry: networkConfig.erc1056Address,
      },
    ],
  });

  const resolver = new Resolver({ ...ethrDidResolver });

  return createAgent<IResolver & IDIDManager & IKeyManager & ICredentialPlugin>({
    plugins: [
      new KeyManager({
        store: new KeyStore(options.dbConnection),
        kms: {
          local: new KeyManagementSystem(
            new PrivateKeyStore(options.dbConnection, new SecretBox(options.secretKey)),
          ),
        },
      }),
      new DIDManager({
        store: new DIDStore(options.dbConnection),
        defaultProvider: `did:ethr:0x${networkConfig.chainId.toString(16)}`,
        providers: {
          [`did:ethr:0x${networkConfig.chainId.toString(16)}`]: new EthrDIDProvider({
            defaultKms: 'local',
            networks: [
              {
                name: `0x${networkConfig.chainId.toString(16)}`,
                rpcUrl: networkConfig.rpcUrl,
                registry: networkConfig.erc1056Address,
              },
            ],
          }),
        },
      }),
      new DIDResolverPlugin({ resolver }),
      new CredentialPlugin([new CredentialProviderJWT()]),
    ],
  });
}
