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
      label: 'Module 2 – Profils, tags et commutation centrale ou locale',
      collapsed: true,
      items: [
        'm2-index',
        'm2-chap-1-modele',
        'm2-chap-2-policy',
        'm2-chap-3-central',
        'm2-chap-4-local',
        'm2-chap-5-choisir',
        'm2-chap-6-vlan',
        'm2-chap-7-observer',
        'm2-chap-8-depannage',
        'm2-chap-9-synthese',
        'm2-glossaire',
      ],
    },
  ],
};
export default sidebars;
