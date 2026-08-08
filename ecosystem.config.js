module.exports = {
  apps: [
    {
      name: 'unclutter-app-api',
      script: './apps/api/dist/main.js',
      cwd: '/home/unclutter/domains/app.unclutter.com.ng/app/apps/api',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
