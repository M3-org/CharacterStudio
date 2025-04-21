# Animation Manager

Manages animations for a character, including loading, playing, and controlling animations.

## Constructor

### AnimationManager( )


#### Properties

Properties are not meant to be edited directly they are modified with methods.

  - `animationPaths`
  - `defaultAnimationPaths`
  - `lastAnimID`
  - `mainControl`
  - `animationControl`
  - `animations`
  - `paused`
  - `scale`
  - `curLoadAnim`
  - `currentAnimationName`
  - `weightIn`
  - `weightOut`
  - `lastAnimID`
  - `curAnimID`
  - `animationControls`
  - `started`
  - `mouseLookEnabled`
  - `mixamoModel`
  - `mixamoAnimations`
  - `currentClip`

## Methods

### `enableMouseLook(enable: boolean)`

Enables or disables mouse look for all animation controls.

- `enable`: *boolean* - True to enable, false to disable mouse look.

### `setScale(scale: number)`

Sets the scale for animations.

- `scale`: *number* - The scale factor for animations.

### `async loadAnimation(paths: string|string[], isPose: boolean, poseTime: number = 0, isfbx: boolean = true, pathBase: string = "", name: string = "")`

Loads an animation for the character.

- `paths`: *string|string[]* - The path or paths of the animation files.
- `isPose`: *boolean* - True if the animation is a pose, false otherwise.
- `poseTime`: *number* - The time for a pose animation (default is 0).
- `isfbx`: *boolean* - True if the animation is in FBX format, false for GLTF (default is true).
- `pathBase`: *string* - The base path for animation files (default is an empty string).
- `name`: *string* - The name of the animation (default is an empty string).

### `getCurrentClip(): THREE.AnimationClip|null`

Gets the current animation clip.

### `getCurrentAnimationName(): string`

Gets the name of the current animation.

### `clearCurrentAnimations()`

Clears the currently loaded animations and controls.

### `storeAnimationPaths(pathArray: string|string[], pathBase: string)`

Stores animation paths for future loading.

### `loadNextAnimation()`

Loads the next animation in the animation paths.

### `loadPreviousAnimation()`

Loads the previous animation in the animation paths.

### `enableScreenshot()`

Enables screenshot mode for all animation controls.

### `disableScreenshot()`

Disables screenshot mode for all animation controls.

### `addVRM(vrm: VRM)`

Adds a VRM model to the animation manager.

- `vrm`: *VRM* - The VRM model to add.

### `removeVRM(vrmToRemove: VRM)`

Removes a VRM model from the animation manager.

- `vrmToRemove`: *VRM* - The VRM model to remove.

### `getFromActionTime(): number`

Gets the "from" action time.

### `getToActionTime(): number`

Gets the "to" action time.

### `getWeightIn(): number`

Gets the weight in value.

### `getWeightOut(): number`

Gets the weight out value.

### `disposeAnimation(targetAnimControl: AnimationControl)`

Disposes of a specific animation control.

- `targetAnimControl`: *AnimationControl* - The animation control to dispose.

### `dispose()`

Disposes of all animation controls.

### `animRandomizer(yieldTime: number)`

Randomizes animations at intervals.

- `yieldTime`: *number* - The interval time for randomization.

### `pause()`

Pauses the animation manager.

### `play()`

Resumes the animation manager.

### `isPaused(): boolean`

Checks if the animation manager is paused.

### `setTime(time: number)`

Sets the current time for all animation controls.

- `time`: *number* - The time to set.

### `setSpeed(speed: number)`

Sets the playback speed for all animation controls.

- `speed`: *number* - The speed to set.
