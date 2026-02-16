import nextPlugin from "eslint-config-next"

const config = [
  {
    ignores: [".next/**", "node_modules/**"],
  },
  ...nextPlugin,
  {
    rules: {
      "no-unused-vars": "error",
    },
  },
]

export default config
