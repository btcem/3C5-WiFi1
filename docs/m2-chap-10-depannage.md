---
id: m2-chap-10-depannage
title: "Chapitre 10 – Dépannage"
sidebar_label: "10. Dépannage"
---

# Chapitre 10 – Dépannage

**Objectif :** diagnostiquer les pannes typiques d'un SSID en suivant la trame, maillon par maillon.

Dans le module 1, vous cherchiez la **dernière étape réussie** de la jonction. Ici, la méthode est la même, mais la chaîne est celle des **VLAN et des profils**.

## 10.1 La méthode en cinq questions

```mermaid
flowchart LR
  A["1. Le SSID<br/>est-il diffusé ?"] --> B["2. Le client<br/>s'associe-t-il ?"]
  B --> C["3. Obtient-il<br/>une adresse IP ?"]
  C --> D["4. Dans quel<br/>VLAN ?"]
  D --> E["5. Atteint-il<br/>sa passerelle ?"]
```

| Étape | Si ça échoue, penser à |
|---|---|
| 1. SSID non diffusé | **Tags** du LAP, profil WLAN activé, Policy tag |
| 2. Association échoue | Sécurité du profil WLAN (clé, 802.1X) |
| 3. Pas d'adresse IP | **VLAN** (trunk, profil Flex), DHCP |
| 4. Mauvais VLAN | Profil Policy, profil Flex, VLAN natif |
| 5. Passerelle injoignable | SVI, HSRP, VLAN existant sur la distribution |

## 10.2 Scénario A – « Il a une IP, mais dans le mauvais réseau » (local)

**Situation.** Le SSID « Employes » est en commutation **locale**. Le client s'associe et obtient une adresse du réseau **10.0.50.0/24** (le réseau des LAP) au lieu de 10.0.110.0/24.

<details>
<summary>Voir la cause et la correction</summary>

**Cause probable :** le VLAN **110 n'est pas déclaré dans le profil Flex** (ou son numéro ne correspond pas à celui du profil Policy). Le LAP ne connaît pas ce VLAN et place le client dans le **VLAN natif** (50). Le comportement exact dépend de la version, mais dans tous les cas ce n'est pas ce qu'on veut.

**Correction :** déclarer le VLAN 110 dans le profil Flex, avec le **même nom/numéro** que le profil Policy.

</details>

## 10.3 Scénario B – « Il s'associe mais pas d'IP » (local)

**Situation.** Le SSID « Invites » est en commutation **locale** (VLAN 120). Le client s'associe, **pas d'adresse IP**. Le profil Flex et le profil Policy sont corrects.

<details>
<summary>Voir la cause et la correction</summary>

**Cause :** le VLAN **120 n'est pas autorisé** sur le trunk du **port du LAP** ou sur le **lien montant** AS1 ↔ DS1. La trame sort du LAP mais n'atteint pas la distribution.

**Diagnostic :** `show interfaces trunk` sur AS1 pour le port du LAP, puis pour le lien montant. Le VLAN 120 manque quelque part.

**Correction :** `switchport trunk allowed vlan add 120` à l'endroit où il manque.

</details>

## 10.4 Scénario C – « Mon profil Policy est local, mais ça passe par le WLC »

**Situation.** Un profil Policy est configuré en **commutation locale**, mais une capture montre du trafic UDP 5247 vers le WLC et le client reçoit une adresse du VLAN du WLC.

<details>
<summary>Voir la cause et la correction</summary>

**Cause :** le LAP est en **mode local** : le **site local est activé** dans son Site tag, ou le LAP porte le **Site tag par défaut**. Le profil Policy « local » est ignoré.

**Correction :** attribuer au LAP un **Site tag** avec **site local désactivé** et un **profil Flex**. Vérifier les tags du LAP dans *Configuration > Wireless > Access Points*.

</details>

## 10.5 Scénario D – « Le SSID n'apparaît pas »

**Situation.** Un LAP est joint au WLC, mais le SSID « Employes » n'est visible nulle part.

<details>
<summary>Voir la cause et la correction</summary>

