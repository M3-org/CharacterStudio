# Batch Download

To Access this menu, go to `Batch Download` button, then select any other option than is not `Manifest - Load by manifest`

***Important:*** if only `Manifest - Load by manifest` option is present and there are no additional options, you need to setup `VITE_ASSET_PATH` in the `.env` file, to point to `character manifest.json` location, and point were to fetch manifest options.

**Summary**

The `Batch Download` component allow users to drag and drop one or mutliple `nft json type` (example manifest) file(s), that include the option traits that will be laoded for that specific file, and allow the user to download a VRM with the loaded options.

Once these nft json objects are added, for each json file dropped, user may preview each loaded trait by clicking the right or left arrow on the Trait Selection menu that will pop open in the right side of the screen, or download them all by clicking the download button that will appear in the lower right screen.

*Important note* 
If multiple files are not being downloaded, browser might not support/allow this feature. Please switch to a web browser that support this feature (Chrome), or allow it on your current browser

**Logic**

For this component we want the user to be able to drag and drop a file with `FileDropComponent` and detect wether the user dropped an nft json file (.json), animation file (.fbx) or .vrm file to start the batch download process accodrdingly.

**Pre-process Functions:**

- `handleFilesDrop`: Function to detect wether the user dropped a manifest, animation, or vrm file(s).

- `handleJsonDrop`: User dropped a manifest file, save the manifest file(s) as an object(s) so its ready to load its content.

- `handleVRMDrop`: User dropped a VRM file, load the vrm file into the current view. (if multiple files are added, only the first one will be used)

- `handleAnimationDrop`: User dropped an animation file, load the animation into the current displayed character, if no vrm or manifest has been added, this will have no effect. (if multiple files are added, only the first one will be used)


**Process Functions:**

- `download`: Start batch download process for all the manifest previously added (this function must be called only if user added at least 1 manifest file)

- `getOptions`: Set the options that will be used for the downloaded character

- `downloadVRMWithIndex`: Download a vrm file, or the image, given a the nft json index.


**Util Functions:**

- `back`: Go to the previous menu 
