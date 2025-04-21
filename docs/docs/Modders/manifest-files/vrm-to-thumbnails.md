---
sidebar_position: 6
---

# VRM to Thumbnails

The thumbnails generator allows you to create thumbnails with the assets that will be  loaded in each trait group.

A single image for each asset will be taken and saved into disk with trait groups subdirectories. You can use these generated thumbnails to update your character manifest.json.

---

Example:


```json
{
    "poseAnimation": "/Idle.fbx",
    "animationTime":0,
    "backgroundColor":[0,0,0,0],
    "screenshotOffset":[0,0],
    "topFrameOffset":0.1,
    "bottomFrameOffset":0.1,
    "thumbnailsWidth":512,
    "thumbnailsHeight":512,
    "thumbnailsCollection":[
        {
            "traitGroup":"CLOTHING",
            "cameraPosition":"front-left",
            "cameraFrame":"mediumShot",
            "groupTopOffset":0.1,
            "groupBotomOffset":0.1
        },
        {
            "traitGroup":"HAIR",
            "cameraPosition":"front-left",
            "cameraFrame":"mediumShot",
            "groupTopOffset":0.1,
            "groupBotomOffset":0.1
        }
    ]
}
```
