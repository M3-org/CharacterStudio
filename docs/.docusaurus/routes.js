import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/characterstudio-docs/__docusaurus/debug',
    component: ComponentCreator('/characterstudio-docs/__docusaurus/debug', '6d3'),
    exact: true
  },
  {
    path: '/characterstudio-docs/__docusaurus/debug/config',
    component: ComponentCreator('/characterstudio-docs/__docusaurus/debug/config', 'a47'),
    exact: true
  },
  {
    path: '/characterstudio-docs/__docusaurus/debug/content',
    component: ComponentCreator('/characterstudio-docs/__docusaurus/debug/content', 'c36'),
    exact: true
  },
  {
    path: '/characterstudio-docs/__docusaurus/debug/globalData',
    component: ComponentCreator('/characterstudio-docs/__docusaurus/debug/globalData', '597'),
    exact: true
  },
  {
    path: '/characterstudio-docs/__docusaurus/debug/metadata',
    component: ComponentCreator('/characterstudio-docs/__docusaurus/debug/metadata', '93c'),
    exact: true
  },
  {
    path: '/characterstudio-docs/__docusaurus/debug/registry',
    component: ComponentCreator('/characterstudio-docs/__docusaurus/debug/registry', '6f1'),
    exact: true
  },
  {
    path: '/characterstudio-docs/__docusaurus/debug/routes',
    component: ComponentCreator('/characterstudio-docs/__docusaurus/debug/routes', '33d'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog',
    component: ComponentCreator('/characterstudio-docs/blog', '108'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/archive',
    component: ComponentCreator('/characterstudio-docs/blog/archive', 'c58'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/first-blog-post',
    component: ComponentCreator('/characterstudio-docs/blog/first-blog-post', '0b4'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/greetings',
    component: ComponentCreator('/characterstudio-docs/blog/greetings', '7e4'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/long-blog-post',
    component: ComponentCreator('/characterstudio-docs/blog/long-blog-post', '89a'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/mdx-blog-post',
    component: ComponentCreator('/characterstudio-docs/blog/mdx-blog-post', '807'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/tags',
    component: ComponentCreator('/characterstudio-docs/blog/tags', 'be3'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/tags/docusaurus',
    component: ComponentCreator('/characterstudio-docs/blog/tags/docusaurus', '19c'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/tags/facebook',
    component: ComponentCreator('/characterstudio-docs/blog/tags/facebook', '16b'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/tags/greetings',
    component: ComponentCreator('/characterstudio-docs/blog/tags/greetings', '473'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/tags/hello',
    component: ComponentCreator('/characterstudio-docs/blog/tags/hello', 'c1f'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/tags/hola',
    component: ComponentCreator('/characterstudio-docs/blog/tags/hola', 'c26'),
    exact: true
  },
  {
    path: '/characterstudio-docs/blog/welcome',
    component: ComponentCreator('/characterstudio-docs/blog/welcome', '922'),
    exact: true
  },
  {
    path: '/characterstudio-docs/markdown-page',
    component: ComponentCreator('/characterstudio-docs/markdown-page', 'fb9'),
    exact: true
  },
  {
    path: '/characterstudio-docs/docs',
    component: ComponentCreator('/characterstudio-docs/docs', '8e1'),
    routes: [
      {
        path: '/characterstudio-docs/docs',
        component: ComponentCreator('/characterstudio-docs/docs', 'de9'),
        routes: [
          {
            path: '/characterstudio-docs/docs',
            component: ComponentCreator('/characterstudio-docs/docs', 'd43'),
            routes: [
              {
                path: '/characterstudio-docs/docs/about',
                component: ComponentCreator('/characterstudio-docs/docs/about', '815'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Contexts/audio-context',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Contexts/audio-context', '30d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Contexts/language-context',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Contexts/language-context', '1c8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Contexts/scene-context',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Contexts/scene-context', 'd47'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Contexts/sound-context',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Contexts/sound-context', 'cf3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Contexts/view-context',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Contexts/view-context', '544'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Managers/animation-manager',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Managers/animation-manager', '82d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Managers/blink-manager',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Managers/blink-manager', 'd0e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Managers/character-manager',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Managers/character-manager', 'f17'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Managers/look-at-manager',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Managers/look-at-manager', '5f4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Managers/lora-data-generator',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Managers/lora-data-generator', 'e7b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Managers/screenshot-manager',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Managers/screenshot-manager', 'e02'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Managers/sprite-atlas-generator',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Managers/sprite-atlas-generator', 'eb5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/overview',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/overview', 'dc4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/appearance',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/appearance', '59d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/batch-download',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/batch-download', '024'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/batch-manifest',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/batch-manifest', '457'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/bio',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/bio', 'e50'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/claim',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/claim', '672'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/create',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/create', '26e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/landing',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/landing', '29b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/load',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/load', 'e60'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/mint',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/mint', '518'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/optimizer',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/optimizer', 'ee3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/save',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/save', 'eb6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/view',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/view', '034'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/Pages/wallet',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/Pages/wallet', '236'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Developers/sdk',
                component: ComponentCreator('/characterstudio-docs/docs/Developers/sdk', '4e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/General/create-an-avatar',
                component: ComponentCreator('/characterstudio-docs/docs/General/create-an-avatar', 'ed4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/General/optimize-avatars',
                component: ComponentCreator('/characterstudio-docs/docs/General/optimize-avatars', '6be'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/history',
                component: ComponentCreator('/characterstudio-docs/docs/history', 'b21'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/getting-started',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/getting-started', '46e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/manifest-files/ai-personalities',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/manifest-files/ai-personalities', '5f3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/manifest-files/character-animations',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/manifest-files/character-animations', '078'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/manifest-files/character-select',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/manifest-files/character-select', 'd60'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/manifest-files/character-traits',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/manifest-files/character-traits', '0d9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/manifest-files/generate-manifest-files',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/manifest-files/generate-manifest-files', 'cdc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/manifest-files/overview',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/manifest-files/overview', '6dc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/manifest-files/vrm-to-lora',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/manifest-files/vrm-to-lora', '227'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/manifest-files/vrm-to-spritesheet',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/manifest-files/vrm-to-spritesheet', '820'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/manifest-files/vrm-to-thumbnails',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/manifest-files/vrm-to-thumbnails', '617'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/Modders/process-avatars',
                component: ComponentCreator('/characterstudio-docs/docs/Modders/process-avatars', '397'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/characterstudio-docs/docs/quickstart',
                component: ComponentCreator('/characterstudio-docs/docs/quickstart', '45f'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/characterstudio-docs/',
    component: ComponentCreator('/characterstudio-docs/', 'bdf'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
