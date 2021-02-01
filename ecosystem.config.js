module.exports = {
   apps: [{
      name: 'index',
      script: 'index.js',

      // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
      args: 'one two',
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: '800M',
      env: {
         NODE_ENV: 'production'
      },
      env_production: {
         NODE_ENV: 'production'
      }
   }]
};