# Screenshot Manager

`ScreenshotManager` is responsible for capturing screenshots with various framing options within a Three.js scene.

## Constructor

### ScreenshotManager(characterManager, scene)

- `characterManager`: The character manager instance.
- `scene`: The Three.js scene to capture screenshots from.

## Properties

Properties for `ScreenshotManager` are not meant to be edited directly they are modified with methods.

- `.renderer`

  The WebGL renderer for capturing screenshots.

- `.scene: Scene`

  The Three.js scene.

- `.characterManager: CharacterManage`

  The character manager instance.

- `.camera: PerspectiveCamera`

  The camera used for capturing screenshots.

- `.textureLoader: TextureLoader`

  The texture loader for loading textures.

- `.sceneBackground: Color`

  The background color of the scene.

- `.sceneBackgroundAlpha: Number*`

  The alpha value for the scene background.

- `.frameOffset: Object`

  - `min`: Minimum offset for framing.
  - `max`: Maximum offset for framing.

- `.usesBackgroundImage: Boolean`

  Flag indicating whether a background image is used.

- `.backgroundMaterial: MeshBasicMaterial*`

  Material for the background plane.

- `.backgroundPlane: Mesh*`

  Plane used for the background.

- `.pixelRenderer: PixelRenderer`

  Pixel renderer instance for rendering pixels.

- `.boneOffsets: Object`

  Offset values for specific bones.

## Methods

### `setScene(scene)`

Sets the Three.js scene.

- `scene`: The new scene.

### `setupCamera(cameraPosition, lookAtPosition, fieldOfView = 30)`

Sets up the camera.

- `cameraPosition`: Position of the camera.
- `lookAtPosition`: Position to look at.
- `fieldOfView` (optional): Field of view for the camera.

### `frameCloseupShot()`

Frames a close-up shot.

### `frameMediumShot()`

Frames a medium shot.

### `frameCowboyShot()`

Frames a cowboy shot.

### `frameFullShot()`

Frames a full shot.

### `frameShot(minBoneName, maxBoneName, cameraPosition = null, minGetsMaxVertex = false, maxGetsMaxVertex = true)`

Frames a shot between two bones.

- `minBoneName`: Name of the bone representing the minimum point.
- `maxBoneName`: Name of the bone representing the maximum point.
- `cameraPosition` (optional): Position of the camera.
- `minGetsMaxVertex`: Whether the minimum bone gets the max vertex.
- `maxGetsMaxVertex`: Whether the maximum bone gets the max vertex.

### `setBottomFrameOffset(min)`

Sets the bottom frame offset.

- `min`: Minimum offset value.

### `setTopFrameOffset(max)`

Sets the top frame offset.

- `max`: Maximum offset value.

### `setCameraFrameWithName(shotName, vectorCameraPosition)`

Sets the camera frame based on a shot name.

- `shotName`: Name of the shot (e.g., "fullShot").
- `vectorCameraPosition`: Position of the camera.


### `positionCameraBetweenPoints(vector1, vector2, cameraPosition, fieldOfView = 30)`

Positions the camera between two points.

- `vector1`: First vector point.
- `vector2`: Second vector point.
- `cameraPosition`: Position of the camera.
- `fieldOfView` (optional): Field of view for the camera.

### `setCamera(headPosition, playerCameraDistance, fieldOfView = 30)`

Sets up the camera for capturing screenshots.

- `headPosition`: Position of the character's head.
- `playerCameraDistance`: Distance from the head for the camera.
- `fieldOfView` (optional): Field of view for the camera.

### `setBackground(background)`

Sets the background using either color or image.

- `background`: If an array, assumed to be RGB values [r, g, b].
               If a string, assumed to be a URL for the background image.

### `setBackgroundColor(r, g, b, a)`

Sets the background color.

- `r`: Red component.
- `g`: Green component.
- `b`: Blue component.
- `a`: Alpha component.

### `setBackgroundImage(url)`

Sets the background image.

- `url`: URL of the background image.

### `savePixelScreenshot(imageName, width, height, pixelSize)`

Saves a pixelated screenshot.

- `imageName`: Name of the screenshot.
- `width`: Width of the screenshot.
- `height`: Height of the screenshot.
- `pixelSize`: Size of the pixels.

### `saveScreenshot(imageName, width, height)`

Saves a regular screenshot.

- `imageName`: Name of the screenshot.
- `width`: Width of the screenshot.
- `height`: Height of the screenshot.

### `getScreenshotImage(width, height)`

Gets the screenshot as an image.

- `width`: Width of the screenshot.
- `height`: Height of the screenshot.

### `getScreenshotTexture(width, height)`

Gets the screenshot as a Three.js texture.

- `width`: Width of the screenshot.
- `height`: Height of the screenshot.

### `getScreenshotBlob(width, height)`

Gets the screenshot as a Blob.

- `width`: Width of the screenshot.
- `height`: Height of the screenshot.

### `saveFile(strData, filename)`

Saves a file.

- `strData`: Data to save.
- `filename`: Name of the file.