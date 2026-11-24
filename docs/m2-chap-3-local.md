---
id: m2-chap-3-local
title: "Chapitre 3 – La commutation locale (FlexConnect)"
sidebar_label: "3. Commutation locale"
---

# Chapitre 3 – La commutation locale (FlexConnect)

**Objectif :** suivre le chemin d'une trame de client en commutation locale, et savoir quoi configurer sur chaque équipement.

## 3.1 Le principe

En commutation **locale**, le LAP **dépose directement** la trame du client sur le réseau filaire, dans le VLAN du client, **sans passer par le WLC**. Le WLC ne voit plus les données des clients : il continue de **gérer** le LAP (configuration, authentification, supervision) par le canal de **contrôle** CAPWAP.

Ce mode de fonctionnement du LAP s'appelle **FlexConnect**. C'est le seul mode de commutation étudié dans ce cours.

```mermaid
flowchart LR
  CL["Client<br/>Employes"] -->|"trame 802.11"| LAP["LAP-2<br/>FlexConnect"]
  LAP -->|"VLAN 110<br/>étiqueté 802.1Q"| AS1["AS1<br/>trunk"]
  AS1 --> DS1["DS1<br/>SVI 110 + HSRP"]
  DS1 --> NET["Reste du réseau<br/>et Internet"]
  LAP -.->|"CAPWAP contrôle<br/>UDP 5246"| WLC["WLC"]
```

:::info[À retenir]
Commutation locale : le client est **terminé au LAP**, et son VLAN circule sur le **réseau d'accès**. Le LAP se comporte comme un **commutateur** qui dépose le trafic dans le bon VLAN.
:::

## 3.2 Qui décide : le Site tag

Un LAP fonctionne en **mode FlexConnect** ou en **mode local** selon son **Site tag** :

| Site tag | Mode du LAP | Conséquence |
|---|---|---|
| **Site local** désactivé, avec un **profil Flex** | Mode **FlexConnect** | Le LAP peut commuter **localement** : c'est notre cas |
| **Site local** activé (option « Enable Local Site ») | Mode **local** | C'est le **WLC** qui commute les données : hors de ce cours |

:::warning[Les deux niveaux de décision]
Le **Site tag** décide du **mode du LAP**. Le **profil Policy** décide, **pour chaque SSID**, des fonctions locales ou centrales. Un profil Policy « commutation locale » n'a d'effet que si le LAP est en **mode FlexConnect** : sur un LAP en mode local, il est ignoré. C'est une cause fréquente de confusion (voir le chapitre 10).
:::

## 3.3 Le profil Flex

Le **profil Flex** décrit ce dont un LAP a besoin pour commuter **seul** :

| Paramètre | Rôle |
|---|---|
| **VLAN natif** | Le VLAN non étiqueté du port du LAP : celui du LAP lui-même (VLAN 50) |
| **Liste de VLAN** | Les VLAN **locaux** que le LAP connaît (110, 120). Chaque VLAN y est déclaré, avec son numéro |
| Authentification locale | Utilisateurs locaux, serveur d'authentification joint par le LAP (chapitre 6) |
| ACL, etc. | Contrôles propres à la commutation locale |

Exemple dans l'interface web (*Configuration > Tags & Profiles > Flex*, profil **FLEX-SITE**) : onglet General, **Native VLAN ID = 50** ; onglet VLAN, deux entrées : nom VLAN110 avec l'ID 110, et nom VLAN120 avec l'ID 120.

:::info[À retenir]
Le **VLAN natif** du profil Flex doit être le même que le **VLAN natif du trunk** configuré sur le commutateur d'accès. S'il diffère, le LAP et le commutateur ne s'entendent pas sur le VLAN non étiqueté, et le LAP perd son accès au réseau ou les VLAN sont mal placés.
:::

## 3.4 Ce qu'il faut configurer

### Sur le profil Policy

Dans *Configuration > Tags & Profiles > Policy*, profil **POL-EMPLOYES-LOCAL** : **Central Switching** et **Central DHCP** décochés (les fonctions d'association et d'authentification sont étudiées aux chapitres 5 et 6), VLAN **110** (onglet Access Policies), profil activé.

Le nom (ou le numéro) du VLAN doit correspondre à un VLAN **déclaré dans le profil Flex**.

### Sur le Site tag

Dans *Configuration > Tags & Profiles > Tags > Site*, tag **SITE-SUCCURSALE** : profil AP Join AJP-SUCCURSALE, case **Enable Local Site décochée**, profil Flex FLEX-SITE.

### Sur le commutateur d'accès (port du LAP) : un trunk

```text
interface GigabitEthernet1/0/11
 description LAP-2 (commutation locale)
 switchport mode trunk
 switchport trunk native vlan 50
 switchport trunk allowed vlan 50,110,120
 spanning-tree portfast trunk
```

Le **VLAN natif 50** est celui du LAP (son adresse IP et son tunnel de contrôle, comme au module 1). Les VLAN **110 et 120** circulent **étiquetés 802.1Q**.

### Sur les liens de l'accès à la distribution

Le trunk entre AS1 et DS1 (et DS2) doit **autoriser** les VLAN **110 et 120**, en plus du VLAN 50 :

```text
interface Port-channel1
 description Vers DS1
 switchport mode trunk
 switchport trunk allowed vlan 50,110,120
```

### Sur la distribution

