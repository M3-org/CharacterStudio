# Sprite Atlas Generator

`SpriteAtlasGenerator` is a class responsible for generating sprite atlases from animations specified in a manifest file.

## Constructor

### SpriteAtlasGenerator(characterManager)

- `characterManager`: An instance of the character manager containing necessary modules like `screenshotManager`, `blinkManager`, and `animationManager`.

#### Properties

Properties for `Sprite Atlas Generator` are not meant to be edited directly, they are modified with methods.

- `.characterManager: Object`

  An object containing various modules, such as `screenshotManager`, `blinkManager`, and `animationManager`.

- `.screenshotManager:`

  The screenshot manager used for capturing screenshots.

- `.blinkManager: Object`

  The blink manager used for managing blinking animations.

- `.yarnanimationManager: Object**`

  The animation manager used for loading and managing animations.

#### Methods

### `createSpriteAtlas(manifestURL)`

Creates a sprite atlas based on the specified manifest file.

- `manifestURL`: The URL of the sprite manifest file.