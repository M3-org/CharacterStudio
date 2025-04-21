# Optimizer

You can access this page by going to `Optimize Character` menu button.

**Summary**

The `Optimizer` page, allows you to drag and drop an existing vrm file and add optimzation options, such as reducing meshes, manual face culling, reducing material count, and reducing file size by applying sparse accessors to expression shapes.

It uses the drag and drop component to allow the user to drop any vrm file model or animation file into the window.

**Logic**

For this component we want the user to be able to drag and drop a file with `FileDropComponent` and detect wether the user dropped an nft json file (.json), animation file (.fbx) or .vrm file to start the optimization process.

**Pre-process Functions:**

- `handleFilesDrop`: Function to detect wether the user dropped a manifest, animation, or vrm file(s).

- `handleVRMDrop`: User dropped a VRM file, load the vrm file into the current view. (if multiple files are added, only the first one will be used)

- `handleAnimationDrop`: User dropped an animation file, load the animation into the current displayed character, if no vrm or manifest has been added, this will have no effect. (if multiple files are added, only the first one will be used)

**Process Functions:**

- `download`: Start optimization and download process for current loaded character.

**Util Functions:**

- `back`: Go to the previous menu 
