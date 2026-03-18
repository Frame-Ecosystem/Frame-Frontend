import nextPlugin from "eslint-config-next"

const config = [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  ...nextPlugin,
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]

export default config
