# Open Character Creator
An open, collaborative and evolving character creator project for the open metaverse.

Want to contribute? Please check out the [issues](https://github.com/AtlasFoundation/OpenCharacterCreator/issues), or submit a pull request.

# Quick Start
```bash
# Clone the repo and change directory into it
git clone https://github.com/AtlasFoundation/OpenCharacterCreator
cd OpenCharacterCreator

# Install dependencies with legacy peer deps flag to ignore React errors
npm install --legacy-peer-deps
npm run dev

# Or just use yarn
yarn install
yarn run dev
```

# Web3 Integration
OpenCharacterCreator offers a couple of web3 options (disabled by default).

You can enable Ethereum + Pinata or Internet Computer support by enabling the flags in .env

For Internet Computer support you will need to install dfx and run "dfx deploy" after installing node_modules but before running npm run dev. You can get more information on setting dfx up [here](https://internetcomputer.org/docs/current/developer-docs/ic-overview)

The TL;DR is
```
sh -ci "$(curl -fsSL https://smartcontracts.org/install.sh)"
npm install
dfx deploy
```

### Attributions
Originally based on the [three.js editor](https://threejs.org/editor/)
