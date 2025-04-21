---
sidebar_position: 1
---

# Getting Started with Manifest Files

This guide will help you set up your first character collection for Character Studio. We'll walk through creating a manifest file that tells the studio how to display and organize your 3D models, textures, and other assets.

## What is a Manifest File?

A manifest file is like a recipe that tells Character Studio:
- Where to find your 3D models and textures
- How to organize them into categories (like body, clothing, hair)
- How they should interact with each other (like clothes covering the body)
- What colors and textures can be applied

## Creating Your First Manifest File

### Step 1: Create a New Text File

1. Open your favorite text editor (like Notepad, TextEdit, or VS Code)
2. Create a new file
3. Save it as `manifest.json` (make sure to include the `.json` extension)

### Step 2: Basic Structure

Copy and paste this basic structure into your file:

```json
{
  "assetsLocation": "/character-assets",
  "traitsDirectory": "/your-collection/",
  "thumbnailsDirectory": "/your-collection/",
  "format": "vrm",
  "displayScale": 1.0,
  "traits": []
}
```

### Step 3: Organize Your Files

Create these folders in your project:
```
character-assets/
└── your-collection/
    ├── BODY/
    │   ├── female.vrm
    │   └── female.png
    ├── CLOTHING/
    │   ├── dress.vrm
    │   └── dress.png
    ├── HAIR/
    │   ├── long.vrm
    │   └── long.png
    └── icons/
        └── body.svg
```

### Step 4: Add Your First Trait

Let's add a body trait. Replace the empty `"traits": []` with:

```json
"traits": [
  {
    "trait": "BODY",
    "name": "Body",
    "iconSvg": "icons/body.svg",
    "cullingLayer": 0,
    "cameraTarget": {
      "distance": 0.75,
      "height": 1.35
    },
    "collection": [
      {
        "id": "FEMALE",
        "name": "Female",
        "directory": "BODY/female.vrm",
        "thumbnail": "BODY/female.png"
      }
    ]
  }
]
```

### Step 5: Add More Traits

Add clothing and hair traits following the same pattern:

```json
"traits": [
  {
    "trait": "BODY",
    "name": "Body",
    "iconSvg": "icons/body.svg",
    "cullingLayer": 0,
    "cameraTarget": {
      "distance": 0.75,
      "height": 1.35
    },
    "collection": [
      {
        "id": "FEMALE",
        "name": "Female",
        "directory": "BODY/female.vrm",
        "thumbnail": "BODY/female.png"
      }
    ]
  },
  {
    "trait": "CLOTHING",
    "name": "Clothing",
    "iconSvg": "icons/clothing.svg",
    "cullingLayer": 1,
    "cameraTarget": {
      "distance": 1.0,
      "height": 1.0
    },
    "collection": [
      {
        "id": "DRESS",
        "name": "Dress",
        "directory": "CLOTHING/dress.vrm",
        "thumbnail": "CLOTHING/dress.png"
      }
    ]
  },
  {
    "trait": "HAIR",
    "name": "Hair",
    "iconSvg": "icons/hair.svg",
    "cullingLayer": 2,
    "cameraTarget": {
      "distance": 0.5,
      "height": 1.5
    },
    "collection": [
      {
        "id": "LONG",
        "name": "Long",
        "directory": "HAIR/long.vrm",
        "thumbnail": "HAIR/long.png"
      }
    ]
  }
]
```

### Step 6: Add Colors and Textures

Add color, texture and decal options

```json
"colorCollections": [
  {
    "trait": "HAIR_COLORS",
    "collection": [
      {
        "id": "BLACK",
        "name": "Black",
        "value": ["#000000"]
      },
      {
        "id": "BROWN",
        "name": "Brown",
        "value": ["#8B4513"]
      }
    ]
  }
],
"textureCollections": [
  {
    "trait": "CLOTH_COLORS",
    "collection": [
      {
        "id": "LIGHT",
        "name": "Light",
        "directory": "textures/skin_light.png",
        "thumbnail": "textures/skin_light_thumb.png"
      },
      {
        "id": "MEDIUM",
        "name": "Medium",
        "directory": "textures/skin_medium.png",
        "thumbnail": "textures/skin_medium_thumb.png"
      }
    ]
  }
],
"decalCollections": [
  {
    "trait": "TATTOOS",
    "collection": [
      {
        "id": "TATTOO",
        "name": "tattoo",
        "directory": "decals/tattoo.png",
        "thumbnail": "decals/tattoo.png"
      },
      {
        "id": "TATTOO_2",
        "name": "tattoo 2",
        "directory": "decals/tattoo_2.png",
        "thumbnail": "decals/tattoo_2.png"
      }
    ]
  }
]
```
### Step 7: Connect to model traits

Go back to traits and connect decals to desired trait model, example:
```json
{
  "id": "FEMALE",
  "name": "Female",
  "directory": "BODY/female.vrm",
  "thumbnail": "BODY/female.png",
  "textureCollection":"SKIN_TONES",
  "decalCollection":"TATTOOS"
}
...
{
  "id": "DRESS",
  "name": "Dress",
  "directory": "CLOTHING/dress.vrm",
  "thumbnail": "CLOTHING/dress.png",
  "colorCollection":"CLOTH_COLORS",
}

```

