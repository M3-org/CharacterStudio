# Overview

Character Studio aims to give a quick setup to any character generator. Logic lies within `Scripts` and `Managers` that have been externalized to be reusable. The react app initializes these managers within a [SceneContext](./Contexts/scene-context.md) to be quickly imported and accessed in any `React Page` or `React Component`.

![](/img/overview-schema.jpg)

### Utility Scripts

Utility scripts are reusable, they are saved within external scripts so they can be accessed by Managers. They provide the necessary code to merge geomtries, export vrm files, combine bones, cull hidden faces etc. 


### Class Managers

Class Managers create functions to easily access this utility scripts and give them a sense of user. For example the [CharacterManager](./Managers/character-manager.md) class, the main manager for the character studio, provides functions to load traits (models, textures, colors) given a manifest, download files, interpret NFT metadata etc.


### React Contexts

React Contexts provide an easy way to access interactions within the whole react app, [SceneContext](./Contexts/scene-context.md) being the most important in this app, gives a quick and easy access to Managers, so you can call and use functions within any react `page` or `component`. Other components provide easy access to common functions such as playing audio, and language translation.


### Pages

Pages provide a way to segment different menus and options to choose from the character studio. It displays wether you want to load custom manifests, load preloaded `character-manifest.json` from `.env` or chat with the current created character. minting, etc. Additional information on what each page provides or do can be found in the pages section.


### Components

Components mainly serve as menus within pages, they can either be simple buttons, or full menus that fetch their actions from `characterManager` class, accessed by scene context.

#### This is a basic overview of how the app is currently working

![](/img/overview-app.jpg)