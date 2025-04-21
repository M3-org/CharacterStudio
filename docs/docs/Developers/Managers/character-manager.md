# Character Manager

Character Manager is the main manager for the character studio, it provides functions to load manifests and traits within your three.js application

## Constructor

### CharacterManager( parameters : Object )

- **parameters** 

(optional) an object with one or more properties defining the initial setup nfor the characterManager instance.

`parentModel` : The target Three js Object3D that.

`renderCamera` : Required if want to be able to allow manual face culling, so user can click to hide or show hidden faces with mouse click.

`manifestURL` : Optional initial manifest to be loaded with the character manager.

## Properties

- `.rootModel : Object3D`

root model that will hold all the character related elements and additional data that is not required to download with the character

- `.characterModel : Object3D`

Models specifically used for the character model, additional decoration or environment elements are not included in this object

- `.parentModel : Object3D`

Parent model that can be provided by the user were the root model will be loaded. Parent model may include additional decoration elements.

- `.lipSync : LipSync`

A lip sync manager to allow an easy way to play audio into the character.

- `.lookAtManager : LookAtManager`

A look at manager to allow character follow mouse position in the screen.

- `.animationManager : AnimationManager`

Animation manager to load and play different animations, it coordinates and plays the animation for all loaded traits.

- `.screenshotManager : ScreenshotManager`

A screenshot manager to take pictures of the character in different angles.
      
- `.blinkManager : BlinkManager`

A blink manager to coordinate blink animation in all loaded traits

- `.renderCamera : Camera`

Render camera used in the three js scene where user sees the character. Its only needed if you want to allow the user to allow manual face culling.

- `.manifestData : CharacterManifestData`

The character manifest data Class object that allows to fetch screenshots, urls, layers textures etc. from the loaded manifest.json. Its a class that has the final processed data in an easier way to read for the characterManager.

- `.avatar : Object`

Different from characterModel, this object holds information of the loaded character, such as loaded trait names, trait IDs and models. 

- `.traitLoadManager : TraitLoadingManager`

Custom Loader class to load one or multiple traits into the current character

- `.vrmHelperRoot : Group`

VRM helper root object to help with debugging colliders and spring bones (wip)


## Methods

### `update()`

Must be called within you update function in three js to update LookAt Manager.

### `addLookAtMouse(screenPrecentage, canvasID, camera, enable = true)`

Adds a LookAtManager for mouse interaction.

- `screenPrecentage`: Percentage of the screen area to consider for mouse interaction.
- `canvasID`: The ID of the canvas element.
- `camera`: The camera used in the scene.
- `enable`: Optional parameter to enable/disable the mouse interaction (default is true).

### `toggleCharacterLookAtMouse(enable)`

Toggles character lookAt mouse interaction.

- `enable`: Boolean value to enable/disable character lookAt mouse interaction.

### `savePortraitScreenshot(name, width, height, distance = 1, headHeightOffset = 0)`

Saves a portrait screenshot.

- `name`: The name of the screenshot.
- `width`: The width of the screenshot.
- `height`: The height of the screenshot.
- `distance`: Optional parameter for camera distance (default is 1).
- `headHeightOffset`: Optional parameter for head height offset (default is 0).

### `cameraRaycastCulling(mouseX, mouseY, removeFace = true)`

Performs camera raycast culling.

- `mouseX`: X-coordinate of the mouse.
- `mouseY`: Y-coordinate of the mouse.
- `removeFace`: Optional parameter to remove faces (default is true).

### `removeCurrentCharacter()`

Removes the current character.

### `removeCurrentManifest()`

Removes the current manifest, character, and associated animations.

### `canDownload()`

Checks if downloading is supported based on manifest data.

### `downloadVRM(name, exportOptions = null)`

Downloads the VRM file.

- `name`: The name of the VRM file.
- `exportOptions`: Additional export options (optional).

### `downloadGLB(name, exportOptions = null)`

Downloads the GLB file.

- `name`: The name of the GLB file.
- `exportOptions`: Additional export options (optional).

### `getAvatarSelection()`

Gets information about the avatar selection.

### `getGroupTraits()*`

Gets traits associated with the group from the manifest data.

