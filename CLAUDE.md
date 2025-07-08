# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Building and Development
- `npm run dev` - Start development server with host flag enabled
- `npm run build` - Build production version using Vite
- `npm run serve` - Preview production build locally

### Code Quality
- `npm run lint` - Run both JavaScript and Prettier linting
- `npm run lint:js` - Run ESLint on JavaScript/JSX files in src/
- `npm run lint:prettier` - Check code formatting with Prettier

### Asset Management
- `npm run get-assets` - Clone required loot-assets from GitHub into public/ directory

### Deployment
- `npm run deploy` - Deploy to GitHub Pages (runs build first)

## Development Tasks

### Project Management
- make a todo.md list and remember to update it after each task is complete

## Architecture Overview

### Core Technology Stack
- **Frontend**: React 18 with Vite build system
- **3D Graphics**: Three.js for WebGL rendering, @pixiv/three-vrm for VRM model support
- **State Management**: Zustand for application state
- **Styling**: CSS Modules and Styled Components
- **Blockchain**: Ethereum (ethers.js) and Solana (@solana/web3.js) integration
- **Audio**: Web Audio API with lip sync capabilities

### Key Architecture Components

#### CharacterManager (Core System)
Located in `src/library/characterManager.js` - This is the central class that orchestrates all character-related functionality:
- Manages 3D character models and their traits
- Handles loading, displaying, and manipulating VRM models
- Integrates with AnimationManager, EmotionManager, BlinkManager, and LookAtManager
- Provides VRM export capabilities with optimization features

#### Library Architecture (`src/library/`)
The library directory contains modular utility classes:
- **Character Management**: `vrmManager.js`, `characterManager.js`, `manifestDataManager.js`
- **Animation System**: `animationManager.js`, `blinkManager.js`, `lookatManager.js`, `lipsync.js`
- **Export/Import**: `VRMExporter.js`, `VRMExporterv0.js`, `load-utils.js`, `download-utils.js`
- **Optimization**: `merge-geometry.js`, `cull-mesh.js`, `create-texture-atlas.js`
- **Media Generation**: `screenshotManager.js`, `thumbnailsGenerator.js`, `spriteAtlasGenerator.js`
- **Blockchain**: `solanaManager.js`, `mint-utils.js`, `walletCollections.js`

#### Context-Based State Management
React contexts manage different application domains:
- `SceneContext` - 3D scene and rendering state
- `ViewContext` - UI view modes and navigation
- `AccountContext` - User authentication and wallet integration
- `AudioContext` - Audio playback and recording
- `LanguageContext` - Internationalization

#### Asset Management System
- Assets are loaded from `/public/` directory structure
- Manifest-driven asset loading with `manifest.json` files
- Support for multiple asset collections (loot-assets, FUMO, milady, etc.)
- Texture atlasing and optimization for performance

### Key Features Implementation

#### VRM Model Pipeline
1. **Loading**: VRM models loaded via VRMLoaderPlugin
2. **Customization**: Trait-based system for mixing and matching components
3. **Animation**: Mixamo animation integration with bone remapping
4. **Export**: Optimized VRM export with texture atlasing and mesh merging
5. **Optimization**: One-click optimization reducing models to single draw calls

#### Blockchain Integration
- Multi-chain support (Ethereum via Web3-React, Solana via @solana/web3.js)
- NFT trait verification and ownership checking
- Batch generation and minting capabilities
- Integration with Metaplex for Solana NFTs

#### Performance Optimizations
- Automatic face culling system for hidden meshes
- Texture atlas generation to reduce draw calls
- Mesh merging for optimized rendering
- KTX2 texture compression support

## Development Setup Notes

### Required Assets
The application requires external assets to function properly. Run `npm run get-assets` to clone the required loot-assets repository into the public directory.

### Environment Variables
The application uses `VITE_ASSET_PATH` environment variable for asset path configuration.

### Development Server
The development server runs with `--host` flag enabled for network access, useful for testing on mobile devices.

### Build Configuration
- Uses Vite with React SWC plugin for fast builds
- Output directory is configured to `./build` for GitHub Pages compatibility
- Buffer polyfill is configured for blockchain libraries

## Testing and Quality Assurance

### Linting Setup
- ESLint configured with React and import plugins
- Prettier integration for consistent code formatting
- No-inline-styles plugin enforces CSS Modules usage

### Code Organization
- Component-based architecture with CSS Modules
- Separation of concerns between UI components and business logic
- Utility functions centralized in library directory