# View Context

Allows navigation within the app and current active page. Viewmode just defines which page is currently active:

- [Landing](../Pages/landing.md): Iinitial Landing page with menu selection.

- [Create](../Pages/create.md): Character selection page.

- [Claim](../Pages/claim.md): Type of batch downlaod selection page.

- [Load](../Pages/load.md): Load created character selection page.

- [Appearance](../Pages/appearance.md): Character dress up and customization page.

- [Batch Download](../Pages/batch-download.md): Page to download with NFT json traits.

- [Batch Manifest](../Pages/batch-manifest.md): Page to download with manifest.

- [Bio](../Pages/bio.md): Character Bio description page.

- [Chat](../Pages/view.md): Chat with created character page.

- [Optimizer](../Pages/optimizer.md): Optimize existing VRM page.

- [Wallet](../Pages/wallet.md): Menu after connecting wallet Page.


**Functions**

- `setViewMode`: set the current view mode, access it with variable `viewMode`

- `setIsLoading`: toggle loading validation, access it with variable  `isLoading`

- `setMouseIsOverUI`: function to know if the user has the mouse inside ui, access it with variable  `mouseIsOverUI`

- `setCurrentCameraMode`: (wip) set camera type (`Normal`, `AR`, `AR_Front`, `VR`), access it with variable  `currentCameraMode`