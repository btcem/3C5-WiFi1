---
id: m2-chap-9-synthese
title: "Chapitre 9 – Ce qu'on pratique cette année, synthèse et exercices"
sidebar_label: "9. Synthèse et exercices"
---

# Chapitre 9 – Ce qu'on pratique cette année, synthèse et exercices

## 9.1 Ce que le laboratoire permet (et ne permet pas)

Votre WLC de laboratoire est une **machine virtuelle** (9800-CL) qui n'est **pas** raccordée par un trunk : elle utilise une seule interface de couche 3. Cela limite ce qu'on peut **pratiquer**, pas ce qu'on peut **comprendre**.

| Scénario | Cette année (WLC virtuel) | Avec un WLC physique en trunk |
|---|---|---|
| Commutation **centrale**, **un seul** VLAN | Oui | Oui |
| Commutation **centrale**, **plusieurs** VLAN | **Théorie seulement** | Oui |
| Commutation **locale**, plusieurs VLAN | **Oui** | Oui |
| Un LAP qui mélange central et local | Oui (central avec un seul VLAN) | Oui |

**Pourquoi ?** En commutation centrale, c'est le **WLC** qui doit être raccordé à **chaque VLAN de client**, donc par un **trunk**. En commutation locale, ce sont le **LAP** et le **commutateur d'accès** qui portent les VLAN : le WLC n'a pas besoin de trunk. C'est exactement ce que montre le tableau du chapitre 6.