La **SVI** et le **HSRP** pour 110 et 120, et le DHCP correspondant : comme pour tout VLAN d'utilisateurs ordinaires. Le WLC n'intervient pas dans ce trafic.

## 3.5 Ce que la commutation locale apporte

- **Le trafic ne passe pas par le WLC** : pas de goulot, pas de détour. Deux clients du même LAP communiquent **localement**.
- **Résilience** : si le LAP **perd** le WLC, les clients déjà connectés **peuvent rester connectés** (voir 4.6).
- **Adaptée aux sites distants**, où faire remonter tout le trafic jusqu'à un WLC lointain serait coûteux.

## 3.6 Connecté ou autonome

Un LAP FlexConnect a deux états :

| État | Condition | Comportement |
|---|---|---|
| **Connecté** (*connected*) | Le LAP est joint au WLC | Fonctionnement normal : le WLC gère la configuration et l'authentification |
| **Autonome** (*standalone*) | Le LAP a **perdu** le WLC | Les clients déjà connectés peuvent rester ; les nouveaux clients peuvent être acceptés selon l'association, le DHCP et l'authentification confiés au LAP (chapitres 4 à 6) |

:::note[À propos du mode autonome]
Ce qu'un LAP peut faire seul dépend de la configuration et de la version. Nous ne l'expérimentons pas au laboratoire : ce mode est expliqué en théorie.
:::

## 3.7 Ce que la commutation locale coûte

- **Les VLAN des clients doivent exister sur tout le réseau d'accès** : sur **chaque commutateur d'accès** où un LAP FlexConnect est branché, et sur les liens montants. Plus de commutateurs, plus de VLAN à configurer.
- **Plus d'endroits où se tromper** : une seule erreur de VLAN sur un trunk d'accès coupe un SSID.
- **Itinérance plus délicate** : un client qui se déplace entre deux LAP branchés sur des commutateurs d'accès différents garde le même VLAN seulement si ce VLAN existe **sur les deux**.
- **Politique moins centralisée** : certains contrôles doivent être répliqués (profil Flex).

## 3.8 Un LAP, plusieurs SSID, plusieurs VLAN

Le trunk du LAP peut transporter **plusieurs VLAN de clients** : un SSID par VLAN, chacun associé à son profil Policy dans le **même Policy tag**. Le LAP se comporte alors comme un commutateur qui place chaque client dans le VLAN de son SSID.

```mermaid
flowchart LR
  C1["Client SSID Employes"] --> LAP["LAP<br/>FlexConnect"]
  C2["Client SSID Invites"] --> LAP
  LAP ---|"trunk : natif 50<br/>VLAN 110 et 120"| AS1["AS1"]
  AS1 --- DS1["DS1<br/>SVI 110 et 120"]
```

Le profil Flex déclare **les deux VLAN** (110 et 120) et le trunk du LAP les autorise tous les deux. Le chapitre 8 trace cette chaîne maillon par maillon.

## À retenir

- En commutation locale, le LAP **dépose les trames des clients** sur le réseau filaire, dans le VLAN de leur SSID.
- Le **Site tag non local** met le LAP en **FlexConnect** ; le **profil Flex** déclare le **VLAN natif** et les **VLAN des clients**.
- Le port du LAP est un **trunk** : natif = VLAN des LAP ; VLAN des clients **étiquetés 802.1Q**.
- Le **WLC** n'a besoin que du VLAN de gestion : le trafic des clients ne passe pas par lui.
- Un LAP **autonome** continue de servir les clients connectés.

## Vérifiez votre compréhension

**Question 1.** Quel objet décide qu'un LAP est en mode FlexConnect ?

<details>
<summary>Voir le corrigé</summary>

Le **Site tag** : *Enable Local Site* décoché, avec un profil Flex.

</details>

**Question 2.** Où doit-on déclarer le VLAN 110 pour qu'il fonctionne en commutation locale ? Citez quatre endroits.

<details>
<summary>Voir le corrigé</summary>

(1) Dans le **profil Policy** ; (2) dans le **profil Flex** ; (3) sur le **trunk** du port du LAP et sur les **liens montants** de l'accès ; (4) sur la **distribution** (SVI, HSRP, DHCP).

</details>

**Question 3.** Le profil Policy est « commutation locale », mais le LAP porte le Site tag par défaut. Que se passe-t-il ?

<details>
<summary>Voir le corrigé</summary>

Le LAP est en **mode local** : le profil Policy « local » est ignoré, et les données ne sont pas commutées localement. Il faut lui attribuer un **Site tag** non local avec un profil Flex.

</details>

**Question 4.** Le VLAN natif du profil Flex est 1 et celui du trunk d'accès est 50. Quel problème peut-on prévoir ?

<details>
<summary>Voir le corrigé</summary>

Le LAP et le commutateur d'accès ne sont **pas d'accord** sur le VLAN non étiqueté : le LAP risque de ne plus joindre le WLC ou de placer ses VLAN au mauvais endroit. Les deux VLAN natifs doivent être **identiques**.

</details>

**Question 5.** Qu'est-ce qui distingue le trunk d'un LAP qui diffuse deux SSID dans deux VLAN de celui d'un LAP qui n'en diffuse qu'un ?

<details>
<summary>Voir le corrigé</summary>

Les **VLAN autorisés** : le trunk doit autoriser les deux VLAN des clients (en plus du VLAN natif), et le profil Flex doit les déclarer tous les deux.

</details>
