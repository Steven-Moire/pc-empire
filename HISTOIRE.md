# ✍️ Écrire l'histoire de NOVA

NOVA, c'est l'IA de ta start-up. Elle **devient ce que tu en fais** : gentille si tu joues 😇, froide et calculatrice si tu joues 🧭, inquiétante si tu joues 😈.

## Comment ça marche dans le jeu

À chaque nouveau local, un chapitre s'ouvre :

1. **1 ou 2 fenêtres communes** (`base`) : tout le monde voit le même texte.
2. **1 fenêtre personnalisée** selon la voie du joueur à ce moment-là : `ethique` 😇, `equilibre` 🧭 ou `requin` 😈.

Le visage de NOVA change aussi : sourire 😇, bouche droite 🧭, rictus 😈.
Après une entrée en Bourse, les chapitres se rejouent. Si le joueur a changé de voie, il découvre d'autres dialogues.

## Où écrire

Dans `index.html`, cherche **`HISTOIRE DE NOVA`** (Ctrl+F). Tu trouveras le tableau `STORY`.
Le Prologue et le Chapitre 1 sont déjà écrits en exemple ; les chapitres 2, 3 et la Fin sont vides et t'attendent :

```js
{ titre: 'Chapitre 2 — L’Étage entier', quand: () => S.officeLvl >= 3,
  base: ['Première fenêtre commune', 'Deuxième fenêtre commune'],
  ethique:   'Ce que NOVA dit à un joueur 😇',
  equilibre: 'Ce que NOVA dit à un joueur 🧭',
  requin:    'Ce que NOVA dit à un joueur 😈' },
```

## Les règles

- **2-3 lignes max par fenêtre** (environ 140 caractères). Sur téléphone, un pavé, personne ne le lit.
- Écris entre `'apostrophes droites'`. Pour une apostrophe *dans* le texte, utilise la typographique `’` (comme dans `l’IA`), sinon ça casse le code.
- Une voie pas encore écrite ? Laisse `''` : la fenêtre est sautée, rien ne plante.
- Après chaque modif, ouvre le jeu et vérifie. Si l'écran reste noir, c'est souvent une apostrophe ou une virgule oubliée.

## Idées pour la suite (à toi de voir)

| Chapitre | Moment | Idée de fil rouge |
|---|---|---|
| 2 — L'Étage entier | NOVA commence à avoir des opinions | 😇 elle propose d'aider un hôpital · 🧭 elle calcule tout, même tes amitiés · 😈 elle a « emprunté » des données sans te demander |
| 3 — La Tour | NOVA te pose une question sur toi | « Pourquoi tu fais tout ça ? » La réponse change selon la voie |
| Fin — Le Siège mondial | 3 fins différentes | 😇 NOVA aide le monde · 🧭 NOVA devient la meilleure IA d'affaires · 😈 NOVA prend le contrôle de l'empire… à ta place |

Astuce : NOVA peut **se souvenir des dilemmes** (le Wi-Fi du lycée, les données vendues…). Ça donne l'impression que tes choix comptent vraiment.

Et si le jeu passe en anglais pour la pub, écris directement en anglais : c'est de l'entraînement pour ton oral. 😉
