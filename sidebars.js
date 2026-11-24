/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  modules: [
    'index',
    {
      type: 'category',
      label: 'Module 1 – Architecture WLC/LAP et jonction CAPWAP',
      collapsed: false,
      items: [
        'chap-1-pourquoi-un-wlc',
        'chap-2-composants',
        'chap-3-placement',
        'chap-4-capwap',
        'chap-5-decouverte',
        'chap-6-jonction',
        'chap-7-fonctionnement',
        'chap-8-depannage',
        'chap-9-synthese',
        'glossaire',
      ],
    },
    {
      type: 'category',
      label: 'Module 2 – Profils, tags et commutation locale',
      collapsed: true,
      items: [
        'm2-index',
        'm2-chap-1-modele',
        'm2-chap-2-policy',
        'm2-chap-3-local',
        'm2-chap-4-dhcp',
        'm2-chap-5-association',
        'm2-chap-6-authentification',
        'm2-chap-7-situations',
        'm2-chap-8-vlan',
        'm2-chap-9-observer',
        'm2-chap-10-depannage',
        'm2-chap-11-pas-a-pas',
        'm2-chap-12-synthese',
        'm2-glossaire',
      ],
    },
  ],
};
export default sidebars;
