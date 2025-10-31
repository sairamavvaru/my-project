const http = require('http');
const https = require('https');
const fs = require('fs');
const { exec } = require('child_process');

const url = process.argv[2];
let failures = 0;

function log(msg) {
  fs.appendFileSync('health.log', `[${new Date().toISOString()}] ${msg}\n`);
}

function restartService() {
  exec('systemctl restart myapp', (error, stdout, stderr) => {
    if (error) {
      log(`Restart error: ${error.message}`);
      return;
    }
    log('Restarted service successfully');
  });
}

function check() {
  const client = url.startsWith('https') ? https : http;
  const req = client.get(url, res => {
    if (res.statusCode !== 200) {
      failures++;
      log(`Failed with status ${res.statusCode}`);
    } else {
      failures = 0;
    }

    if (failures >= 3) {
      restartService();
      failures = 0;
    }

    res.resume(); // consume data to free up memory
  });

  // ✅ Timeout handler (3 seconds)
  req.setTimeout(3000, () => {
    req.destroy(); // cancel the request
    failures++;
    log('Timeout after 3 seconds');
    if (failures >= 3) {
      restartService();
      failures = 0;
    }
  });

  req.on('error', err => {
    failures++;
    log(`Error: ${err.message}`);
    if (failures >= 3) {
      restartService();
      failures = 0;
    }
  });
}

setInterval(check, 10000);
console.log(`Checking ${url} every 10s...`);

