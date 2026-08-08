module = {
  apps: [
    {
      name: 'unclutter-api',
      script: './apps/api/dist/main.js',
      cwd: './apps/api',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