### `getCurrentCharacterModel()`

Gets the current character model.

### `isTraitGroupRequired(groupTraitID)`

Checks if a trait group is marked as required in the manifest data.

- `groupTraitID`: The ID of the trait group.

### `getTraits(groupTraitID)`

Gets traits for a specific group from the manifest data.

- `groupTraitID`: The ID of the trait group.

### `getCurrentTraitID(groupTraitID)`

Gets the ID of the current trait for a specific group.

- `groupTraitID`: The ID of the trait group.

### `getCurrentTraitData(groupTraitID)`

Gets data for the current trait of a specific group.

- `groupTraitID`: The ID of the trait group.

### `getCurrentTraitVRM(groupTraitID)*`

Gets the VRM model for the current trait of a specific group.

- `groupTraitID`: The ID of the trait group.

### `setParentModel(model)`

Sets the parent model for the character manager.

- `model`: The parent model to be set.

### `setRenderCamera(camera)`

Sets the render camera for the character manager.

- `camera`: The camera to be set.

### `loadRandomTraits()`

Loads random traits based on manifest data.

### `loadRandomTrait(groupTraitID)`

Loads a random trait for a specific group based on manifest data.

- `groupTraitID`: The ID of the trait group.

### `loadTraitsFromNFT(url, fullAvatarReplace = true, ignoreGroupTraits = null)*`

Loads traits from an NFT using the specified URL.

- `url`: The URL of the NFT.
- `fullAvatarReplace`: Flag indicating whether to fully replace existing traits (default is true).
- `ignoreGroupTraits`: Optional array of trait groups to ignore.

### `loadTraitsFromNFTObject(NFTObject, fullAvatarReplace = true, ignoreGroupTraits = null)`

Loads traits from an NFT object metadata into the avatar.

- `NFTObject`: The NFT object containing traits information.
- `fullAvatarReplace`: Indicates whether to replace all avatar traits (default is true).
- `ignoreGroupTraits`: Optional array of trait groups to ignore.

### `loadInitialTraits()*`

Loads initial traits based on manifest data.

### `loadAllTraits()`

Loads all traits based on manifest data.

### `loadTrait(groupTraitID, traitID)`

Loads a specific trait based on group and trait IDs.

- `groupTraitID`: The ID of the trait group.
- `traitID`: The ID of the specific trait.

### `loadCustomTrait(groupTraitID, url)`

Loads a custom trait based on group and URL.

- `groupTraitID`: The ID of the trait group.
- `url`: The URL associated with the custom trait.
  
### `loadCustomTexture(groupTraitID, url)`

Loads a custom texture to the specified group trait's model.

- `groupTraitID`: The ID of the group trait.
- `url`: The URL of the custom texture.

### `setTraitColor(groupTraitID, hexColor)`

Sets the color of a specified group trait's model.

- `groupTraitID`: The ID of the group trait.
- `hexColor`: The hexadecimal color value to set for the group trait's model.

### `removeTrait(groupTraitID, forceRemove = false)`

Removes a trait from the character.

- `groupTraitID`: The ID of the trait group.
- `forceRemove`: Optional parameter to force removal (default is false).

### `updateCullHiddenMeshes()`

Updates the culling of hidden meshes.

### `loadOptimizerManifest()`

Loads an optimizer manifest for the character.

### `getCurrentOptimizerCharacterModel()`

Gets the current VRM model for the optimizer character.

### `loadOptimizerCharacter(url)`

Loads an optimized character based on a custom trait URL.

- `url`: The URL associated with the custom trait.

### `setManifest(manifest)`

Sets an existing manifest data for the character.

- `manifest`: The loaded manifest object.

### `appendManifest(manifest, replaceExisting)`

Appends manifest data to the current manifest.

- `manifest`: The manifest to append.
- `replaceExisting`: Boolean value indicating whether to replace existing manifest data.

### `loadManifest(url)`

Loads the manifest data for the character.

- `url`: The URL of the manifest.

### `loadAppendManifest(url, replaceExisting)*`

Loads manifest data and appends it to the current manifest.

- `url`: The URL of the manifest.
- `replaceExisting`: Boolean value indicating whether to replace existing manifest data.