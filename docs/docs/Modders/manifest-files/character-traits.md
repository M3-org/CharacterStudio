---
sidebar_position: 3
---


# Character Traits


Setting up this manifest will populate the asset trait section with your own traits that people can select from. It will also serve the character studio for cull trait model options (remove faces underneath) based on the layers, so the triangles disappear underneath the clothing for example.

![](/img/By1NZXbhT.jpg)


### Example Files

- https://github.com/memelotsqui/character-assets/blob/main/neurohacker/manifest.json
- https://github.com/M3-org/loot-assets/blob/main/loot/models/manifest.json


---

## Main Section
Includes generic and important information such as root assets location, and trait default values.

### assetsLocation
*required string*

Root location where all assets will be taken from:

Example:
```json
"assetsLocation":"./character-assets/"
```
```json
"assetsLocation":"https://memelotsqui.github.io/character-assets"
```

### traitsDirectory
*optional string*

Alternative subfolder location where your traits will be loaded from:

Example:

```json
"traitsDirectory":"/traits/"
```

Character studio will search on assetLocation + traitsDirectory: 

```./character-assets/traits/```


### thumbnailsDirectory
*optional string*

Alternative subfolder location where thumbnails for traits will be loaded from:

Example:

```json
"thumbnailsDirectory":"/traitsThumbnails/"
```

Character studio will search on assetLocation + thumbnailsDirectory: 

```./character-assets/traitThumbnails/```


### traitIconsDirectorySvg
*optional string*

Alternative subfolder location where SVG icons for traits will be loaded from:

Example:

```json
"traitIconsDirectorySvg":"/traitIcons/"
```

Character studio will search on assetLocation + traitIconsDirectorySvg: 

```./character-assets/traitIcons/```

### animationPath
*optional string array*

Animations that will played on the character for previewing, in case of using vrm traits, you may use Mecanim animations.

Example:

```json
"animationPath":["/animations/idle.fbx", "/animations/t-pose.fbx"]
```
Character studio will search on root directory + each animation path:

```./character-assets/animations/idle.fbx```

### displayScale
*optional number*

Default display scale value for character when previewing in 3d view, final model will not have this scale, default is 1

Example:
```json
"displayScale":0.7
```

### exportScale
*optional number*

Scale value for the exported model, default is 1

Example:
```json
"exportScale":0.7
```

### initialTraits
*optional object*

Initial traits that will be selected when the character is loaded. Keys are trait group IDs and values are trait IDs.

Example:
```json
"initialTraits": {
    "BODY": "Feminine",
    "CLOTHING": "Dress"
}
```

### requiredTraits
*optional string array*

Trait group names that must have at least one option selected. Trait group names are defined inside trait collections.

Example:
```json
"requiredTraits":["BODY", "CLOTHING"]
```

### randomTraits
*optional string array*

Trait group names that will be randomized when clicking randomize button. Trait group names are defined inside trait collections.

Example:
```json
"randomTraits":["CLOTHING", "HAIR"]
```

### colliderTraits
*optional string array*

Trait group names that will be considered for getting collider information from VRM file spec.

Example:
```json
"colliderTraits":["BODY"]
```

### lipSyncTraits
*optional string array*

Trait group names that will be considered for preview lip sync animation when testing.

Example:
```json
"lipSyncTraits":["BODY"]
```

### blinkerTraits
*optional string array*

Trait group names that will be considered for preview blinking animation when testing.

Example:
```json
"blinkerTraits":["BODY"]
```

### traitRestrictions
*optional type object*

Definition for what traits cannot be together with other traits or types

**restrictedTraits *(optional string array)***: What traits cannot go when this trait is selected.

**restrictedTypes *(optional string array)***: What types cannot go when this trait is selected.


Example:
```json
"traitRestrictions":{
    "CLOTHING":{
      "restrictedTraits":[],
      "restrictedTypes":["hoodie"]
    }
}
```

### typeRestrictions
*optional type object*

Definition for what types cannot be together with other types

**type object *(optional string array)***: What types cannot be selected when another type is selected.



Example:
```json
"typeRestrictions":{
    "pants":["high_boots"]
 }
```

### defaultCullingLayer
*optional number (integer)*

Default culling layer for every trait model in the collection, can be overriden by its trait group culling layer, or its directly within the trait. Default is -1. Use integers only.

Culling layers go from -1 to any number. Lowest layer number trait (starting from 0) will get culled by higher layer number trait. Layers with number -1 will be ignored in this process.

Example:
```json
"defaultCullingLayer":0
```

### defaultCullingDistance
*optional array[2] number*

Default culling distance (array of 2 numbers) for every trait model in the collection, can be overriden by its trait group culling distance, or directly within the trait. Default is [0,0].

Example:
```json
"defaultCullingDistance":[0.1,0.01]
```



### offset
*optional array[3] number*

Character position offset from origin (array of 3 numbers: x, y, z). Default is [0,0,0].

