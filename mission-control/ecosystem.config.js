module.exports = {
  apps: [{
    name: 'mission-control',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/root/.openclaw/workspace/mission-control',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }],
};
