# Appearance

To Access this menu, go to `Create Character` menu button, then select any option displayed there.

***Important:*** if no option is present in this menu, you need to setup `VITE_ASSET_PATH` in the `.env` file, to point to `character manifest.json` location, and point were to fetch manifest options.

**Summary**

The `Appearance` page, allows you to load and select different character traits (models), animations, and textures, as well as entering debug mode and fine tune details on your avatar. It provides buttons based on a pre-defined `character-manifest` to dress-up and customize your character.

**Logic**

For this component, we want the user to be able to access the `characterManager` functions by providing ui buttons to select trait models or textures, play animations, and set culling layers for selected character.

**Select character functions**

- `randomize`: From loaded manifest, load a set of random traits (the traits that will be randomized are defined in the loaded manifest)

- `handleColorChange` `handleChangeComplete`: Change the color of current selected trait

- `clickDebugMode`: Display debug mode in the main window

- `selectTrait`: Select a trait from the displayed options and load it into the character

- `removeTrait`: Remove the current selected trait.

- `randomTrait`: Get a Random trait from current selected trait.

- `selectTraitGroup`: Change currently displayed trait options to selected trait group.

**Drag and drop functions**

- `handleFilesDrop` User dropped a file, detect what type it was:

- `handleAnimationDrop`: User dropped an animation, play it on the current character traits

- `handleImageDrop`: User dropped an image, apply it to the current selected Trait (works only if there is currently a selected trait)

- `handleVRMDrop`: User dropped a vrm file, load it as custom on current selected Trait (works only if there is currently a selected trait)

- `handleJsonDrop`: User dropped a json file, consider it as an nft json specification file and load all traits included in this file.

- `uploadTrait`: Actually load the vrm file that was drag and dropped by the user.

**Utils functions**

- `back`: Go back to manifest selection page.

- `next`: Go to download page.