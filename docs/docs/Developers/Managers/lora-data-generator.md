# LoRa Data Generator

The `LoRaDataGenerator` class is responsible for generating LoRa data based on the specified manifest file.

## Constructor

### LoraDataGenerator(characterManager)

- `characterManager`: An instance of the character manager containing necessary modules like `screenshotManager`, `blinkManager`, and `animationManager`.

#### Properties

- `.characterManager: Object`

  An object containing various modules, such as `screenshotManager`, `blinkManager`, and `animationManager`.

- `.screenshotManager: Object**`

  The screenshot manager used for capturing screenshots.

- `.blinkManager: Object`

  The blink manager used for managing blinking animations.

- `.animationManager: Object`

  The animation manager used for loading and managing animations.

#### Methods

### `createLoraData(manifestURL, baseText)`

Creates LoRa data based on the specified manifest file.

- `manifestURL`: The URL of the manifest file.
- `baseText`: The base text for generating data.
