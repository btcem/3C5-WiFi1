---
id: m2-chap-7-observer
title: "Chapitre 7 – Observer et vérifier"
sidebar_label: "7. Observer et vérifier"
---

# Chapitre 7 – Observer et vérifier

**Objectif :** vérifier la configuration d'un LAP et d'un client dans l'interface web du WLC et sur les commutateurs, et reconnaître chaque mode sur une capture réseau.

## 7.1 Vérifier le modèle de configuration

Dans l'interface web du WLC, ces écrans confirment **ce que le LAP porte** et **ce que contiennent** les profils.

| Où | Ce qu'on y voit |
|---|---|
| *Configuration > Tags & Profiles > WLANs* | Les profils WLAN (SSID, état) |
| *Configuration > Tags & Profiles > Policy* | Les profils Policy |
| *Configuration > Tags & Profiles > Flex* | Les profils Flex |
| *Configuration > Tags & Profiles > Tags* | Les Policy tags, Site tags et RF tags |
| *Configuration > Wireless > Access Points*, colonnes ou onglet Tags du LAP | **Les tags portés par chaque LAP** |
| Détail du LAP (onglet General) | Le **mode** du LAP, son adresse IP, son temps de fonctionnement |

:::tip[Commencez toujours par les tags du LAP]
Quand un SSID n'apparaît pas ou ne se comporte pas comme prévu, la première question est : *« Quels tags ce LAP porte-t-il ? »* La liste des LAP y répond en une ligne par LAP.
:::

## 7.2 Vérifier le mode du LAP

Le **mode** du LAP (local ou FlexConnect) se lit dans le détail du LAP (onglet General) et dans le **Site tag** qu'il porte (le **site local** est-il activé ?).

Rappelez-vous : un LAP en mode local ignore la commutation locale d'un profil Policy (chapitre 4).

## 7.3 Vérifier un client

Une fois un client associé, ouvrez *Monitoring > Wireless > Clients* et cliquez sur le client. Le détail indique notamment :

- le **SSID** et le **profil Policy** appliqué ;
- le **VLAN** dans lequel le client a été placé ;
- le **mode de commutation** (central ou local) ;
- l'**adresse IP** obtenue.

:::note[À propos des libellés]
Le nom exact des champs varie selon la version. Cherchez la ligne qui indique le VLAN et celle qui indique si la commutation est centrale ou locale.
:::

## 7.4 Vérifier du côté commutateur

Les commandes de commutation que vous connaissez déjà confirment la chaîne de VLAN :

| Commande | Où | Ce qu'elle vérifie |
|---|---|---|
| `show interfaces trunk` | AS1, DS1 | VLAN **autorisés** et VLAN natif sur chaque trunk |
| `show vlan brief` | AS1, DS1 | Le VLAN **existe** |
| `show spanning-tree vlan 110` | AS1, DS1 | Le VLAN est bien **transmis** (pas bloqué par STP) |
| `show ip dhcp binding` | DS1 | Le client a obtenu un bail |
| `show standby brief` | DS1, DS2 | État HSRP du VLAN |

## 7.5 Observer la différence avec une capture

La capture montre la différence entre les deux modes de façon **visible**. On capture avec **Wireshark** sur le **port du LAP**, par exemple avec un **miroir de port** (SPAN) sur le commutateur d'accès.

### Commutation centrale

Sur le port du LAP, on voit des **paquets IP vers le WLC**, en **UDP 5247** (CAPWAP données). Les trames des clients sont **à l'intérieur** de ces paquets. On ne voit pas directement le VLAN 110 : le port est un port d'accès dans le VLAN 50.

### Commutation locale

Sur le port du LAP (trunk), on voit les **trames Ethernet du client** avec leur **étiquette 802.1Q** (VLAN 110). Les requêtes DHCP, ARP et le trafic du client sont **lisibles directement**.

| Mode | Ce qu'on voit sur le port du LAP |
|---|---|
| **Central** | Paquets **UDP 5247** LAP → WLC ; trafic du client **encapsulé** |
| **Local** | Trames **802.1Q** avec le VLAN du client ; trafic **direct** |

:::info[À retenir]
Une capture au port du LAP **permet de reconnaître le mode** : **UDP 5247** = central ; **étiquette 802.1Q du client** = local.
:::

:::warning[Le chiffrement du canal de données]
Si le chiffrement DTLS du canal de **données** est activé (il est optionnel, voir le module 1), le contenu du tunnel n'est plus lisible, même en commutation centrale. On voit alors des paquets UDP 5247 « chiffrés ». La différence **central/local** reste visible : le trafic local n'est jamais tunnelisé.
:::

## 7.6 Méthode : de quel côté est la panne ?

Une capture au **port du LAP** et une capture au **lien montant** répondent souvent à la question « où la trame disparaît-elle ? » :

1. La trame du client **sort-elle** du LAP ? (capture au port du LAP)
2. **Arrive-t-elle** à la distribution ? (capture ou `show` côté DS1)
3. La réponse **revient-elle** ?

La première trame **manquante** désigne le maillon défaillant.

## À retenir

- Les **tags du LAP** : première chose à regarder quand un SSID ne se comporte pas comme prévu.
- Le détail d'un client donne son **VLAN**, son **profil Policy** et son **mode de commutation**.
- `show interfaces trunk` et `show vlan brief` confirment la **chaîne de VLAN** côté commutateurs.
- Sur une capture au port du LAP : **UDP 5247** = commutation centrale ; **802.1Q du client** = commutation locale.

## Vérifiez votre compréhension

**Question 1.** Où voit-on les tags portés par chaque LAP dans l'interface web ?

<details>
<summary>Voir le corrigé</summary>

Dans *Configuration > Wireless > Access Points* (tags du LAP).

</details>

**Question 2.** Sur le port d'un LAP, vous voyez des paquets IP en UDP 5247 vers le WLC et aucune trame étiquetée du client. Quel mode de commutation est utilisé pour ce SSID ?

<details>
<summary>Voir le corrigé</summary>

La commutation **centrale** : le trafic du client est encapsulé dans CAPWAP données (UDP 5247) vers le WLC.

</details>

**Question 3.** Quelle commande côté commutateur confirme qu'un VLAN est autorisé sur un trunk ?

<details>
<summary>Voir le corrigé</summary>

`show interfaces trunk`, qui liste les VLAN autorisés et le VLAN natif de chaque trunk.

</details>

**Question 4.** Pourquoi une capture au port du LAP ne permet-elle plus toujours de lire le trafic du client en commutation centrale ?

<details>
<summary>Voir le corrigé</summary>

Parce que le trafic est **encapsulé** dans CAPWAP, et que le canal de **données** peut être chiffré par DTLS (optionnel). Le contenu devient alors illisible, mais on reconnaît quand même l'UDP 5247.

</details>
