module.exports = {
  appId: "com.prismeditor.app",
  productName: "Prism Editor",
  directories: {
    output: "release"
  },
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["x64", "arm64"]
      },
      {
        target: "zip",
        arch: ["x64", "arm64"]
      }
    ],
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist",
    hardenedRuntime: true,
    gatekeeperAssess: false
  },
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64", "ia32"]
      }
    ]
  },
  linux: {
    target: ["AppImage", "deb", "rpm"],
    category: "Development"
  }
};