:::note[Ce qu'on peut montrer quand même]
Avec le WLC virtuel, on peut **capturer** les deux modes (chapitre 7), **tracer** la chaîne de VLAN sur papier, et **dépanner** les pannes de commutation locale avec de vrais trunks. Le centralisé multi-VLAN se travaille en **théorie** et en **simulation papier** cette année.
:::

## 9.2 Synthèse : les trois idées à retenir

1. **Un LAP porte trois tags** (Policy, Site, RF) qui pointent vers des **profils**. Le VLAN et le mode de commutation d'un SSID sont dans le **profil Policy** ; le mode du LAP vient du **Site tag**.
2. **Central ou local** change **par où passent les données** des clients : par le **WLC** (tunnel CAPWAP, UDP 5247) ou **directement** depuis le LAP (trames 802.1Q).
3. Cela décide **où chaque VLAN doit exister** : trunk du **WLC** (central) ou trunks de l'**accès** (local). La distribution (SVI, HSRP, DHCP) est la même.

## 9.3 Tableau de référence

| | Central | Local (FlexConnect) |
|---|---|---|
| Site tag | Site local **activé** (ou défaut) | Site local **désactivé** + profil Flex |
| Profil Policy | `central switching` | pas de `central switching` |
| Port du LAP | Accès VLAN 50 | Trunk natif 50 + VLAN clients |
| VLAN client sur accès | Non | Oui |
| VLAN client sur trunk WLC | Oui | Non |
| Profil Flex | Sans objet | VLAN client déclaré |
| Capture au port du LAP | UDP 5247 | 802.1Q du client |

## 9.4 Exercices

### Exercice 1 – Grille de décision

Complétez la grille du chapitre 5.

| Situation | Mode ? | Port du LAP ? | VLAN à autoriser où ? |
|---|---|---|---|
| SSID **invités** d'un campus, trafic vers Internet seulement | ? | ? | ? |
| SSID **employés** d'un campus, accès aux serveurs, politique centralisée | ? | ? | ? |
| **Succursale** distante (lien WAN lent), SSID employés | ? | ? | ? |

<details>
<summary>Voir le corrigé</summary>

| Situation | Mode | Port du LAP | VLAN à autoriser où |
|---|---|---|---|
| Invités du campus | **Local** (sortie Internet directe, on ne charge pas le WLC) ; **central** est aussi acceptable | **Trunk** (si local) | Trunk du LAP, lien montant AS1 ↔ DS, déclaré dans le profil Flex |
| Employés du campus | **Central** (politique centralisée) | **Accès VLAN 50** | Trunk DS ↔ **WLC** ; VLAN existe sur le WLC |
| Succursale distante | **Local** (éviter le lien WAN lent, résilience) | **Trunk** | Trunk du LAP, accès local, profil Flex |

</details>

### Exercice 2 – Tracer le VLAN 120 en commutation centrale

Le SSID « Invites » (VLAN 120) devient central. Listez les changements par rapport à la version locale du chapitre 6.

<details>
<summary>Voir le corrigé</summary>

- **Port du LAP** : le VLAN 120 n'a plus besoin d'être autorisé ; le LAP peut revenir à un **port d'accès VLAN 50** si plus aucun SSID n'est local.
- **Lien AS1 ↔ DS** : le VLAN 120 n'y est plus nécessaire.
- **Trunk DS ↔ WLC** : **ajouter le VLAN 120**.
- **WLC** : le VLAN 120 doit **exister**.
- **Profil Policy** : `central switching` ; **profil Flex** : le VLAN 120 n'y est plus requis.
- **DS1 / DS2** : inchangé (SVI 120, HSRP, DHCP).

</details>

### Exercice 3 – Lire une configuration

Un LAP porte le Site tag suivant. Dites dans quel mode il fonctionne et ce qu'il faut sur son port.

```text
wireless tag site SITE-B
 ap-profile AJP-B
 flex-profile FLEX-B
 no local-site
!
wireless profile flex FLEX-B
 native-vlan-id 50
 vlan-name VLAN130
  vlan-id 130
```

<details>
<summary>Voir le corrigé</summary>

Le LAP est en mode **FlexConnect** (`no local-site`, profil Flex). Son port sur l'accès doit être un **trunk** avec le **VLAN natif 50** et le **VLAN 130 autorisé** (en plus du 50). Le VLAN 130 doit aussi être autorisé sur le lien montant et exister sur la distribution.

</details>

### Exercice 4 – Étude de cas

Un client s'associe au SSID « Employes » (local, VLAN 110) sur LAP-2 et n'obtient pas d'adresse IP. Les clients du SSID « Employes » en commutation centrale sur LAP-1 fonctionnent. Que concluez-vous ?

<details>
<summary>Voir le corrigé</summary>

La **distribution** (SVI 110, HSRP, DHCP) fonctionne puisque l'autre mode marche pour le même VLAN. Le problème est donc **propre au chemin local** : VLAN 110 absent du **trunk du port de LAP-2**, du **lien montant**, ou du **profil Flex**. On vérifie dans cet ordre avec `show interfaces trunk` et `show wireless profile flex summary`.

</details>

### Exercice 5 – Questions de synthèse

1. Quel est le rôle du profil Flex, et dans quel mode du LAP est-il utilisé ?
2. Quel Site tag configure un LAP en mode FlexConnect ?
3. Citez trois différences de configuration sur le commutateur d'accès entre les deux modes.
4. Que se passe-t-il pour un client si le LAP perd le WLC, selon le mode ?

<details>
<summary>Voir le corrigé</summary>

1. Le profil **Flex** décrit ce dont un LAP a besoin pour **commuter localement** (VLAN natif, VLAN locaux, authentification locale) ; il est utilisé en **mode FlexConnect**.
2. Un Site tag avec le **site local désactivé** et un **profil Flex**.
3. **Type de port** (accès ou trunk) ; **VLAN client** présent ou non sur l'accès ; **lien montant** qui doit autoriser les VLAN clients (local seulement).
4. En **central**, le service est **interrompu** ; en **local**, les clients déjà connectés **peuvent rester** connectés.

</details>

## 9.5 Pour la suite

Votre LAP porte maintenant des tags et diffuse des SSID. Reste à décider **qui a le droit de se connecter**. Le module suivant étudie l'**authentification d'entreprise** (802.1X et RADIUS), et son lien avec la commutation : une authentification peut elle aussi être **centrale** ou **locale**.
