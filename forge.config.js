require('dotenv').config()

module.exports = {
  packagerConfig: {
    appId: "com.avahome.ava.desktop",
    name: "Contetto",
    icon: "build/icon",
    asar: true,
    osxSign: {
      identity: "Developer ID Application",
      hardenedRuntime: true,
      'gatekeeper-assess': false
    },
    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_APP_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "Contetto",
        setupIcon: "build/icon.ico",
        setupExe: `contettoSetup.exe`,
        noMsi: true,
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: '@electron-forge/maker-dmg',
      platforms: ["darwin"],
      config: {
        background: './assets/icon/task-win.png'
      }
    },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      platforms: ['win32'],
      config: {
        repository: {
          owner: "Real-Estate-Search-AI",
          name: "ava-desktop-public",
        },
        prerelease: true,
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
  ],
};
