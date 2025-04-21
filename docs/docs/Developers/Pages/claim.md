# Claim

Claim displays the menu options for batch download processes. It's the second menu element that goes by name `Batch Download` in the `Landing` page options.


**Summary**

Claim Component allows you to choose in a submenu window from `Batch Manifest` and all the options defined in the `characters-manifest.json` provided in the `.env` file. If no valid location for file is provided or not found, only `Batch Manifest` option will appear in this menu.


**Logic**

This component is just a step for selecting target manifest.


**Functions**

- `selectClass`: For each option within `manifest.json` defined in `.env` an option will be displayed to choose class and go to next component page `BatchDownload` 

- `selectByManifest`: Go to `BatchManifest` component page and allow user to drag and drop custom manifest files.


**Utils functions**

- `back`: Go back to Landing page.
