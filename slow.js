const http = require('http');

http.createServer((req, res) => {
  // Delay the response by 10 seconds
  setTimeout(() => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK after delay');
  }, 10000);
}).listen(8080, () => {
  console.log('Slow server running on http://localhost:8080');
});
