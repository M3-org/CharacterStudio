---
sidebar_position: 5
---

# VRM to Spritesheet

The spritesheet generator works very similar to the LoRA generator with the exception that the image outputs are turned into an atlas alongside a gif preview. Here's a very simple example of a manifest file that can generate a spritesheet:

![](/img/simple-spritesheet-manifest.png)

![](/img/joy2.gif)

You'll most likely want a walk cycle animation for a general usecase sprite sheet that can be used in gamedev or as a fallback avatar in supported platforms.

![](/img/walk2.gif)

---

The shot sizes being used for screenshots borrow from this cheatsheet:

![](/img/shotsize-cheatsheet.png)

There's 4 different `cameraFrame` positions as referenced in `src/library/screenshotManager.js`:

```javascript
  frameCloseupShot(){
    this.frameShot("head", "head")
  }
  frameMediumShot(){
    this.frameShot("chest", "head")
  }
  frameCowboyShot(){
    this.frameShot("hips", "head")
  }
  frameFullShot(){
    this.frameShot("leftFoot", "head")
  }
```

---

## Extension Research

**WIP**

M3 is currently doing research on creating a glTF extension for spritesheets that can be used as avatars: https://hackmd.io/@XR/vrm-spritesheet. Here is a rough idea of how an implementation might look like:

```json
{
  "extensionsUsed": ["m3_spritesheet_animations"],
  "images": [
    {
      "uri": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
  ],
  "extensions": {
    "m3_spritesheet_animations": {
      "spritesheets": [
        {
          "image": 0,
          "name": "Sprite Animations",
          "dimensions": { "width": 1024, "height": 1024, "framesH": 4, "framesV": 4 },
          "frameRate": 12,
          "animations": [
            { "name": "walking", "startFrame": 0, "endFrame": 3, "loop": true },
            { "name": "jumping", "startFrame": 4, "endFrame": 7, "loop": false }
          ]
        }
      ]
    }
  }
}
```