### Step 8: Save and Test

1. Save your `manifest.json` file
2. Place it in your `character-assets` folder
3. Load it in Character Studio to test

## Adding Your Collection to Character Studio

Now that you've created your character collection manifest, you need to add it to the main manifest file that Character Studio uses to load all available collections.

### Step 1: Find the Main Manifest File

The main manifest file is located at:
```
CharacterStudio/public/manifest.json
```

### Step 2: Add Your Collection

Open the main manifest file and add your collection to the `collections` array. Here's an example:

```json
{
  "characters":[
    {
      "id": "your-collection",
      "name": "Your Collection Name",
      "description": "A brief description of your collection",
      "thumbnail": "your-collection/thumbnail.png",
      "manifest": "your-collection/manifest.json",
      "authors": ["Your Name"],
      "version": "1.0"
    }
  ]
}
```

### Step 3: Required Fields

- `id`: A unique identifier for your collection (use lowercase, no spaces)
- `name`: The display name of your collection
- `description`: A brief description of what's in your collection
- `thumbnail`: Path to your collection's thumbnail image
- `manifest`: Path to your collection's manifest file
- `authors`: Array of author names
- `version`: Version number of your collection

### Step 4: Example with Multiple Collections

Here's how the main manifest might look with multiple collections:

```json
{
  "collections": [
    {
      "id": "other-collection",
      "name": "Other Collection",
      "description": "A collection of anime-style characters",
      "thumbnail": "other/thumbnail.png",
      "manifest": "other/manifest.json",
      "authors": ["Artist Name"],
      "version": "1.0"
    },
    {
      "id": "your-collection",
      "name": "Your Collection Name",
      "description": "A brief description of your collection",
      "thumbnail": "your-collection/thumbnail.png",
      "manifest": "your-collection/manifest.json",
      "authors": ["Your Name"],
      "version": "1.0"
    }
  ]
}
```

## Additional Manifest Sections

The main manifest file (`CharacterStudio/public/manifest.json`) can include several optional sections that provide additional functionality for all character collections:

### 1. LoRAs (Low-Rank Adaptations)
This section defines how to capture images for training AI models with your characters. It includes:
- Camera angles and positions
- Lighting setups
- Background requirements
- Image resolution and format specifications

For more details, see the [LoRA Documentation](./manifest-files/vrm-to-lora.md).

### 2. Sprites
This section defines how to generate sprite sheets from your 3D characters. It includes:
- Animation sequences to capture
- Camera settings for each pose
- Output format and resolution
- Background and lighting requirements

For more details, see the [Sprite Sheet Documentation](./manifest-files/vrm-to-spritesheet.md).

### 3. Thumbnails
This section defines how to generate thumbnails for your character assets. It includes:
- Camera positions for different trait types
- Lighting setups
- Background colors
- Output resolution and format

For more details, see the [Thumbnail Documentation](./manifest-files/vrm-to-thumbnails).

### 4. Default Animations
This section provides a set of default animations that can be used by all character collections. It includes:
- Common animation sequences (idle, walk, run, etc.)
- Animation file locations
- Animation descriptions and usage notes

For more details, see the [Animation Documentation](./character-traits.md#animationpath).

## Tips for Artists

### File Organization
- Keep your files organized in clear folders
- Use descriptive names for your files
- Include thumbnails for all your 3D models
- Create simple SVG icons for each category

### 3D Models
- Export your models in VRM format
- Make sure your models are properly scaled
- Test your models in Character Studio before adding them to the manifest

### Textures and Colors
- Use PNG format for textures
- Keep texture sizes reasonable (2048x2048 is usually enough)
- Use web-safe colors for color options

### Culling Layers
- Base body should be layer 0
- Clothing should be layer 1
- Accessories should be layer 2 or higher
- Use -1 for things that shouldn't cull (like hair)

## Common Issues and Solutions

### My models don't show up
- Check if the file paths in the manifest match your folder structure
- Make sure your VRM files are properly exported
- Verify that the file names match exactly (including case)

### Textures look wrong
- Check if your texture files are in the correct format (PNG)
- Verify the texture paths in the manifest
- Make sure your UV maps are correct

### Colors don't apply
- Check if the color values are in the correct format (#RRGGBB)
- Verify that the trait IDs match between traits and color collections

### Collection doesn't appear in Character Studio
- Make sure your collection is properly added to the main manifest file
- Verify that all paths in the main manifest are correct
- Check that your collection's manifest file is in the right location

## Next Steps

1. Test your manifest with a few basic traits
2. Add more options to each category
3. Experiment with different culling layers
4. Add more color and texture options
5. Add your collection to the main manifest file
6. Explore additional manifest sections for LoRAs, sprites, and animations

For more detailed information about each field, refer to the [Character Traits Documentation](./character-traits.md). 