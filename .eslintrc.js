module.exports = {
    "env": {
        "node": true,
        "browser": true,
        "commonjs": true,
        "es2021": true,
        "webextensions": true,
    },
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
        'no-control-regex': [0],
        // 'no-unused-vars': [0],
    },
    "globals": {
        "buildNodes": true,
        "global": true,
        "Port": true,
        "platform": true,
        "videojs": true,
        "shortcut": true,
        "catchEvent": true,
        "cfg": true,
        "app": true,
        "readCfg": true,
        "SieveUI": true,
        "_": true,
        "ace": true,
        "onValueChange": true,
        "color_trans": true,
        "download": true,
        "$": true,
        "ImprtHandler": true,
        "js_beautify": true,
    }
}
