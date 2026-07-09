module.exports = {
  // Core Platform Configuration
  platform: 'github',
  endpoint: 'https://api.github.com/',

  // Guardrail: Only run on repositories explicitly listed below
  autodiscover: false,
  repositories: [
    'mistiusiu/usiu-k8s-data-science'
  ],
  hostRules: [
    {
      matchHost: 'ghcr.io',
      hostType: 'docker',
      username: 'mistiusiu', // Your GitHub username or Org name
      password: process.env.GITHUB_COM_TOKEN, // Injected securely via K8s secrets
    },
  ],

  // Dependency Configuration & Constraints
  baseBranches: ['main'], // Or 'master', depending on your default branch

  // Custom Regex Managers
  // This tells Renovate how to find and update image versions buried inside your .env files
  customManagers: [
    {
      customType: 'regex',
      fileMatch: ['.*\\.env$', '.*\\.env\\..*'], // Matches files like django-prod.env, .env.secrets, etc.
      matchStrings: [
        '# renovate: datasource=(?<datasource>.*?) depName=(?<depName>.*?)(?: versioning=(?<versioning>.*?))?\\s\\w+=(?<currentValue>.*)'
      ]
    }
  ],

  // Fine-tuning Pull Request Behavior
  prHourlyLimit: 0,       // No hourly limit on PRs so webhooks react instantly
  prConcurrentLimit: 10,  // Max 10 open PRs active at a time to prevent single-node CPU spikes
  branchConcurrentLimit: 10, // Limit concurrent branches to prevent overwhelming CI/CD pipelines
  recreateClosed: true,
  rebaseWhen: 'auto', // Valid string options: 'auto', 'always', 'conflicted', 'never'     // Recreate PRs if they get corrupted or conflicted

  // Schedule fallback if webhooks fail for any reason (runs a check silently)
  // schedule: ["before 5am on monday"],

  exposeAllEnv: true, // Expose all environment variables to PRs for better debugging and context
  allowPlugins: true, // Enable use of community plugins for extended functionality (e.g., regex managers)

  // Configuration Package Rules
  "packageRules": [
    {
      "description": "Group all minor and patch updates together to minimize PR noise, except for language/framework cores.",
      "matchUpdateTypes": ["minor", "patch"],
      "groupName": "All non-major dependencies",
      "groupSlug": "all-minor-patch",
      "excludePackagePatterns": [
        "^expo",
        "^react",
        "^react-native",
        "^eslint",
        "^vite",
        "^django"
      ]
    },
    {
      "description": "Isolate language and major framework cores so they never bundle with generic packages.",
      "matchPackageNames": ["python", "node", "django", "expo"],
      "groupName": null
    },
    {
      "description": "Group the Expo & React Native ecosystem. Expo SDK upgrades must happen synchronously to prevent app crashes.",
      "matchPackagePatterns": [
        "^expo",
        "^react-native",
        "react-native-navigation",
        "@react-native"
      ],
      "groupName": "Expo & React Native Ecosystem",
      "groupSlug": "expo-react-native-monorepo"
    },
    {
      "description": "Group React, Vite, and frontend building blocks to ensure peer dependencies align cleanly.",
      "matchPackagePatterns": [
        "^react$",
        "^react-dom$",
        "^vite",
        "@vitejs/"
      ],
      "groupName": "React & Vite Core",
      "groupSlug": "react-vite-core"
    },
    {
      "description": "Group ESLint, Prettier, and styling/linting tools to prevent breaking CI workflows piecemeal.",
      "matchPackagePatterns": [
        "^eslint",
        "^prettier",
        "^typescript",
        "@typescript-eslint"
      ],
      "groupName": "Linting & Tooling Ecosystem",
      "groupSlug": "lint-compile-tooling"
    },
    {
      "description": "Group Django/Python ecosystem utilities (like DRF, extensions, test runners) together, keeping them distinct from Node.js.",
      "matchPackagePatterns": [
        "^djangorestframework",
        "^django-cors-headers",
        "^pytest",
        "^celery"
      ],
      "groupName": "Django Ecosystem Utilities",
      "groupSlug": "django-deps"
    },
    {
      "description": "Prevent major upgrades for production databases, allow minor/patch security updates.",
      "matchPackagePatterns": [
        "^mysql",
        "^postgres",
        "^redis",
        "^mongo",
        "^mariadb"
      ],
      "matchManagers": ["docker-compose", "kubernetes"],
      "separateMajorMinor": true,
      "major": {
        "dependencyDashboardApproval": true
      }
    },
    {
      "description": "Isolate Major updates into their own un-grouped PRs so they aren't trapped by group queues.",
      "matchUpdateTypes": ["major"],
      "groupName": null,
      "maxMajorIncrement": 1
    },
    {
      "description": "Force minor/patch completion on a PER-PACKAGE basis using stability and dashboard gates.",
      "matchUpdateTypes": ["major"],
      "prCreation": "not-pending",
      "dependencyDashboardApproval": true
    }
  ]
};
