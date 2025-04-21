# Batch Manifest

To Access this menu, go to `Batch Download` button, then `Manifest - Load by manifest`

**Summary**

The `Batch Manifest` component allow users to drag and drop one or mutliple `manifest` files.
Once the manifests are added, for each manifest dropped, user has 2 options that will appear on the lower right corner of th screen:

***Download VRM***
The user can batch the process to download a vrm with the `initialTraits` defined in each manifest ( traits will be randomly selected from the trait options of that manifest ). This will download a vrm model for each manifest uploaded

***Get preview image***
The user can batch the process to download a preview image with the `initialTraits` defined in each manifest ( same as before traits will be randomly selected from the trait options of that manifest ). The process will create a medium shot image with the character using the random chosen intital traits and download it.

*Important note* 
If multiple images/files are not being downloaded, browser might not support/allow this feature. Please switch to a web browser that support this feature (Chrome), or allow it on your current browser

**Logic**

For this component we want the user to be able to drag and drop a file with `FileDropComponent` and detect wether the user dropped Manifest file (.json), animation file (.fbx) or .vrm file to start the batch download process accodrdingly.

**Pre-process Functions:**

- `handleFilesDrop`: Function to detect wether the user dropped a manifest, animation, or vrm file(s).

- `handleJsonDrop`: User dropped a manifest file, save the manifest file(s) as an object(s) so its ready to load its content.

- `handleVRMDrop`: User dropped a VRM file, load the vrm file into the current view. (if multiple files are added, only the first one will be used)

- `handleAnimationDrop`: User dropped an animation file, load the animation into the current displayed character, if no vrm or manifest has been added, this will have no effect. (if multiple files are added, only the first one will be used)


**Process Functions:**

- `download`: Start batch download process for all the manifest previously added (this function must be called only if user added at least 1 manifest file)

- `downloadImage`: Start batch download process for all preview images of the laoded manifests (this function must be called only if user added at least 1 manifest file)

- `getOptions`: Set the options that will be used for the downloaded character

- `downloadVRMWithIndex`: Download a vrm file, or the image, given a the manifest index.


**Util Functions:**

- `clickDebugMode`: Enter febug mode (Will only display if user already laoded a model)

- `back`: Go to the previous menu 
