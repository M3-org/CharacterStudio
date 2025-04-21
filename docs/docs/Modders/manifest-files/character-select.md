---
sidebar_position: 2
---

# Character Select

There's a manifest.json file for the character select screen located in the public folder of the repo, for example `CharacterStudio/public/character-assets/manifest.json`. Think of each of these as a new character template, like picking a class in an MMO or choosing your fighter in a video game.

![image](/img/B1DdAF3oa.png)

This section is also where it can be possible to load up characters or traits you own after connecting to the app with a web3 wallet. Although this functionality is not built in yet, one can imagine the ability to read what tokens the user owns and load up unique profiles based on that. This is similar to x-scan in the [AdWorld character creator](https://adworld.game/).

Characters can each have set of individual traits via their own manifest.json files referenced from here like so:

```json!
[
  {
    "name": "Feminine",
    "description": "Anata Female",
    "portrait": "./assets/portraitImages/anata.png",
    "manifest":"./anata-vrm/female/manifest.json",
    "icon": "./assets/icons/class-neural-hacker.svg",
    "format": "vrm"
  },
  {
    "name": "Masculine",
    "description": "Anata Male",
    "portrait": "./assets/portraitImages/anata_male.png",
    "manifest":"./anata-vrm/male/manifest.json",
    "icon": "./assets/icons/class-neural-hacker.svg",
    "format": "vrm"
  }
]
```

The next section will have more information about each manifest.json file being referenced.
