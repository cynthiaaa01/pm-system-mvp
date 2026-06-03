const http = require('http');

async function testFetch() {
  const req = http.get('http://127.0.0.1:3000/dashboard/projects', (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Find the project ID from the list page
      const match = data.match(/\/dashboard\/projects\/([0-9a-f\-]{36})/);
      if (match) {
        const id = match[1];
        console.log("Found project link:", id);
        // Now fetch that project page
        http.get(`http://127.0.0.1:3000/dashboard/projects/${id}`, (res2) => {
          console.log(`PAGE STATUS: ${res2.statusCode}`);
          let pageData = '';
          res2.on('data', chunk => pageData += chunk);
          res2.on('end', () => {
            if (res2.statusCode === 404) {
              console.log("PAGE IS 404!");
            }
          });
        });
      } else {
        console.log("No project links found on the page");
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`Error: ${e.message}`);
  });
}

testFetch();
