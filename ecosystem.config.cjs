module.exports = {
  apps: [
    {
      name:        'apni-rasoi-server',
      script:      './server/index.js',
      cwd:         '/var/www/apni-rasoi',
      instances:   2,
      exec_mode:   'cluster',
      watch:       false,
      env_production: {
        NODE_ENV: 'production',
        PORT:     5000,
      },
      error_file:  '/var/log/pm2/apni-rasoi-error.log',
      out_file:    '/var/log/pm2/apni-rasoi-out.log',
      time:        true,
      max_memory_restart: '512M',
    },
  ],
};