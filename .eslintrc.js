export default {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
    ],
    "parser": "eslint-plugin-react",
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "sourceType": "module",
        "ecmaVersion": 13
    },
    "plugins": [
        "react",
        "eslint-plugin-no-inline-styles"
    ],
    "rules": {
        "no-inline-styles/no-inline-styles": 2
    }
};