**Cause :** le LAP porte les **tags par défaut** (aucune attribution). Aucun Policy tag ne relie le profil WLAN « Employes » à un profil Policy pour ce LAP.

**Correction :** créer un Policy tag qui associe le profil WLAN à un profil Policy, et l'**attribuer** au LAP (vérifiez les tags du LAP dans l'interface web).

</details>

## 10.6 Scénario E – « Il s'associe, mais l'authentification échoue »

**Situation.** Le SSID est en 802.1X avec des utilisateurs locaux. Le client entre son identifiant et son mot de passe, puis la connexion est refusée.

<details>
<summary>Voir la cause et la correction</summary>

**Causes possibles :** l'utilisateur n'existe pas dans la base **où l'authentification se déroule** (base du WLC en authentification centrale, base du profil Flex en authentification locale) ; la case *Central Authentication* du profil Policy ne correspond pas à l'endroit où on a créé l'utilisateur ; la **méthode EAP** du client n'est pas celle qui est permise.

**Correction :** créer l'utilisateur **au bon endroit**, ou aligner le profil Policy sur la base utilisée, et vérifier la méthode EAP.

</details>

## 10.7 Scénario F – « Il s'associe, a une IP du bon réseau, mais pas de passerelle »

**Situation.** Le client a une adresse du bon VLAN mais ne joint pas sa passerelle.

<details>
<summary>Voir la cause et la correction</summary>

**Cause :** la **SVI** ou la sous-interface du routeur pour ce VLAN est absente ou arrêtée, ou le pool DHCP donne une mauvaise passerelle.

**Correction :** vérifier l'interface et le pool sur le routeur ou la distribution.

</details>

## 10.8 Tableau récapitulatif

| Symptôme | Mode | Cause probable | Où corriger |
|---|---|---|---|
| SSID invisible | Tous | LAP avec tags par défaut | Policy tag du LAP |
| S'associe, **pas d'IP** | Local | VLAN absent du **trunk du LAP ou du lien montant** | AS1, trunk |
| IP dans le **VLAN des LAP** | Local | VLAN absent du **profil Flex** | Profil Flex |
| « Local » mais trafic vers le WLC | Local | **Site local activé** | Site tag |
| Authentification refusée | Local ou central | Utilisateur absent de la base utilisée | Profil Policy, base d'utilisateurs |
| LAP injoignable après passage en trunk | Local | **VLAN natif** incohérent | Port du LAP, profil Flex |

## À retenir

- Suivez la trame : **diffusé → associé → IP → bon VLAN → passerelle**.
- Un client **sans IP** : suspectez un **maillon de VLAN** manquant (trunk du LAP, lien montant) ou le **pool DHCP**.
- **IP dans le VLAN des LAP** : VLAN absent du **profil Flex**.
- Une commutation « locale » qui passe par le WLC : le LAP est en **mode local** (Site tag).

## Vérifiez votre compréhension

**Question 1.** Le client n'a pas d'adresse IP. Quel équipement vérifiez-vous en premier, et avec quelle commande ?

<details>
<summary>Voir le corrigé</summary>

Le **trunk du port du LAP** sur le commutateur d'accès : `show interfaces trunk`, pour confirmer que le VLAN du client y est autorisé, puis le lien montant et le pool DHCP.

</details>

**Question 2.** Le client a une adresse du VLAN 50. Quelle est la cause la plus probable ?

<details>
<summary>Voir le corrigé</summary>

Le VLAN du client n'est **pas déclaré dans le profil Flex** (ou son numéro ne correspond pas) : le LAP place le client dans le VLAN natif.

</details>

**Question 3.** Les VLAN 110 et 120 sont autorisés sur le trunk du LAP, mais pas sur le lien montant AS1 ↔ DS1. Que voit-on ?

<details>
<summary>Voir le corrigé</summary>

Les clients s'associent, mais n'ont **pas d'adresse IP** (le DHCP n'est pas joignable) : la trame sort du LAP mais n'arrive pas à la distribution.

</details>
