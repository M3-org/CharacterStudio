# Wallet

(WIP) For the connect wallet button to appear, you need to setup an `open sea` api key in the `.env`, the variable must be called with the name `VITE_OPENSEA_KEY`. Once a key is placed, you can access this menu, in the main window. it will request you to connect your wallet.

**Summary**

Wallet component allows you to load nft data from owned nft assets from the connected wallet, or can be used to know if a user has an nft from a collection to unlock more options.

**Logic**

This component allows the user to fecth nft data from the user wallet, if the user possess an nft from a collection we may display additional options or to load the specific character given the nft traits in his collection.

**Wallet access**

- `fetchWalletNFTS`: Called when user enters this page, it grabs all the nft's from a give collection from the user.

- `selectClass`: If user possess 1 or more nft's from the collection, the user may select which one to display.

- `appendManifest` User may combine 2 or more owned nfts into a single manifest with this function.

**Utils functions**

- `back`: Go back to menu selection page.

