// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

// ===== À MODIFIER : votre nom d'utilisateur GitHub et le nom du dépôt =====
const GITHUB_USER = 'btcem';
const GITHUB_REPO = '3C5-WiFi1';
// =========================================================================

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Réseau 2 – Réseaux sans fil avec WLC',
  tagline: 'Notes de cours – réseaux sans fil centralisés',
  favicon: 'img/favicon.ico',
  future: {v4: true},

  url: `https://${GITHUB_USER}.github.io`,
  baseUrl: `/${GITHUB_REPO}/`,
  organizationName: GITHUB_USER,
  projectName: GITHUB_REPO,
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {onBrokenMarkdownLinks: 'warn'},
  },
  themes: ['@docusaurus/theme-mermaid'],
  clientModules: ['./src/clientModules/d3-transition.js'],

  i18n: {defaultLocale: 'fr', locales: ['fr']},

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.js',
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {respectPrefersColorScheme: true},
      navbar: {
        title: 'Réseau 2 – Sans fil et WLC',
        items: [
          {type: 'doc', docId: 'index', position: 'left', label: 'Module 1'},
          {type: 'doc', docId: 'm2-index', position: 'left', label: 'Module 2'},
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Cégep Édouard-Montpetit – Cours 420-3R5 Réseau 2`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash'],
      },
      mermaid: {theme: {light: 'neutral', dark: 'dark'}},
    }),
};

export default config;
