---
id: m2-glossaire
title: Glossaire du module 2
sidebar_label: Glossaire
---

# Glossaire du module 2

| Terme | Signification |
|---|---|
| **Profil** | Ensemble de paramètres de configuration du WLC (WLAN, Policy, AP Join, Flex, RF) |
| **Tag** (du WLC) | Regroupement de profils attribué à un LAP (Policy tag, Site tag, RF tag). Ne pas confondre avec l'étiquette 802.1Q |
| **Profil WLAN** | Décrit un réseau sans fil : SSID et sécurité |
| **Profil Policy** | Décrit le traitement des clients d'un SSID : VLAN, commutation centrale ou locale, etc. |
| **Profil AP Join** | Paramètres du LAP vis-à-vis du WLC (CAPWAP, WLC de secours, accès SSH) |
| **Profil Flex** | Paramètres d'un LAP en commutation locale : VLAN natif, VLAN locaux, authentification locale |
| **Profil RF** | Paramètres radio (débits, canaux, puissances) |
| **Policy tag** | Relie des profils WLAN à des profils Policy |
| **Site tag** | Regroupe un profil AP Join et un profil Flex ; décide du **mode du LAP** (local ou FlexConnect) |
| **RF tag** | Regroupe les profils RF 2,4 GHz et 5 GHz |
| **Tags par défaut** | `default-policy-tag`, `default-site-tag`, `default-rf-tag` : portés par un LAP sans attribution |
| **Commutation centrale** | Les données des clients passent par le WLC (tunnel CAPWAP, UDP 5247) |
| **Commutation locale** | Le LAP dépose les trames des clients directement sur le réseau filaire |
| **FlexConnect** | Mode d'un LAP permettant la commutation locale |
| **Site local** | Option du Site tag : activée, le LAP est en mode local (commutation centrale) |
| **Mode connecté / autonome** | État d'un LAP FlexConnect joint au WLC / ayant perdu le WLC |
| **Split-MAC** | Répartition des fonctions MAC entre le LAP et le WLC |
| **Hairpin** | Détour inutile du trafic par le WLC (ex. deux clients d'un même LAP) |
| **VLAN natif** | VLAN non étiqueté d'un trunk. Sur le port d'un LAP FlexConnect : le VLAN des LAP |
| **Chaîne de VLAN** | Liste des maillons (ports, trunks, profils, SVI) où un VLAN doit exister |
