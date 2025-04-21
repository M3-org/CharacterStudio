# Character animations
There are 2 ways to add animations to characters:

## Default animations

The animation files are referenced via main manifest in the defaultAnimations array section. You can add as many as you want, and all the loaded characters will have these animations:

```json!
{
  "defaultAnimations":[
    {
      "name": "T-Pose",
      "description": "1_T-Pose",
      "location":"./animations/T-Pose.fbx",
      "icon": "|"
    },
    {
      "name": "Idle",
      "description": "Basic Dance Animation",
      "location":"./animations/2_Idle.fbx",
      "icon": "|"
    },
    {
      "name": "Walking",
      "description": "Basic Walk Animation",
      "location":"./animations/3_Walking.fbx",
      "icon": "|"
    },
    {
      "name": "Waving",
      "description": "Basic Waving Animation",
      "location":"./animations/4_Waving.fbx",
      "icon": "|"
    }
  ]
}
```

## Per character animations

The animation files are referenced via `animationPath` in the manifest.json file, here's an example ([source](https://github.com/M3-org/loot-assets/blob/main/loot/models/manifest.json)):

```json!
{
  "assetsLocation": "./loot-assets/",
  "format": "vrm",
  "traitsDirectory": "./models/",
  "thumbnailsDirectory": "./models/",
  "exportScale": 1,
  "animationPath": [
    "./animations/1_T-Pose.fbx",
    "./animations/2_Idle.fbx",
    "./animations/3_Walking.fbx",
    "./animations/4_Waving.fbx"
  ],
  "traitIconsDirectorySvg": "./icons/",
  "defaultCullingLayer": -1,
  "defaultCullingDistance": [
    0.1,
    0.01
  ],
...
```
Pro tip: The first animation file in the list is really important for batch processing manifest.json files when using Character Studio as a way to assemble many VRMs.

1. The first animation file is used when taking screenshots of VRMs so you can get a preview of what the collection looks like before exporting the actual files (which can take much longer).


Here the avatars are being overrided with an a-pose.fbx animation for previews:
![](/img/5erJutX.gif)


2. They're also useful during batch processing since you can load many manifest.json files and then scroll through them while it's playing the default animation. You can use this to catch clipping / weight issues faster:

![](/img/LbTte4L.gif)


We're currently using mixamo rigged animations **without skin** to retarget the VRM avatars with. You will want to check the box for `In place` whenever, otherwise your avatar will walk off screen :joy:. Check out the useful links below.

- https://www.mixamo.com/
- https://github.com/M3-org/CharacterStudio/tree/main/public/3d/animations

![Screenshot_2024-02-19_21-25-22](/img/HJMapKb36.jpg)

