---
id: m2-chap-9-observer
title: "Chapitre 9 – Observer et vérifier"
sidebar_label: "9. Observer et vérifier"
---

# Chapitre 9 – Observer et vérifier

**Objectif :** vérifier la configuration d'un LAP et d'un client dans l'interface web du WLC et sur les commutateurs, et reconnaître la commutation locale sur une capture réseau.

## 9.1 Vérifier le modèle de configuration

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

## 9.2 Vérifier le mode du LAP

Le **mode** du LAP (local ou FlexConnect) se lit dans le détail du LAP (onglet General) et dans le **Site tag** qu'il porte (le **site local** est-il activé ?).

Rappelez-vous : un LAP en mode local ignore la commutation locale d'un profil Policy (chapitre 3).

## 9.3 Vérifier un client

Une fois un client associé, ouvrez *Monitoring > Wireless > Clients* et cliquez sur le client. Le détail indique notamment :

- le **SSID** et le **profil Policy** appliqué ;
- le **VLAN** dans lequel le client a été placé ;
- le **mode de commutation** (local) ;
- l'**adresse IP** obtenue.

:::note[À propos des libellés]
Le nom exact des champs varie selon la version. Cherchez la ligne qui indique le VLAN et celle qui indique le mode de commutation.
:::

## 9.4 Vérifier du côté commutateur

Les commandes de commutation que vous connaissez déjà confirment la chaîne de VLAN :

| Commande | Où | Ce qu'elle vérifie |
|---|---|---|
| `show interfaces trunk` | AS1, DS1 | VLAN **autorisés** et VLAN natif sur chaque trunk |
| `show vlan brief` | AS1, DS1 | Le VLAN **existe** |
| `show spanning-tree vlan 110` | AS1, DS1 | Le VLAN est bien **transmis** (pas bloqué par STP) |
| `show ip dhcp binding` | DS1 | Le client a obtenu un bail |
| `show standby brief` | DS1, DS2 | État HSRP du VLAN |

## 9.5 Observer la commutation locale avec une capture

On capture avec **Wireshark** sur le **port du LAP**, par exemple avec un **miroir de port** (SPAN) sur le commutateur d'accès.

Sur le port du LAP (trunk), on voit les **trames Ethernet du client** avec leur **étiquette 802.1Q** (VLAN du SSID). Les requêtes DHCP, ARP et le trafic du client sont **lisibles directement**, sans tunnel CAPWAP de données.

:::info[À retenir]
En commutation locale, une capture au port du LAP montre le **VLAN du client** (802.1Q). Un simple `show mac address-table interface` sur le port du LAP montre aussi les adresses MAC des clients dans leur VLAN : c'est la preuve la plus simple.
:::

:::note[Vérifier avec le commutateur]
Sur le commutateur d'accès : `show mac address-table interface <port du LAP>` doit lister l'adresse MAC du client dans le VLAN de son SSID. Avec deux SSID, on voit des clients dans **deux VLAN** sur le même port.
:::

:::warning[Étiquettes 802.1Q et Windows]
Selon la carte réseau, Windows peut **retirer** les étiquettes 802.1Q avant que Wireshark ne les voie. Si vous ne voyez pas le VLAN, fiez-vous à la table MAC du commutateur.
:::

## 9.6 Méthode : de quel côté est la panne ?

Une capture au **port du LAP** et une capture au **lien montant** répondent souvent à la question « où la trame disparaît-elle ? » :

1. La trame du client **sort-elle** du LAP ? (capture au port du LAP)
2. **Arrive-t-elle** à la distribution ? (capture ou `show` côté DS1)
3. La réponse **revient-elle** ?

La première trame **manquante** désigne le maillon défaillant.

## À retenir

- Les **tags du LAP** : première chose à regarder quand un SSID ne se comporte pas comme prévu.
- Le détail d'un client donne son **VLAN**, son **profil Policy** et son **mode de commutation**.
- `show interfaces trunk` et `show vlan brief` confirment la **chaîne de VLAN** côté commutateurs.
- Sur le port du LAP : la table MAC du commutateur ou une capture montre les clients dans **leur VLAN** (802.1Q).

## Vérifiez votre compréhension

**Question 1.** Où voit-on les tags portés par chaque LAP dans l'interface web ?

<details>
<summary>Voir le corrigé</summary>

Dans *Configuration > Wireless > Access Points* (tags du LAP).

</details>

**Question 2.** Un client est associé au SSID « Invites » (VLAN 120). Comment confirmer, sur le commutateur d'accès, que sa trame sort bien du LAP dans ce VLAN ?

<details>
<summary>Voir le corrigé</summary>

`show mac address-table interface <port du LAP>` : l'adresse MAC du client apparaît dans le **VLAN 120**.

</details>

**Question 3.** Quelle commande côté commutateur confirme qu'un VLAN est autorisé sur un trunk ?

<details>
<summary>Voir le corrigé</summary>

`show interfaces trunk`, qui liste les VLAN autorisés et le VLAN natif de chaque trunk.

</details>

**Question 4.** Sur la capture, vous ne voyez aucune étiquette 802.1Q, mais la table MAC montre le client dans le bon VLAN. Que concluez-vous ?

<details>
<summary>Voir le corrigé</summary>

Que la configuration est correcte et que la **carte réseau** du poste de capture a retiré les étiquettes. La table MAC du commutateur fait foi.

</details>