Example:
```json
"offset":[0.0,0.1,0.0]
```

### canDownload
*optional boolean*

Whether the character can be downloaded. Default is true.

Example:
```json
"canDownload": false
```

### downloadOptions
*optional object*

Includes export download options for final downloaded 3d model.

```json
"downloadOptions":{
    "scale": 0.7,
    "exportStdAtlas": true,
    "exportMtoonAtlas": true,
    "mToonAtlasSize": 2048,
    "mToonAtlasSizeTransp": 2048,
    "stdAtlasSize": 2048,
    "stdAtlasSizeTransp": 2048,
    "screenshotFaceDistance": 1.0,
    "screenshotFaceOffset": [0, 0, 0],
    "screenshotResolution": [512, 512],
    "screenshotBackground": [0.1, 0.1, 0.1],
    "screenshotFOV": 75
}
```

### vrmMeta
*optional object*

Metadata that will be saved to final VRM file after download happens.

Example:
```json
"vrmMeta":{
    "authors":["Author Name"],
    "version":"v1",
    "commercialUssageName": "personalNonProfit",
    "contactInformation": "https://example.com/", 
    "allowExcessivelyViolentUsage":false,
    "allowExcessivelySexualUsage":false,
    "allowPoliticalOrReligiousUsage":false,
    "allowAntisocialOrHateUsage":false,
    "creditNotation":"required",
    "allowRedistribution":false,
    "modification":"prohibited"
}
```

### chainName
*optional string*

Name of the blockchain chain for NFT integration.

Example:
```json
"chainName": "ethereum"
```

### collectionLockID
*optional string*

ID for locking the collection.

Example:
```json
"collectionLockID": "my-collection-123"
```

### dataSource
*optional string*

Source of the data for the collection. ("attributes", "image", "none")

Example:
```json
"dataSource": "attributes"
```

### solanaPurchaseAssets
*optional object*

Configuration for Solana purchase assets.

Example:
```json
"solanaPurchaseAssets": {
    "collectionAddress": "Add",
    "merkleTreeAddress":"AnrgANw3znNQ52TyAmBth7kqeTxbacyS8bWwezS6XP9J"
}
```

### price
*optional number*

Default price all assets of the character in the specified currency.

Example:
```json
"price": 10.99
```

### currency
*optional string*

Currency for the price.

Example:
```json
"currency": "USD"
```

### purchasable
*optional boolean*

Whether the default value of the assets is set to purchsable or not

Example:
```json
"purchasable": true
```

### locked
*optional boolean*

Whether the default value of the assets is set to locked or not

Example:
```json
"locked": false
```

___

## Trait Group Section (traits)
*required object array*

Includes trait collection and group specific information such as culling values.
Every option from below will be enclosed in an array, this is an example of a full trait option:
```json
  "traits": [
    {
      "trait": "head",
      "name": "head",
      "iconSvg": "head.svg",
      "cullingLayer":0,
      "cullingDistance":[0.01,0.001],
      "cameraTarget": {
        "distance": 0.75,
        "height": 1.35
      },
      "collection": [...]
    }
]
```

### trait
*required string*

ID for this group trait, this will be used to segment each trait groups into different types of traits

Example:

```json
"trait":"BODY"
```

### name
*required string*

Display name for this group trait. 

Example:

```json
"name":"Skin"
```

### iconSvg
*required string*

Display svg icon for this trait. This will be the icon that shows up on the left side menu when selecting traits. Location will be in:

```assetsLocation + traitIconsDirectorySvg + iconSvg```

Example:

```json
"iconSvg": "body-icon.svg"
```

### cullingLayer
*optional number (integer)*

Override for default culling layer, this setting this value will make all the traits from this collection to have this cullingLayer (Unless specific traits have a custom culling Layer)

Example:
```json
"cullingLayer":1
```

### cullingDistance
*optional array[2] number*

Override for default culling distance (array of 2 numbers) for every trait model in the collection, can be overriden by its trait group culling distance, or directly within the trait. Default is [0,0].

Example:
```json
"cullingDistance":[0.2,0.0]
```

### cameraTarget
*required object*

Where will the camera move to when this trait is selected.

**distance**: Zoom distance from the Character.

**height**: Height distance from the floor.


Example:
```json
"cameraTarget": {
    "distance": 3.0,
    "height": 0.8
}
```

### collection (traits)
*required array of objects*

An array of all the traits that will be available for this trait group.

Each element from the array represent a single trait. This will be your options in the side menu when selecting any group trait

**id *(required string)***: Unique ID for this trait (can be used by nft metadata to fetch this value by id).

**name *(required string)***: Display Name for this trait.

**directory *(required string)***: Relative location of the file model for this tait (Full location will be ```assetsLocation + traitsDirectory + directory```)

**thumbnail *(optional string)***: Relative location of the file model for this tait (Full location will be ```assetsLocation + traitsDirectory + directory```)

**cullingLayer *(optional number(integer))***: Override culling layer for this trait

