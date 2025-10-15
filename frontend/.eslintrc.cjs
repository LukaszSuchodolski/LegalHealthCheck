const path = require("path");
const r = (p) => path.resolve(__dirname, p);

/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["import", "react"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/recommended"
  ],
  settings: {
    react: { version: "detect" },
    "import/resolver": {
      alias: {
        map: [
          ["@", r("./src")],
          ["@api", r("./src/api")],
          ["@components", r("./src/components")],
          ["@pages", r("./src/pages")],
        ],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
      node: { extensions: [".js", ".jsx", ".ts", ".tsx"] }
    }
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
    "import/no-unresolved": "error"
  }
};
