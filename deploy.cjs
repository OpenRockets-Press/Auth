const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.exec('cd www && git pull && php artisan migrate --force && php artisan passport:client --personal --name="Default PAT Client" || true', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).connect({
  host: 'ssh-openrocketsauth.alwaysdata.net',
  port: 22,
  username: 'openrocketsauth',
  password: 'fg6DS2!X.TQN.un'
});
