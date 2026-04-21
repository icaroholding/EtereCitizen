import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Specification',
      collapsed: false,
      items: [
        'specification/spec',
        'specification/conformance',
        'specification/threat-model',
      ],
    },
    {
      type: 'category',
      label: 'Implementations',
      collapsed: false,
      items: [
        'implementations/typescript',
        'implementations/python',
        'implementations/conformance',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'guides/getting-started',
        'guides/tutorial',
        'guides/api-reference',
        'guides/cli-reference',
        'guides/mcp-tools',
        'guides/smart-contracts',
        'guides/architecture',
        'guides/privacy',
        'guides/nist-submission',
      ],
    },
    {
      type: 'category',
      label: 'Architecture Decisions',
      collapsed: true,
      items: [
        'adr/index',
        'adr/use-did-ethr',
        'adr/jwt-proof-format',
        'adr/hash-commitment',
        'adr/off-chain-decay',
        'adr/single-owner-initial',
        'adr/in-memory-registry',
      ],
    },
    {
      type: 'category',
      label: 'Contributing',
      collapsed: true,
      items: ['contributing/overview'],
    },
  ],
};

export default sidebars;
