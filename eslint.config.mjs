import nextPlugin from "eslint-config-next"
import tseslintPlugin from "@typescript-eslint/eslint-plugin"
import tseslintParser from "@typescript-eslint/parser"

const config = [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  ...nextPlugin,
  {
    rules: {
      "no-unused-vars": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslintParser,
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]

export default config
