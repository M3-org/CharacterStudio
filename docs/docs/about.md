---                                                                                                                                  
sidebar_position: 1                                                                                                                              
toc_min_heading_level: 2
--- 

# About


An evolving and truely open 3D studio for making and optimizing VRM avatars and/or create a customized avatar builder app using your own assets.


![](/img/v2zJEiy.gif)


## Features

- **Personalized Creation**: Point and click to build 3D characters
    - Drag and drop local 3D files (VRM) and textures
    - Color picker for adding a personal touch
    - Export creatoins as glb and VRM + screenshots
- **Dynamic animation**: Variety of programmable animations
- **Effortless Optimization** One-click VRM optimizer
    - Merge skinned meshes + Texture atlassing
        - Can reduce avatars to a single draw call!
- **Batch Export**: Randomize or adhere to metadata schemas
- **Transparent Development**: Open-source MIT licensed codebase
- **Robust Rendering**: Using Three.js, WebGL, and React
    - Recently refactored to NOT need React as a dependency
    - Logic is now all inside `CharacterManager` class

## Motivation

Character creation defines the initial user experience of many open-world games. In a way crafting your 3D avatar represents the future evolution of setting up a social media profile. Today if people that want to create their own unique 3D avatar and lack maybe the time or skills to make one from scratch they have excellent options such as [VRoid Studio](https://vroid.com/en/studio) and [Ready Player Me](https://readyplayer.me/).

As advocates for collaborative research, we recognized a significant gap in the market: existing [avatar creation tools](https://hackmd.io/@XR/avatarbuilders) are often closed-source, limiting users' ability to study, improve, or customize the process. To address this limitation, we've dedicated the last couple years to provide an open-source alternative.

The people behind this project actively contribute in groups like [M3](https://m3org.com), [Metaverse Standards Forum](https://metaverse-standards.org/), and[ OMI group](https://omigroup.org/), which all focus on pushing interoperable open standards forward. Our goal is to find ways to compliment existing efforts in improving the digital avatar and wearables ecosystem. Transparency fosters trust, minimizes bias, and empowers users to fully engage in the development process.


## Installation


```bash
# Clone the repo and change directory into it
git clone https://github.com/M3-org/CharacterStudio
cd CharacterStudio

# Install dependencies with legacy peer deps flag to ignore React errors
npm install --legacy-peer-deps
npm run dev

# Or use yarn
yarn install
yarn run dev
```

## FAQ

Whether you're an artist or developer come join [M3 discord](https://m3org.com/discord) and introduce yourself and maybe share know what you're working on. As makers that build across many different platforms and game engines we all have a shared interest in interoperability.
