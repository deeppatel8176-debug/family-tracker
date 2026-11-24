module.exports = {
  apps: [
    {
      name: 'family-tracker-backend',
      cwd: './backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        MONGODB_URI: 'mongodb://127.0.0.1:27017/family_tracker',
      },
    },
    {
      name: 'family-tracker-admin',
      cwd: './admin-dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'family-tracker-ios-pwa',
      cwd: './ios-pwa',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
};
