const http = require('http');

const data = JSON.stringify({
  userId: 'user_2xyz',
  role: 'Software Engineer',
  difficulty: 'Medium',
  duration: '15'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/interview/setup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error('Request Error:', error);
});

req.write(data);
req.end();
