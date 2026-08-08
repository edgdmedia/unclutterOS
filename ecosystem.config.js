module.exports = {
  apps: [
    {
      name: 'unclutter-os-api',
      script: './apps/api/dist/main.js',
      cwd: '/home/unclutter/domains/os.unclutter.com.ng/app',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
    },
  ],
};
