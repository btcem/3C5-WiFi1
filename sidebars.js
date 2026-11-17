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
  ],
};
export default sidebars;
