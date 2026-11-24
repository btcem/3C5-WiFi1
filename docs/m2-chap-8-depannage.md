---
id: m2-chap-8-depannage
title: "Chapitre 8 – Dépannage"
sidebar_label: "8. Dépannage"
---

# Chapitre 8 – Dépannage

**Objectif :** diagnostiquer les pannes typiques d'un SSID en suivant la trame, maillon par maillon.

Dans le module 1, vous cherchiez la **dernière étape réussie** de la jonction. Ici, la méthode est la même, mais la chaîne est celle des **VLAN et des profils**.

## 8.1 La méthode en cinq questions

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

## 8.2 Scénario A – « Il s'associe mais n'a pas d'IP » (central)

**Situation.** Le SSID « Employes » est en commutation **centrale** (VLAN 110). Le client s'associe, mais reste sans adresse IP (169.254...).

**Démarche.**

1. L'étape 3 échoue : pas d'IP. Le client est-il bien dans le bon VLAN ? Détail du client dans *Monitoring > Wireless > Clients* : le VLAN est 110.
2. Où est-ce que la trame disparaît ? En central, elle passe par le trunk du WLC.
3. `show interfaces trunk` sur DS1 : le trunk vers le WLC n'autorise que le VLAN 99.

<details>
<summary>Voir la cause et la correction</summary>

**Cause :** le VLAN **110 n'est pas autorisé** sur le trunk DS1 ↔ WLC. Les trames du client sortent du WLC mais sont bloquées par le trunk.

**Correction :** `switchport trunk allowed vlan add 110` sur le port (ou port-channel) vers le WLC, et vérifier que le VLAN 110 **existe** sur le WLC.

</details>

## 8.3 Scénario B – « Il a une IP, mais dans le mauvais réseau » (local)

**Situation.** Le SSID « Employes » est en commutation **locale**. Le client s'associe et obtient une adresse du réseau **10.0.50.0/24** (le réseau des LAP) au lieu de 10.0.110.0/24.

<details>
<summary>Voir la cause et la correction</summary>

**Cause probable :** le VLAN **110 n'est pas déclaré dans le profil Flex** (ou son numéro ne correspond pas à celui du profil Policy). Le LAP ne connaît pas ce VLAN et place le client dans le **VLAN natif** (50). Le comportement exact dépend de la version, mais dans tous les cas ce n'est pas ce qu'on veut.

**Correction :** déclarer le VLAN 110 dans le profil Flex, avec le **même nom/numéro** que le profil Policy.

</details>

## 8.4 Scénario C – « Il s'associe mais pas d'IP » (local)

**Situation.** Le SSID « Invites » est en commutation **locale** (VLAN 120). Le client s'associe, **pas d'adresse IP**. Le profil Flex et le profil Policy sont corrects.

<details>
<summary>Voir la cause et la correction</summary>

**Cause :** le VLAN **120 n'est pas autorisé** sur le trunk du **port du LAP** ou sur le **lien montant** AS1 ↔ DS1. La trame sort du LAP mais n'atteint pas la distribution.

**Diagnostic :** `show interfaces trunk` sur AS1 pour le port du LAP, puis pour le lien montant. Le VLAN 120 manque quelque part.

**Correction :** `switchport trunk allowed vlan add 120` à l'endroit où il manque.

</details>

## 8.5 Scénario D – « Mon profil Policy est local, mais ça passe par le WLC »

**Situation.** Un profil Policy est configuré en **commutation locale**, mais une capture montre du trafic UDP 5247 vers le WLC et le client reçoit une adresse du VLAN du WLC.

<details>
<summary>Voir la cause et la correction</summary>

**Cause :** le LAP est en **mode local** : le **site local est activé** dans son Site tag, ou le LAP porte le **Site tag par défaut**. Le profil Policy « local » est ignoré.

**Correction :** attribuer au LAP un **Site tag** avec **site local désactivé** et un **profil Flex**. Vérifier les tags du LAP dans *Configuration > Wireless > Access Points*.

</details>

## 8.6 Scénario E – « Le SSID n'apparaît pas »

**Situation.** Un LAP est joint au WLC, mais le SSID « Employes » n'est visible nulle part.

<details>
<summary>Voir la cause et la correction</summary>

**Cause :** le LAP porte les **tags par défaut** (aucune attribution). Aucun Policy tag ne relie le profil WLAN « Employes » à un profil Policy pour ce LAP.

**Correction :** créer un Policy tag qui associe le profil WLAN à un profil Policy, et l'**attribuer** au LAP (vérifiez les tags du LAP dans l'interface web).

</details>

## 8.7 Tableau récapitulatif

| Symptôme | Mode | Cause probable | Où corriger |
|---|---|---|---|
| SSID invisible | Tous | LAP avec tags par défaut | Policy tag du LAP |
| S'associe, **pas d'IP** | Central | VLAN absent du **trunk du WLC** | DS1 ↔ WLC |
| S'associe, **pas d'IP** | Local | VLAN absent du **trunk du LAP ou du lien montant** | AS1, trunk |
| IP dans le **VLAN des LAP** | Local | VLAN absent du **profil Flex** | Profil Flex |
| « Local » mais trafic vers le WLC | Local | **Site local activé** | Site tag |
| LAP injoignable après passage en trunk | Local | **VLAN natif** incohérent | Port du LAP, profil Flex |

## À retenir

- Suivez la trame : **diffusé → associé → IP → bon VLAN → passerelle**.
- Un client **sans IP** : suspectez un **maillon de VLAN** manquant (trunk du WLC en central ; trunk du LAP et lien montant en local).
- **IP dans le VLAN des LAP** : VLAN absent du **profil Flex**.
- Une commutation « locale » qui passe par le WLC : le LAP est en **mode local** (Site tag).

## Vérifiez votre compréhension

**Question 1.** En central, le client n'a pas d'adresse IP. Quel équipement vérifiez-vous en premier, et avec quelle commande ?

<details>
<summary>Voir le corrigé</summary>

Le **trunk** entre DS1 et le WLC : `show interfaces trunk`, pour confirmer que le VLAN du client (110) y est autorisé. Vérifiez aussi que le VLAN existe sur le WLC (*Configuration > Layer2 > VLAN*).

</details>

**Question 2.** En local, le client a une adresse du VLAN 50. Quelle est la cause la plus probable ?

<details>
<summary>Voir le corrigé</summary>

Le VLAN du client n'est **pas déclaré dans le profil Flex** (ou son numéro ne correspond pas) : le LAP place le client dans le VLAN natif.

</details>

**Question 3.** Les VLAN 110 et 120 sont autorisés sur le trunk du LAP, mais pas sur le lien montant AS1 ↔ DS1. Que voit-on ?

<details>
<summary>Voir le corrigé</summary>

Les clients s'associent, mais n'ont **pas d'adresse IP** (le DHCP n'est pas joignable) : la trame sort du LAP mais n'arrive pas à la distribution.

</details>
