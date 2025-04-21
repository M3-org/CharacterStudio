# LookAt Manager

`LookAtManager` is a class that manages the orientation of joints or bones in a Three.js scene, typically used for eyes and neck of a character, following the mouse movement within a defined hotzone.

## Constructor

### LookAtManager(screenViewPercentage, canvasID, camera)

- `screenViewPercentage`: Percentage of the screen width to consider for the hotzone.
- `canvasID`: The ID of the canvas element.
- `camera`: The Three.js camera.

## Properties

Properties for `ScreenshotManager` are not meant to be edited directly they are modified with methods.

- `.bonesInfo: Array`

  An array containing information about the bones being managed.

- `.curMousePos: Vector2`

  Current mouse position.

- `.hotzoneSection: Object`

  Object defining the hotzone section on the screen.

- `.enabled: Boolean`

  Flag indicating whether the look-at feature is enabled.

- `.userActivated: Boolean`

  Flag indicating whether the user has activated the look-at feature.

- `.lookInterest: Number`

  The level of interest in looking at the target.

- `.hasInterest: Boolean`

  Flag indicating whether there is an interest in looking at the target.

- `.interestSpeed: Number`

  Speed of the interest adjustment.

- `.onCanvas: Boolean`

  Flag indicating whether the mouse is on the canvas.

- `.camera: Camera`

  The Three.js camera.

- `.maxLookPercent: Object`

  Maximum percentage limits for different bones' look.

- `.windowEventListeners: Array`

  Array to store references to window event listeners.

## Methods

### `setActive(active)`

Sets the activation state of the look-at feature.

- `active`: Boolean value to set the activation state.

### `setCamera(camera)`

Sets the camera for the look-at manager.

- `camera`: The new Three.js camera.

### `addVRM(vrm)`

Adds a VRM (Virtual Reality Model) to the look-at manager.

- `vrm`: The VRM instance to be added.

### `removeVRM(vrm)`

Removes a VRM from the look-at manager.

- `vrm`: The VRM instance to be removed.

### `lerp(a, b, t)`

Performs linear interpolation between two values.

- `a`: Initial value.
- `b`: Target value.
- `t`: Interpolation factor.

### `update()`

Updates the look-at manager based on mouse movement and other settings. It adjusts the orientation of bones within the hotzone.

### `getHotzoneSection()`

Calculates and returns the hotzone section based on the screen width percentage.
