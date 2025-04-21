# Blink Manager

`BlinkManager` is a class responsible for managing blinking animations for VRM models in a Three.js scene.

## Constructor

### BlinkManager(closeTime = 0.5, openTime = 0.5, continuity = 1, randomness = 5)

- `closeTime`: The time taken for the eyes to close in seconds (default is 0.5 seconds).
- `openTime`: The time taken for the eyes to open in seconds (default is 0.5 seconds).
- `continuity`: The time duration between blinks in seconds (default is 1 second).
- `randomness`: The randomness factor affecting blink occurrences (default is 5).

## Properties

Properties for `BlinkManager` are not meant to be edited directly they are modified with methods.

- `.vrmBlinkers: Array`

  An array containing VRM instances to be managed for blinking.

- `mode: String`

  The current mode of the blinker (`'ready'`, `'closing'`, or `'open'`).

- `clock: Clock`

  A Three.js clock used for timing in the blink manager.

- `closeTime: Number**`

  The time taken for the eyes to close in seconds.

- `openTime: Number`

  The time taken for the eyes to open in seconds.

- `continuity: Number`

  The time duration between blinks in seconds.

- `randomness: Number`

  The randomness factor affecting blink occurrences.

- `_eyeOpen: Number`

  A value indicating the openness of the eyes, ranging from 0 (closed) to 1 (open).

- `_blinkCounter: Number`

  A counter tracking the time since the last blink.

- `isTakingScreenShot: Boolean`

  A flag indicating whether the blinker is currently taking a screenshot.

## Methods

### `addVRM(vrm)`

Adds a VRM (Virtual Reality Model) instance to the blink manager.

- `vrm`: The VRM instance to be added.

### `removeVRM(vrm)`

Removes a VRM instance from the blink manager.

- `vrm`: The VRM instance to be removed.

### `enableScreenshot()`

Enables the screenshot mode, setting the eye openness to a threshold value and updating blinkers.

### `disableScreenshot()`

Disables the screenshot mode.

### `update()`

Periodically updates the blink manager based on the specified timings and modes. Manages the opening and closing of eyes, as well as the readiness for the next blink.