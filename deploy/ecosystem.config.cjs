// pm2 process for the website. `current` is a symlink to the live release, so a reload
// starts the new build without editing this file.
module.exports = {
  apps: [
    {
      name: "spacewallah-web",
      cwd: "/var/www/spacewallah-web/current",
      script: "server.js",
      node_args: "--env-file=.env.production",
      exec_mode: "fork",
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        // Only nginx talks to Next; it is not exposed to the internet directly.
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
