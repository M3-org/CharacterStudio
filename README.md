# Open Character Creator
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
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

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/lalalune"><img src="https://avatars.githubusercontent.com/u/18633264?v=4?s=100" width="100px;" alt=""/><br /><sub><b>m00n</b></sub></a><br /><a href="https://github.com/AtlasFoundation/OpenCharacterCreator/commits?author=lalalune" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/mavisakalayan"><img src="https://avatars.githubusercontent.com/u/55106546?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hayk</b></sub></a><br /><a href="https://github.com/AtlasFoundation/OpenCharacterCreator/commits?author=mavisakalayan" title="Code">💻</a> <a href="#design-mavisakalayan" title="Design">🎨</a></td>
    <td align="center"><a href="https://github.com/fire"><img src="https://avatars.githubusercontent.com/u/32321?v=4?s=100" width="100px;" alt=""/><br /><sub><b>K. S. Ernest (iFire) Lee</b></sub></a><br /><a href="#ideas-fire" title="Ideas, Planning, & Feedback">🤔</a> <a href="#research-fire" title="Research">🔬</a></td>
    <td align="center"><a href="https://github.com/intelliverse777"><img src="https://avatars.githubusercontent.com/u/103969701?v=4?s=100" width="100px;" alt=""/><br /><sub><b>intelliverse777</b></sub></a><br /><a href="https://github.com/AtlasFoundation/OpenCharacterCreator/commits?author=intelliverse777" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!