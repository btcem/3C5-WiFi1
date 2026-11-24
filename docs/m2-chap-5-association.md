---
id: m2-chap-5-association
title: "Chapitre 5 – L'association : local et central"
sidebar_label: "5. Association"
---

# Chapitre 5 – L'association : local et central

**Objectif :** décrire les étapes d'une connexion 802.11 et savoir qui les traite selon que l'association est locale ou centrale. Ce chapitre est **théorique** : nous n'expérimentons pas la perte du WLC.

## 5.1 Les étapes d'une connexion

```mermaid
flowchart LR
  A["1. Sondage<br/>(probe)"] --> B["2. Authentification 802.11<br/>(système ouvert)"]
  B --> C["3. Association"]
  C --> D["4. Sécurité<br/>(clé, 802.1X)"]
  D --> E["5. DHCP et données"]
```

1. Le client **sonde** les réseaux (*probe request*) ou écoute les balises.
2. L'**authentification 802.11** de base (« système ouvert ») est une formalité.
3. Le client **s'associe** : le point d'accès lui attribue un identifiant d'association.
4. La **sécurité** (clé prépartagée ou 802.1X) établit les clés de chiffrement.
5. Le client obtient une adresse (DHCP) et envoie ses données.

## 5.2 Association centrale

Le LAP **relaie** les trames de gestion au WLC, qui décide d'accepter ou non le client. Le WLC garde l'état de chaque client (itinérance, politiques). C'est le mode « split-MAC » classique du module 1.

## 5.3 Association locale

Le **LAP** traite lui-même l'association. Le WLC en est informé quand il est joignable, mais n'est pas nécessaire pour accepter le client.

| | Association centrale | Association locale |
|---|---|---|
| Qui accepte le client | Le **WLC** | Le **LAP** |
| Si le WLC est perdu | Nouveaux clients refusés | Nouveaux clients acceptés (selon la sécurité) |
| Utilité | Contrôle centralisé | Résilience d'un site distant |

:::warning[L'association locale n'est pas toute la solution]
Un client qui s'associe localement doit encore être **authentifié** et obtenir une **adresse**. Pour qu'un site reste vraiment autonome, il faut aussi une authentification et un DHCP locaux (chapitres 4 et 6).
:::

## À retenir

- Une connexion suit : sondage, authentification 802.11, association, sécurité, DHCP.
- **Association centrale** : le WLC accepte les clients ; **locale** : le LAP les accepte.
- L'association locale améliore la **résilience**, à condition que l'authentification et le DHCP le soient aussi.

## Vérifiez votre compréhension

**Question 1.** Quelle est la différence entre l'authentification 802.11 de base et l'authentification 802.1X ?

<details>
<summary>Voir le corrigé</summary>

L'authentification 802.11 de base (système ouvert) est une **formalité** qui ne vérifie pas l'identité. L'**802.1X** vérifie réellement l'utilisateur, après l'association.

</details>

**Question 2.** Pourquoi une association locale seule ne rend-elle pas un site autonome ?

<details>
<summary>Voir le corrigé</summary>

Parce que le client doit aussi être **authentifié** (si l'authentification reste centrale, il faut le WLC) et obtenir une **adresse** (DHCP).

</details>
