# Scene Context

Scene Context allows easy access to app managers and scene elements. All the logic to modify, edit, display, create spritesheet or lora for vrms rest within these managers, and using Scene Context is an easy way to fetch all the logic:


**Managers**

- `characterManager` This is is the most important manager, with it, you can load manifests and add or remove traits, download current selection etc. All the options can be found within `CharacterManager` class docs.

- `animationManager` `lookAtManager` Born from `characterManager` this classes allows to set wether the character follows the mouse, and apply animations to current loaded character.

- `loraDataGenerator` allows access to functions to create lora data with existing loraManifests.

- `spriteAtlasGenerator` allows access to functions to create sprites, spritesheets and gifs with a given manifest or directly providing the required parameters for the functions.


**Scene Functions**

- `sceneElements` all elements that are **not** part of the current selected character. Cane be displayed or hidden with `showEnvironmentModels(display)` function

- `scene` scene containing `sceneElements` and current character from `characterManager`

- `camera` camera that renders the main scene.

- `controls` camera controls, you can get this to enable or disable.


**Utils**

- `manifest` character manifest that has all manifests locations for the character selection.

- `debugMode` mode that allows to see on wireframe and with a dark background, can be toggled with `toggleDebugMode(isDebug)` function.

- `moveCamera(value)` moves the camera to target position (value) with a smooth movement.