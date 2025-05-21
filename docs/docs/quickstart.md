# Quickstart

Welcome to CharacterStudio! This guide will help you get the project set up and running on your local machine.

- Main repo: https://github.com/M3-org/characterstudio
- Demo: https://m3-org.github.io/CharacterStudio/

## Prerequisites

- **Node.js**: We recommend using Node.js v16. If you need to manage multiple Node.js versions, consider using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager). You can check for the latest Long-Term Support (LTS) version of Node.js for general development, but this project has been primarily tested with v16.
- **Git**: You'll need Git to clone the repository.

## Setup Steps

Follow these steps to get your development environment ready:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/M3-org/CharacterStudio
    ```

2.  **Change into the project directory:**
    ```bash
    cd CharacterStudio
    ```

3.  **Download assets:**
    This command downloads the necessary 3D model assets from an external repository into the `public/` directory. These assets are essential for the application to function correctly.
    ```bash
    npm run get-assets
    ```

4.  **Install dependencies:**
    This will install all the project dependencies. We recommend using the `--legacy-peer-deps` flag to avoid potential issues with React versioning.
    ```bash
    npm install --legacy-peer-deps
    ```
    Alternatively, you can use Yarn:
    ```bash
    yarn install
    ```

5.  **Run the development server:**
    This command starts a local development server, allowing you to see your changes live in a web browser.
    ```bash
    npm run dev
    ```
    Or with Yarn:
    ```bash
    yarn run dev
    ```

## Building for Production

When you're ready to create a production-ready build of the application, use the following command:
```bash
npm run build
```
Or with Yarn:
```bash
yarn run build
```
This will generate optimized static assets in the `dist` directory.

## Troubleshooting

- **Node.js Version**: As mentioned in the prerequisites, this project has been mainly tested with Node v16. Using `nvm` can help you switch to this version easily.
- **Custom Assets**: Copy custom asset packs to the `public/` folder. For modding or reskinning, you'll mainly need to modify files within this directory.
- **Asset Loading Issues**: If assets aren't showing up, double-check your `.env` file. You can either point to a remote host (e.g., a GitHub Pages URL like `https://m3-org.github.io/loot-assets/loot/`) or a local path in the `public` directory (e.g., `VITE_ASSET_PATH=./loot-assets`).
- **Project Name Changes**: If you change the project name, you'll also need to edit:
    - `vite.config.js`
    - `package.json`
