import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'EtereCitizen Protocol',
  tagline: 'An open protocol for AI-agent identity, trust, and commerce.',
  favicon: 'img/favicon.svg',

  url: 'https://docs.eterecitizen.io',
  baseUrl: '/',

  organizationName: 'icaroholding',
  projectName: 'EtereCitizen',

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/icaroholding/EtereCitizen/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    navbar: {
      title: 'EtereCitizen',
      logo: {
        alt: 'EtereCitizen Logo',
        src: 'img/logo.svg',
      },
      items: [
        { to: '/intro', label: 'Intro', position: 'left' },
        { to: '/specification/spec', label: 'Specification', position: 'left' },
        { to: '/guides/getting-started', label: 'Guides', position: 'left' },
        { to: '/adr', label: 'Decisions', position: 'left' },
        {
          href: 'https://github.com/icaroholding/EtereCitizen',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/@eterecitizen/sdk',
          label: 'npm',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Protocol',
          items: [
            { label: 'Specification', to: '/specification/spec' },
            { label: 'Conformance', to: '/specification/conformance' },
            { label: 'Threat Model', to: '/specification/threat-model' },
            { label: 'Architecture Decisions', to: '/adr' },
          ],
        },
        {
          title: 'Implementations',
          items: [
            { label: 'TypeScript SDK', to: '/implementations/typescript' },
            { label: 'Python SDK', to: '/implementations/python' },
            { label: 'Conformance Suite', to: '/implementations/conformance' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/icaroholding/EtereCitizen' },
            { label: 'Issues', href: 'https://github.com/icaroholding/EtereCitizen/issues' },
            { label: 'Discussions', href: 'https://github.com/icaroholding/EtereCitizen/discussions' },
            { label: 'Security', href: 'https://github.com/icaroholding/EtereCitizen/blob/main/SECURITY.md' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Icaro Holding. Apache 2.0 licensed.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['solidity', 'bash', 'python', 'typescript', 'json'],
    },
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