**cullingDistance *(optional array[2] number)***: Override culling distance for this trait

**type *(optional array string)***: An array of type description of this trait, can be any descriptive word

**textureCollection *(optional string)***: Texture Collection ID from which user will be able to decide the texture to apply to this trait (May either choose textureCollection or colorCollection)

**colorCollection *(optional string)***: Color Collection ID from which user will be able to decide the color to apply to this trait (May either choose textureCollection or colorCollection)

Example:
```json
"collection": [
    {
          "id": "Feminine",
          "name": "Female",
          "directory": "BODY/feminine.vrm",
          "thumbnail": "BODY/feminine.png",
          "cullingLayer": 0,
          "cullingDistance": [0.3,0.001],
          "type": ["strong"],
          "textureCollection":"SKIN_TONES",
          "colorCollection":"SKIN_COLORS"
    }
]
```

**blendshapeTraits *(optional Object[])***: An array of Blendshape Trait definition. Let's you define blendshapes as traits. These blendshapes will be removed at export stage.
Note that we currently treat every blendshape trait (those defined in the manifest) as binary. I.e. they're either on or off.

```json
...
"collection": [
  {
    "id": "male",
    "name": "male",
    "directory": "Body/male.vrm",
    "thumbnail": "Body/male.png",
    "blendshapeTraits":[{      < ---------------
      "trait":"nose",
      "name":"Nose",
      "cameraTarget": {
        "distance": 0.75,
        "height": 1.5
      },
      "collection":[{
        "id":"Nose_LONG",
        "name":"Long Nose"
      }]
    }]
  }
]
```

A BlendshapeTrait Group definition has the following properties:

**trait *(string)***: Group id of the blendshape group.

**name *(string)***: Name of the blendshape group.

**cameraTarget *(optional Object)***: Define distance and height of the blendshape group.

**collection *( Array of Object)***: The Array of Blendshape traits, defined below.

> **id *(string)***: ID of the blendshape, this also has to be the exact blendshape name (case-sensitive)
>
> **name *(string)***: Name of the trait.
>
> **fullThumbnail *(optional string)***: Path to the thumbnail of that blendshape trait.




___

## Texture Collection Section (textureCollections):
Used to define a collections of textures that can be assigned to specific traits.

```json
  "textureCollections": [
    {
      "trait": "SKIN_TONES",
      "collection": [...]
    }
]
```

### collection (textures)

An array of all the textures that will be available for this texture trait id.

**id *(required string)***: Unique ID for this trait (can be used by nft metadata to fetch this value by id).

**name *(optional string)***: Display Name for this texture trait.

**directory *(required string)***: Relative location of the file texture for this tait (Full location will be ```assetsLocation + directory```)

**thumbnail *(optional string)***: Relative location of the file model for this tait (Full location will be ```assetsLocation + directory```)

```json
"collection": [
    {
          "id": "BELT_0",
          "name": "Belt 0",
          "directory": "_textureCollections/BeltOutfit3/belt_0.png",
          "thumbnail": "_textureCollections/BeltOutfit3/belt_0.png"
    }
]
```
___
## Color Collection Section (colorCollections):
Used to define a collections of colors that can be assigned to specific traits.

```json
  "colorCollections": [
    {
      "trait": "SKIN_COLORS",
      "collection": [...]
    }
]
```

### collection (colors)

An array of all the textures that will be available for this texture trait id.

**id *(required string)***: Unique ID for this color trait (can be used by nft metadata to fetch this value by id).

**name *(optional string)***: Display Name for this texture trait.

**value *(required string array)***: Color value enclosed in array.

```json
"collection": [
    {
          "id": "EMERALD",
          "name": "Emerald",
          "value":["#7BFFBA"]
    }
]
```

___

## Decal Collection Section (decalCollections):
Used to define a collections of decals that can be assigned to specific traits.

```json
  "decalCollections": [
    {
      "trait": "DECALS",
      "collection": [...]
    }
]
```

### collection (decals)

An array of all the decals that will be available for this decal trait id.

**id *(required string)***: Unique ID for this decal trait (can be used by nft metadata to fetch this value by id).

**name *(optional string)***: Display Name for this decal trait.

**directory *(required string)***: Relative location of the decal texture file.

**thumbnail *(optional string)***: Relative location of the thumbnail for this decal.

```json
"collection": [
    {
          "id": "STAR_DECAL",
          "name": "Star",
          "directory": "decals/star.png",
          "thumbnail": "decals/star_thumb.png"
    }
]
```

___
# Culling Distance

Culling distance is defined in an array of 2 numbers [outer, innner]

Outer represents how far a raycast will go outside in normal direction before it detects collision, if it collides, it means the vertex is not visible as it is blocked by another trait with higher culling layer.

Innner represents how far a raycast will go inside in normal direction before it detects collision, if it collides, it means the vertex is not visible as it is blocked by another trait with higher culling layer.

This options only affects how the trait is affected by other traits.
