module.exports = {
  "commands": [
    "eslint",
    "prettier",
    "tsc"
  ],
  "scripts": [
    "lint",
    "lint:ci",
    "format",
    "fix",
  ],
  "default_branch": "master",
  "ignore_pattern": "yarn\\.lock|package-lock\\.json",
  "include_cached": true,
  "package_manager": "yarn"
}
