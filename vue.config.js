const builderOptions = {
  "productName": "AnyaMemo",
  "appId": "com.huacishu.anya.memo",
  "mac": {
    "icon": "public/icons/anya.icns",
    "target": {
      "target": "dmg",
      "arch": [
        "arm64", "x64"
      ]
    }
  },
}


module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: builderOptions,
      // List native deps here if they don't work
      //https://github.com/paulmillr/chokidar/issues/1000
      externals: ['chokidar'],
    }
  },
}
