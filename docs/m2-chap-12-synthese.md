---
id: m2-chap-12-synthese
title: "Chapitre 12 – Synthèse et exercices"
sidebar_label: "12. Synthèse et exercices"
---

# Chapitre 12 – Synthèse et exercices

## 12.1 Ce que nous pratiquons et ce que nous reportons

| Sujet | Théorie | Laboratoire |
|---|---|---|
| Profils et tags | Oui | Oui (labo 3) |
| Commutation locale, un SSID / un VLAN | Oui | Oui (labo 3) |
| Commutation locale, deux SSID / deux VLAN | Oui | Oui (labo 4) |
| Trois configurations de sites Flex | Oui | Non |
| DHCP local | Oui | Oui |
| DHCP central | Oui | Non |
| Association locale et centrale | Oui | Non |
| Authentification : réseau ouvert | Oui | Oui (labo 5) |
| Authentification centrale (utilisateurs locaux du WLC) | Oui | Oui (labo 5) |
| Authentification locale (utilisateurs du profil Flex) | Oui | Oui, avec réserve (labo 5) |
| RADIUS et 802.1X d'entreprise | Module suivant | Module suivant |
| **Commutation centrale** | **Cours ultérieur** | Non |

:::note[Pourquoi pas de commutation centrale ?]
Le WLC de laboratoire est une machine virtuelle sans trunk : il ne peut pas être raccordé à plusieurs VLAN de clients. Le sujet est reporté à un cours ultérieur. Retenez seulement le terme : en commutation **centrale**, les données des clients transitent par le WLC dans le tunnel CAPWAP.
:::

## 12.2 Les idées à retenir

1. Un LAP porte **trois tags** (Policy, Site, RF) qui pointent vers des **profils**.
2. Le **VLAN** et les **fonctions centrales ou locales** d'un SSID sont dans le **profil Policy** ; le **mode du LAP** vient du **Site tag**.
3. En commutation locale, le VLAN du client doit exister sur le **LAP** (profil Flex), le **trunk** d'accès, les **liens montants** et la **passerelle**.
4. Ajouter un SSID : profil WLAN, profil Policy, paire dans le Policy tag, VLAN dans le profil Flex, trunks, passerelle et DHCP.
5. Plus on confie de fonctions au LAP (association, DHCP, authentification), plus il reste utile sans le WLC.
6. Panne : suivre la trame, **diffusé → associé → authentifié → IP → bon VLAN → passerelle**.

## 12.3 Exercices

### Exercice 1 – Compléter une configuration

Un site de succursale diffuse « Employes » (VLAN 110) et « Invites » (VLAN 120) sur un LAP. Listez les profils et tags à créer, avec le contenu de chacun.

<details>
<summary>Voir le corrigé</summary>

- **Profils WLAN** : WLAN-EMP, WLAN-INV. **Profils Policy** : POL-EMP (VLAN 110), POL-INV (VLAN 120), commutation locale.
- **Policy tag** : deux paires (WLAN-EMP → POL-EMP, WLAN-INV → POL-INV).
- **Profil Flex** : natif 50, VLAN 110 et 120. **Profil AP Join** : valeurs de labo.
- **Site tag** : site local décoché, AP Join + Flex. **RF tag** : au besoin, puissance réduite.
- **Commutateur** : trunk du LAP natif 50, VLAN 110 et 120 autorisés ; liens montants idem ; passerelles et pools des deux VLAN.

</details>

### Exercice 2 – Même SSID, deux sites

« Employes » doit être dans le VLAN 110 au site 1 et dans le VLAN 210 au site 2. Que réutilise-t-on et que duplique-t-on ?

<details>
<summary>Voir le corrigé</summary>

On **réutilise** le profil WLAN. On **duplique** le profil Policy (VLAN 110 et 210), le Policy tag, le profil Flex (VLAN différents) et le Site tag : un de chaque par site.

</details>

### Exercice 3 – Diagnostiquer

Le client du SSID « Invites » s'associe mais n'a pas d'adresse IP ; « Employes » fonctionne. Que vérifiez-vous, dans l'ordre ?

<details>
<summary>Voir le corrigé</summary>

(1) Le VLAN 120 dans le **profil Flex** ; (2) le **trunk du port du LAP** (`show interfaces trunk`) ; (3) le **lien montant** ; (4) le **pool DHCP** du VLAN 120. Comme « Employes » fonctionne, le LAP, le Site tag et le DHCP général sont bons : le problème est propre au VLAN 120.

</details>

### Exercice 4 – Choisir où authentifier

Une succursale doit pouvoir accepter de nouveaux employés même si la liaison avec le WLC est coupée. Quelle fonction doit être locale, et quel est le coût ?

<details>
<summary>Voir le corrigé</summary>

L'**authentification** (en plus de l'association et du DHCP). Le coût : la base d'utilisateurs (ou la route vers le serveur) doit être **répliquée** sur le site.

</details>

### Exercice 5 – Questions de synthèse

1. Quel est le rôle du profil Flex ?
2. Quel Site tag place un LAP en mode FlexConnect ?
3. Pourquoi deux LAP proches diffusent-ils des SSID différents au laboratoire ?
4. Où règle-t-on le type de sécurité d'un SSID ? Et le lieu de l'authentification ?

<details>
<summary>Voir le corrigé</summary>

1. Il décrit ce dont le LAP a besoin pour **commuter localement** (VLAN natif, VLAN locaux, authentification locale).
2. Un Site tag avec le **site local désactivé** et un profil Flex.
3. Pour que le client choisisse volontairement le LAP voulu, au lieu de s'associer au hasard.
4. Type de sécurité : profil **WLAN**. Lieu de l'authentification : profil **Policy**.

</details>

## 12.4 Pour la suite

Votre LAP diffuse des SSID dans des VLAN distincts. Le module suivant étudie l'**authentification d'entreprise** (802.1X et RADIUS), et un cours ultérieur la **commutation centrale**.
