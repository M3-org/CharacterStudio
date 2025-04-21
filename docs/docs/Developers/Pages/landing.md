# Landing

The `Landing` component page is the initial page. It provides the user with options to create, optimize, load a character or connect wallet. Each option is represented by a button.


**Function Definitions**

The `Landing` function is the main component function. It uses the `useContext` hook to access the methods and values from the imported contexts. Three helper functions (`createCharacter`, `optimizeCharacter`, `loadCharacter`) are defined to handle button clicks. Each function sets a different view mode and plays a sound if the application is not muted.


**Functions**

- `createCharacter`: Go to character selection class in `Create` component page, for the user to start editing a character.
 
- `createVRMCharacter`: Moves to `Claim` component page, which allows the user to do batch download processes with different menus.

- `optimizeCharacter`: Moves to `Optimizer` component page, which allows the user to optimize an existing VRM file.

- `getWallet`: Request the user to connect his wallet and go to `Wallet` component Page.

- `loadCharacter`: Loads an existing created character from create character option, and moves to `Create` component Page.

