const http = require('http');

http.get('http://localhost:3000/dashboard/projects', (res) => {
  console.log(`STATUS: ${res.statusCode}`);
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
